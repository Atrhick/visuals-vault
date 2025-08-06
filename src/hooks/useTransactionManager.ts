import { useState, useCallback, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';
import { parseWalletError, WalletErrorCode } from '@/lib/wallet-errors';
import { validateTransaction } from '@/lib/security';
import { debugLog, debugError } from '@/lib/config';
import { useToast } from '@/components/ui/use-toast';

export interface TransactionRequest {
  to: string;
  value?: string | bigint;
  data?: string;
  gasLimit?: string | bigint;
  gasPrice?: string | bigint;
  maxFeePerGas?: string | bigint;
  maxPriorityFeePerGas?: string | bigint;
  nonce?: number;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'replaced' | 'cancelled';
  confirmations: number;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  timestamp: number;
  error?: string;
}

export interface GasEstimation {
  gasLimit: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: bigint;
  estimatedTime: 'slow' | 'standard' | 'fast';
}

export interface TransactionManagerOptions {
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  gasBufferPercent?: number; // Extra gas buffer percentage
  enableSpeedUp?: boolean;
  enableCancel?: boolean;
}

const DEFAULT_OPTIONS: Required<TransactionManagerOptions> = {
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 2000,
  gasBufferPercent: 10, // 10% buffer
  enableSpeedUp: true,
  enableCancel: true,
};

export const useTransactionManager = (options: TransactionManagerOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { provider, signer, chainId } = useWallet();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Map<string, TransactionStatus>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const watchersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Get current gas prices with optimization
  const getGasPrices = useCallback(async (): Promise<{
    slow: bigint;
    standard: bigint;
    fast: bigint;
    baseFee?: bigint;
  }> => {
    if (!provider) throw new Error('No provider available');
    
    try {
      const feeData = await provider.getFeeData();
      const baseFee = await provider.getBlock('latest').then(block => block?.baseFeePerGas);
      
      // EIP-1559 (Type 2) transactions
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas && baseFee) {
        const priorityFee = feeData.maxPriorityFeePerGas;
        
        return {
          slow: baseFee + (priorityFee / 2n),
          standard: baseFee + priorityFee,
          fast: baseFee + (priorityFee * 2n),
          baseFee,
        };
      }
      
      // Legacy (Type 0) transactions
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      
      return {
        slow: (gasPrice * 8n) / 10n, // 80% of current
        standard: gasPrice,
        fast: (gasPrice * 15n) / 10n, // 150% of current
      };
      
    } catch (error) {
      debugError('Failed to get gas prices:', error);
      
      // Fallback gas prices
      const fallbackGasPrice = ethers.parseUnits('20', 'gwei');
      return {
        slow: ethers.parseUnits('15', 'gwei'),
        standard: fallbackGasPrice,
        fast: ethers.parseUnits('30', 'gwei'),
      };
    }
  }, [provider]);
  
  // Estimate gas with optimization
  const estimateGas = useCallback(async (
    transaction: TransactionRequest,
    priority: 'slow' | 'standard' | 'fast' = 'standard'
  ): Promise<GasEstimation> => {
    if (!provider) throw new Error('No provider available');
    
    try {
      // Validate transaction first
      const validation = validateTransaction(transaction);
      if (!validation.valid) {
        throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Estimate gas limit
      const estimatedGasLimit = await provider.estimateGas(transaction);
      
      // Add buffer for safety
      const gasLimit = (estimatedGasLimit * BigInt(100 + config.gasBufferPercent)) / 100n;
      
      // Get current gas prices
      const gasPrices = await getGasPrices();
      
      let gasPrice: bigint | undefined;
      let maxFeePerGas: bigint | undefined;
      let maxPriorityFeePerGas: bigint | undefined;
      let estimatedCost: bigint;
      
      // Use EIP-1559 if available
      if (gasPrices.baseFee) {
        const priorityFeeMap = {
          slow: ethers.parseUnits('1', 'gwei'),
          standard: ethers.parseUnits('2', 'gwei'),
          fast: ethers.parseUnits('3', 'gwei'),
        };
        
        maxPriorityFeePerGas = priorityFeeMap[priority];
        maxFeePerGas = gasPrices.baseFee + maxPriorityFeePerGas;
        estimatedCost = gasLimit * maxFeePerGas;
      } else {
        gasPrice = gasPrices[priority];
        estimatedCost = gasLimit * gasPrice;
      }
      
      return {
        gasLimit,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        estimatedCost,
        estimatedTime: priority,
      };
      
    } catch (error) {
      debugError('Gas estimation failed:', error);
      throw parseWalletError(error);
    }
  }, [provider, config.gasBufferPercent, getGasPrices]);
  
  // Send transaction with monitoring
  const sendTransaction = useCallback(async (
    transaction: TransactionRequest,
    gasOptions?: Partial<GasEstimation>
  ): Promise<string> => {
    if (!signer) throw new Error('No signer available');
    
    setIsProcessing(true);
    
    try {
      // Get gas estimation if not provided
      const gasEstimation = gasOptions || await estimateGas(transaction);
      
      // Prepare transaction with gas settings
      const txRequest: ethers.TransactionRequest = {
        ...transaction,
        gasLimit: gasEstimation.gasLimit,
      };
      
      // Use EIP-1559 or legacy gas pricing
      if (gasEstimation.maxFeePerGas && gasEstimation.maxPriorityFeePerGas) {
        txRequest.maxFeePerGas = gasEstimation.maxFeePerGas;
        txRequest.maxPriorityFeePerGas = gasEstimation.maxPriorityFeePerGas;
        txRequest.type = 2; // EIP-1559
      } else if (gasEstimation.gasPrice) {
        txRequest.gasPrice = gasEstimation.gasPrice;
        txRequest.type = 0; // Legacy
      }
      
      debugLog('Sending transaction:', txRequest);
      
      // Send transaction
      const tx = await signer.sendTransaction(txRequest);
      
      // Initialize tracking
      const status: TransactionStatus = {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0,
        timestamp: Date.now(),
      };
      
      setTransactions(prev => new Map(prev).set(tx.hash, status));
      
      // Start monitoring
      startTransactionMonitoring(tx.hash);
      
      toast({
        title: 'Transaction Sent',
        description: `Transaction submitted: ${tx.hash.slice(0, 10)}...`,
      });
      
      return tx.hash;
      
    } catch (error) {
      const walletError = parseWalletError(error);
      debugError('Transaction failed:', walletError);
      
      toast({
        title: 'Transaction Failed',
        description: walletError.message,
        variant: 'destructive',
      });
      
      throw walletError;
    } finally {
      setIsProcessing(false);
    }
  }, [signer, estimateGas, toast]);
  
  // Monitor transaction status
  const startTransactionMonitoring = useCallback((hash: string) => {
    if (!provider) return;
    
    let attempts = 0;
    const maxAttempts = 100; // ~25 minutes with 15s intervals
    
    const monitor = async () => {
      try {
        const receipt = await provider.getTransactionReceipt(hash);
        
        if (receipt) {
          // Transaction confirmed
          const status: TransactionStatus = {
            hash,
            status: receipt.status === 1 ? 'confirmed' : 'failed',
            confirmations: receipt.confirmations,
            gasUsed: receipt.gasUsed,
            effectiveGasPrice: receipt.gasPrice,
            timestamp: Date.now(),
          };
          
          setTransactions(prev => new Map(prev).set(hash, status));
          
          // Clear watcher
          const watcher = watchersRef.current.get(hash);
          if (watcher) {
            clearInterval(watcher);
            watchersRef.current.delete(hash);
          }
          
          // Show notification
          toast({
            title: receipt.status === 1 ? 'Transaction Confirmed' : 'Transaction Failed',
            description: `${hash.slice(0, 10)}... ${receipt.status === 1 ? 'confirmed' : 'failed'}`,
            variant: receipt.status === 1 ? 'default' : 'destructive',
          });
          
          return;
        }
        
        // Check if transaction was replaced or cancelled
        try {
          const tx = await provider.getTransaction(hash);
          if (!tx) {
            setTransactions(prev => {
              const newMap = new Map(prev);
              const existing = newMap.get(hash);
              if (existing) {
                newMap.set(hash, { ...existing, status: 'replaced' });
              }
              return newMap;
            });
            
            const watcher = watchersRef.current.get(hash);
            if (watcher) {
              clearInterval(watcher);
              watchersRef.current.delete(hash);
            }
            return;
          }
        } catch (error) {
          debugError('Error checking transaction:', error);
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          // Timeout
          setTransactions(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(hash);
            if (existing) {
              newMap.set(hash, { 
                ...existing, 
                status: 'failed',
                error: 'Transaction timeout'
              });
            }
            return newMap;
          });
          
          const watcher = watchersRef.current.get(hash);
          if (watcher) {
            clearInterval(watcher);
            watchersRef.current.delete(hash);
          }
        }
        
      } catch (error) {
        debugError('Transaction monitoring error:', error);
      }
    };
    
    // Start monitoring with 15-second intervals
    const interval = setInterval(monitor, 15000);
    watchersRef.current.set(hash, interval);
    
    // Initial check after 5 seconds
    setTimeout(monitor, 5000);
  }, [provider, toast]);
  
  // Speed up transaction (replace with higher gas)
  const speedUpTransaction = useCallback(async (hash: string): Promise<string | null> => {
    if (!signer || !config.enableSpeedUp) return null;
    
    try {
      const tx = await provider?.getTransaction(hash);
      if (!tx || tx.confirmations > 0) return null;
      
      // Increase gas price by 20%
      const newGasPrice = tx.gasPrice ? (tx.gasPrice * 12n) / 10n : undefined;
      const newMaxFeePerGas = tx.maxFeePerGas ? (tx.maxFeePerGas * 12n) / 10n : undefined;
      
      const speedUpTx: ethers.TransactionRequest = {
        to: tx.to,
        value: tx.value,
        data: tx.data,
        gasLimit: tx.gasLimit,
        nonce: tx.nonce,
      };
      
      if (newMaxFeePerGas && tx.maxPriorityFeePerGas) {
        speedUpTx.maxFeePerGas = newMaxFeePerGas;
        speedUpTx.maxPriorityFeePerGas = (tx.maxPriorityFeePerGas * 12n) / 10n;
        speedUpTx.type = 2;
      } else if (newGasPrice) {
        speedUpTx.gasPrice = newGasPrice;
        speedUpTx.type = 0;
      }
      
      const newTx = await signer.sendTransaction(speedUpTx);
      
      // Mark original as replaced
      setTransactions(prev => {
        const newMap = new Map(prev);
        const original = newMap.get(hash);
        if (original) {
          newMap.set(hash, { ...original, status: 'replaced' });
        }
        return newMap;
      });
      
      // Start monitoring new transaction
      startTransactionMonitoring(newTx.hash);
      
      toast({
        title: 'Transaction Sped Up',
        description: `New transaction: ${newTx.hash.slice(0, 10)}...`,
      });
      
      return newTx.hash;
      
    } catch (error) {
      debugError('Speed up failed:', error);
      return null;
    }
  }, [signer, provider, config.enableSpeedUp, startTransactionMonitoring, toast]);
  
  // Cancel transaction (replace with 0 value to same address)
  const cancelTransaction = useCallback(async (hash: string): Promise<string | null> => {
    if (!signer || !config.enableCancel) return null;
    
    try {
      const tx = await provider?.getTransaction(hash);
      if (!tx || tx.confirmations > 0) return null;
      
      const cancelTx: ethers.TransactionRequest = {
        to: await signer.getAddress(), // Send to self
        value: 0,
        gasLimit: 21000n, // Basic transfer
        nonce: tx.nonce,
      };
      
      // Use higher gas price to ensure cancellation
      if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
        cancelTx.maxFeePerGas = (tx.maxFeePerGas * 15n) / 10n;
        cancelTx.maxPriorityFeePerGas = (tx.maxPriorityFeePerGas * 15n) / 10n;
        cancelTx.type = 2;
      } else if (tx.gasPrice) {
        cancelTx.gasPrice = (tx.gasPrice * 15n) / 10n;
        cancelTx.type = 0;
      }
      
      const newTx = await signer.sendTransaction(cancelTx);
      
      // Mark original as cancelled
      setTransactions(prev => {
        const newMap = new Map(prev);
        const original = newMap.get(hash);
        if (original) {
          newMap.set(hash, { ...original, status: 'cancelled' });
        }
        return newMap;
      });
      
      toast({
        title: 'Transaction Cancelled',
        description: `Cancellation transaction: ${newTx.hash.slice(0, 10)}...`,
      });
      
      return newTx.hash;
      
    } catch (error) {
      debugError('Cancel failed:', error);
      return null;
    }
  }, [signer, provider, config.enableCancel, toast]);
  
  // Get transaction status
  const getTransactionStatus = useCallback((hash: string): TransactionStatus | undefined => {
    return transactions.get(hash);
  }, [transactions]);
  
  // Get all transactions
  const getAllTransactions = useCallback((): TransactionStatus[] => {
    return Array.from(transactions.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);
  
  // Clear completed transactions
  const clearTransactions = useCallback(() => {
    setTransactions(new Map());
  }, []);
  
  // Cleanup watchers on unmount
  useEffect(() => {
    return () => {
      watchersRef.current.forEach(watcher => clearInterval(watcher));
      watchersRef.current.clear();
    };
  }, []);
  
  return {
    // Transaction operations
    sendTransaction,
    estimateGas,
    speedUpTransaction,
    cancelTransaction,
    
    // Gas utilities
    getGasPrices,
    
    // Status tracking
    getTransactionStatus,
    getAllTransactions,
    clearTransactions,
    
    // State
    transactions: getAllTransactions(),
    isProcessing,
    
    // Configuration
    canSpeedUp: config.enableSpeedUp,
    canCancel: config.enableCancel,
  };
};