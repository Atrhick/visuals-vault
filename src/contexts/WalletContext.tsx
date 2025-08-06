import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { web3Onboard, isSupportedChain, getChainName, getChainToken, addChainToWallet } from '@/lib/web3-config';
import { parseWalletError, WalletError, isUserRejection, isRecoverableError } from '@/lib/wallet-errors';
import AuthService, { type AuthSession } from '@/services/authService';
import type { WalletState, ConnectedChain } from '@web3-onboard/core';
import { useToast } from '@/components/ui/use-toast';
import { debugLog, debugError, isDevelopment } from '@/lib/config';

interface WalletContextType {
  // Connection State
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  address: string | null;
  ensName: string | null;
  balance: string | null;
  chainId: string | null;
  chainName: string | null;
  walletLabel: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  
  // Connection Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<boolean>;
  signMessage: (message: string) => Promise<string | null>;
  signTypedData: (domain: any, types: any, value: any) => Promise<string | null>;
  
  // Authentication
  isAuthenticated: boolean;
  sessionToken: string | null;
  session: AuthSession | null;
  authenticate: () => Promise<boolean>;
  logout: () => void;
  
  // Network Management
  addCustomChain: (chainConfig: any) => Promise<boolean>;
  getSupportedChains: () => any[];
  
  // Transaction Helpers
  estimateGas: (transaction: any) => Promise<bigint | null>;
  sendTransaction: (transaction: any) => Promise<string | null>;
  
  // Error State
  lastError: WalletError | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  // Connection state
  const [wallets, setWallets] = useState<WalletState[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  
  // Error state
  const [lastError, setLastError] = useState<WalletError | null>(null);
  
  // Derived state
  const primaryWallet = wallets?.[0];
  const account = primaryWallet?.accounts?.[0];
  const chain = primaryWallet?.chains?.[0];
  
  const isConnected = !!primaryWallet && !!account;
  const address = account?.address || null;
  const ensName = account?.ens?.name || null;
  const balance = account?.balance?.ETH ? 
    (() => {
      try {
        // Handle both string and bigint values safely
        const ethBalance = account.balance.ETH;
        if (typeof ethBalance === 'string') {
          // If it's already a string, check if it's a valid number
          const numValue = parseFloat(ethBalance);
          if (isNaN(numValue)) return '0';
          return numValue.toFixed(4);
        }
        // If it's a proper BigInt, use formatEther
        return ethers.formatEther(ethBalance);
      } catch (error) {
        console.warn('Error formatting balance:', error);
        return '0';
      }
    })() : null;
  const chainId = chain?.id || null;
  const chainName = chainId ? getChainName(chainId) : null;
  const walletLabel = primaryWallet?.label || null;
  
  // Clear error helper
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);
  
  // Enhanced error handling
  const handleError = useCallback((error: any, context?: string) => {
    const walletError = parseWalletError(error);
    debugError(`Wallet error${context ? ` (${context})` : ''}:`, walletError);
    setLastError(walletError);
    
    // Only show toast for non-user rejections
    if (!isUserRejection(error)) {
      toast({
        title: 'Wallet Error',
        description: walletError.message,
        variant: 'destructive',
      });
    }
    
    return walletError;
  }, [toast]);
  
  // Initialize Web3 Onboard subscriptions
  useEffect(() => {
    let mounted = true;
    
    const initializeWallet = async () => {
      try {
        const state = web3Onboard.state.select();
        const subscription = state.subscribe((update) => {
          if (mounted) {
            debugLog('Wallet state update:', update);
            setWallets(update.wallets);
          }
        });
        
        const unsubscribe = subscription?.unsubscribe || subscription;
        
        // Check for existing session and auto-reconnect
        const existingSession = AuthService.getSession();
        if (existingSession) {
          debugLog('Found existing session, attempting reconnection');
          setSession(existingSession);
          setSessionToken(existingSession.token);
          setIsAuthenticated(true);
          
          // Try to reconnect wallet silently
          try {
            setIsReconnecting(true);
            const previouslyConnectedWallets = web3Onboard.state.get().wallets;
            if (previouslyConnectedWallets.length === 0) {
              await web3Onboard.connectWallet();
            }
          } catch (error) {
            debugLog('Auto-reconnection failed:', error);
          } finally {
            setIsReconnecting(false);
          }
        }
        
        return unsubscribe && typeof unsubscribe === 'function' ? unsubscribe : () => {};
      } catch (error) {
        if (mounted) {
          handleError(error, 'initialization');
        }
        return () => {};
      }
    };
    
    const cleanup = initializeWallet();
    
    return () => {
      mounted = false;
      cleanup.then(fn => {
        if (fn && typeof fn === 'function') {
          try {
            fn();
          } catch (error) {
            console.warn('Error during cleanup:', error);
          }
        }
      }).catch(error => {
        console.warn('Error during async cleanup:', error);
      });
    };
  }, [handleError]);
  
  // Update provider and signer when wallet changes
  useEffect(() => {
    if (primaryWallet?.provider) {
      try {
        const ethersProvider = new ethers.BrowserProvider(primaryWallet.provider, 'any');
        setProvider(ethersProvider);
        
        ethersProvider.getSigner()
          .then(setSigner)
          .catch(error => handleError(error, 'signer creation'));
      } catch (error) {
        handleError(error, 'provider creation');
      }
    } else {
      setProvider(null);
      setSigner(null);
    }
  }, [primaryWallet, handleError]);
  
  // Monitor chain changes for session updates
  useEffect(() => {
    if (chainId && session) {
      AuthService.updateSessionChain(chainId);
      setSession(prev => prev ? { ...prev, chainId } : null);
    }
  }, [chainId, session]);
  
  // Connect wallet
  const connect = useCallback(async () => {
    try {
      clearError();
      setIsConnecting(true);
      
      const connectedWallets = await web3Onboard.connectWallet();
      
      if (connectedWallets.length > 0) {
        debugLog('Wallet connected:', connectedWallets[0]);
        toast({
          title: 'Wallet Connected',
          description: `Successfully connected to ${connectedWallets[0].label}`,
        });
      }
    } catch (error) {
      handleError(error, 'connection');
    } finally {
      setIsConnecting(false);
    }
  }, [toast, handleError, clearError]);
  
  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      clearError();
      
      if (primaryWallet) {
        await web3Onboard.disconnectWallet({ label: primaryWallet.label });
        toast({
          title: 'Wallet Disconnected',
          description: 'Your wallet has been disconnected',
        });
      }
      
      // Clear authentication
      logout();
    } catch (error) {
      handleError(error, 'disconnection');
    }
  }, [primaryWallet, toast, handleError, clearError]);
  
  // Switch chain with enhanced error handling
  const switchChain = useCallback(async (targetChainId: string): Promise<boolean> => {
    try {
      clearError();
      
      if (!primaryWallet) {
        throw new Error('No wallet connected');
      }
      
      if (!isSupportedChain(targetChainId)) {
        // Try to add the chain if it's not supported
        const added = await addCustomChain({ id: targetChainId });
        if (!added) {
          throw new Error('Unsupported chain and failed to add');
        }
      }
      
      const success = await web3Onboard.setChain({ chainId: targetChainId });
      
      if (success) {
        toast({
          title: 'Network Switched',
          description: `Switched to ${getChainName(targetChainId)}`,
        });
      }
      
      return success;
    } catch (error) {
      handleError(error, 'chain switch');
      return false;
    }
  }, [primaryWallet, toast, handleError, clearError]);
  
  // Sign message with enhanced error handling
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    try {
      clearError();
      
      if (!signer) {
        throw new Error('No signer available');
      }
      
      const signature = await signer.signMessage(message);
      debugLog('Message signed successfully');
      return signature;
    } catch (error) {
      handleError(error, 'message signing');
      return null;
    }
  }, [signer, handleError, clearError]);
  
  // Sign typed data
  const signTypedData = useCallback(async (domain: any, types: any, value: any): Promise<string | null> => {
    try {
      clearError();
      
      if (!signer) {
        throw new Error('No signer available');
      }
      
      const signature = await signer.signTypedData(domain, types, value);
      debugLog('Typed data signed successfully');
      return signature;
    } catch (error) {
      handleError(error, 'typed data signing');
      return null;
    }
  }, [signer, handleError, clearError]);
  
  // Enhanced authentication using AuthService
  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      clearError();
      
      if (!address || !signer || !walletLabel) {
        throw new Error('Wallet not properly connected');
      }
      
      // Generate challenge
      const challenge = AuthService.generateChallenge(address);
      
      // Sign the challenge
      const signature = await signMessage(challenge.message);
      if (!signature) {
        throw new Error('Failed to sign authentication message');
      }
      
      // Verify and create session
      const newSession = await AuthService.verifySignature(address, signature, walletLabel, chainId || undefined);
      if (!newSession) {
        throw new Error('Authentication verification failed');
      }
      
      // Update state
      setSession(newSession);
      setSessionToken(newSession.token);
      setIsAuthenticated(true);
      
      toast({
        title: 'Authentication Successful',
        description: 'You have been successfully authenticated',
      });
      
      return true;
    } catch (error) {
      handleError(error, 'authentication');
      return false;
    }
  }, [address, signer, walletLabel, chainId, signMessage, toast, handleError, clearError]);
  
  // Logout
  const logout = useCallback(() => {
    AuthService.clearSession();
    setSession(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    debugLog('User logged out');
  }, []);
  
  // Add custom chain
  const addCustomChain = useCallback(async (chainConfig: any): Promise<boolean> => {
    try {
      return await addChainToWallet(chainConfig.id);
    } catch (error) {
      handleError(error, 'add custom chain');
      return false;
    }
  }, [handleError]);
  
  // Get supported chains
  const getSupportedChains = useCallback(() => {
    return web3Onboard.state.get().chains || [];
  }, []);
  
  // Estimate gas
  const estimateGas = useCallback(async (transaction: any): Promise<bigint | null> => {
    try {
      if (!provider) {
        throw new Error('No provider available');
      }
      
      const gasEstimate = await provider.estimateGas(transaction);
      return gasEstimate;
    } catch (error) {
      handleError(error, 'gas estimation');
      return null;
    }
  }, [provider, handleError]);
  
  // Send transaction
  const sendTransaction = useCallback(async (transaction: any): Promise<string | null> => {
    try {
      clearError();
      
      if (!signer) {
        throw new Error('No signer available');
      }
      
      const tx = await signer.sendTransaction(transaction);
      debugLog('Transaction sent:', tx.hash);
      
      toast({
        title: 'Transaction Sent',
        description: 'Your transaction has been submitted to the network',
      });
      
      return tx.hash;
    } catch (error) {
      handleError(error, 'transaction');
      return null;
    }
  }, [signer, toast, handleError, clearError]);
  
  const value: WalletContextType = {
    // Connection State
    isConnected,
    isConnecting,
    isReconnecting,
    address,
    ensName,
    balance,
    chainId,
    chainName,
    walletLabel,
    provider,
    signer,
    
    // Connection Methods
    connect,
    disconnect,
    switchChain,
    signMessage,
    signTypedData,
    
    // Authentication
    isAuthenticated,
    sessionToken,
    session,
    authenticate,
    logout,
    
    // Network Management
    addCustomChain,
    getSupportedChains,
    
    // Transaction Helpers
    estimateGas,
    sendTransaction,
    
    // Error State
    lastError,
    clearError,
  };
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};