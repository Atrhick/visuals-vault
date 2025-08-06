import React, { createContext, useContext, useState } from 'react';

interface WalletContextType {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  ensName: string | null;
  balance: string | null;
  chainId: string | null;
  chainName: string | null;
  walletLabel: string | null;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<boolean>;
  signMessage: (message: string) => Promise<string | null>;
  
  // Session
  isAuthenticated: boolean;
  sessionToken: string | null;
  authenticate: () => Promise<boolean>;
  logout: () => void;
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
  // Simple mock state for now
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [chainName, setChainName] = useState<string | null>(null);
  const [walletLabel, setWalletLabel] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsConnected(true);
    setAddress('0x1234567890123456789012345678901234567890');
    setWalletLabel('MetaMask');
    setChainId('0x1');
    setChainName('Ethereum Mainnet');
    setBalance('1.25');
    setIsConnecting(false);
  };

  const disconnect = async () => {
    setIsConnected(false);
    setAddress(null);
    setWalletLabel(null);
    setChainId(null);
    setChainName(null);
    setBalance(null);
    setIsAuthenticated(false);
    setSessionToken(null);
  };

  const switchChain = async (chainId: string) => {
    // Mock chain switching
    setChainId(chainId);
    return true;
  };

  const signMessage = async (message: string) => {
    // Mock message signing
    return '0xmocksignature';
  };

  const authenticate = async () => {
    if (!isConnected) return false;
    // Mock authentication
    setIsAuthenticated(true);
    setSessionToken('mock-session-token');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSessionToken(null);
  };

  const value: WalletContextType = {
    isConnected,
    isConnecting,
    address,
    ensName,
    balance,
    chainId,
    chainName,
    walletLabel,
    connect,
    disconnect,
    switchChain,
    signMessage,
    isAuthenticated,
    sessionToken,
    authenticate,
    logout,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};