import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { debugLog, debugError } from '@/lib/config';
import { parseWalletError, WalletErrorCode } from '@/lib/wallet-errors';
import { useToast } from '@/components/ui/use-toast';

interface NetworkStatus {
  isOnline: boolean;
  isConnectedToRPC: boolean;
  latency: number | null;
  lastChecked: number;
  consecutiveFailures: number;
}

interface NetworkMonitorOptions {
  checkInterval?: number; // milliseconds
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  enableAutoReconnect?: boolean;
}

const DEFAULT_OPTIONS: Required<NetworkMonitorOptions> = {
  checkInterval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  enableAutoReconnect: true,
};

export const useNetworkMonitor = (options: NetworkMonitorOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { provider, chainId, isConnected, connect } = useWallet();
  const { toast } = useToast();
  
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnectedToRPC: false,
    latency: null,
    lastChecked: 0,
    consecutiveFailures: 0,
  });
  
  const [isReconnecting, setIsReconnecting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Check RPC connection health
  const checkRPCConnection = useCallback(async (): Promise<{ isConnected: boolean; latency: number | null }> => {
    if (!provider) {
      return { isConnected: false, latency: null };
    }
    
    try {
      const startTime = Date.now();
      await provider.getBlockNumber();
      const latency = Date.now() - startTime;
      
      debugLog(`RPC health check successful - Latency: ${latency}ms`);
      return { isConnected: true, latency };
    } catch (error) {
      debugError('RPC health check failed:', error);
      return { isConnected: false, latency: null };
    }
  }, [provider]);
  
  // Update network status
  const updateNetworkStatus = useCallback(async () => {
    const isOnline = navigator.onLine;
    const { isConnected: isConnectedToRPC, latency } = await checkRPCConnection();
    const now = Date.now();
    
    setNetworkStatus(prev => ({
      isOnline,
      isConnectedToRPC,
      latency,
      lastChecked: now,
      consecutiveFailures: isConnectedToRPC ? 0 : prev.consecutiveFailures + 1,
    }));
    
    // Trigger reconnection logic if needed
    if (!isConnectedToRPC && isOnline && config.enableAutoReconnect) {
      handleConnectionLoss();
    }
  }, [checkRPCConnection, config.enableAutoReconnect]);
  
  // Handle connection loss with exponential backoff
  const handleConnectionLoss = useCallback(async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    
    try {
      // Show warning to user
      toast({
        title: 'Network Connection Issues',
        description: 'Attempting to reconnect...',
        variant: 'destructive',
      });
      
      // Wait before attempting reconnection
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      
      // Check if we need to reconnect the wallet
      if (isConnected) {
        // Just refresh the connection
        await updateNetworkStatus();
      } else {
        // Attempt to reconnect wallet
        debugLog('Attempting wallet reconnection');
        await connect();
      }
      
      toast({
        title: 'Connection Restored',
        description: 'Network connection has been restored',
      });
      
    } catch (error) {
      const walletError = parseWalletError(error);
      debugError('Reconnection failed:', walletError);
      
      // Schedule retry with exponential backoff
      const delay = Math.min(config.retryDelay * Math.pow(2, networkStatus.consecutiveFailures), 60000);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (networkStatus.consecutiveFailures < config.maxRetries) {
          handleConnectionLoss();
        } else {
          toast({
            title: 'Connection Failed',
            description: 'Unable to restore connection. Please try manually.',
            variant: 'destructive',
          });
        }
      }, delay);
    } finally {
      setIsReconnecting(false);
    }
  }, [
    isReconnecting,
    config.retryDelay,
    config.maxRetries,
    isConnected,
    connect,
    updateNetworkStatus,
    networkStatus.consecutiveFailures,
    toast,
  ]);
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      debugLog('Browser came online');
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      updateNetworkStatus();
    };
    
    const handleOffline = () => {
      debugLog('Browser went offline');
      setNetworkStatus(prev => ({ 
        ...prev, 
        isOnline: false, 
        isConnectedToRPC: false,
        latency: null 
      }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateNetworkStatus]);
  
  // Set up periodic health checks
  useEffect(() => {
    if (!provider) return;
    
    // Initial check
    updateNetworkStatus();
    
    // Set up interval
    intervalRef.current = setInterval(updateNetworkStatus, config.checkInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [provider, updateNetworkStatus, config.checkInterval]);
  
  // Listen for provider errors
  useEffect(() => {
    if (!provider) return;
    
    const handleProviderError = (error: any) => {
      debugError('Provider error:', error);
      
      const walletError = parseWalletError(error);
      if (walletError.code === WalletErrorCode.NETWORK_ERROR || walletError.code === WalletErrorCode.RPC_ERROR) {
        setNetworkStatus(prev => ({
          ...prev,
          isConnectedToRPC: false,
          consecutiveFailures: prev.consecutiveFailures + 1,
        }));
        
        if (config.enableAutoReconnect) {
          handleConnectionLoss();
        }
      }
    };
    
    // Listen for provider errors (if supported)
    if (provider.provider && typeof provider.provider.on === 'function') {
      provider.provider.on('error', handleProviderError);
      provider.provider.on('disconnect', handleProviderError);
      
      return () => {
        if (provider.provider && typeof provider.provider.removeListener === 'function') {
          provider.provider.removeListener('error', handleProviderError);
          provider.provider.removeListener('disconnect', handleProviderError);
        }
      };
    }
  }, [provider, config.enableAutoReconnect, handleConnectionLoss]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  // Force refresh connection
  const forceRefresh = useCallback(async () => {
    await updateNetworkStatus();
  }, [updateNetworkStatus]);
  
  // Manual reconnect
  const manualReconnect = useCallback(async () => {
    if (isReconnecting) return false;
    
    try {
      setIsReconnecting(true);
      await connect();
      await updateNetworkStatus();
      return true;
    } catch (error) {
      debugError('Manual reconnection failed:', error);
      return false;
    } finally {
      setIsReconnecting(false);
    }
  }, [isReconnecting, connect, updateNetworkStatus]);
  
  return {
    networkStatus,
    isReconnecting,
    forceRefresh,
    manualReconnect,
    // Computed status
    isHealthy: networkStatus.isOnline && networkStatus.isConnectedToRPC,
    hasIssues: !networkStatus.isOnline || !networkStatus.isConnectedToRPC,
    latencyStatus: networkStatus.latency ? (
      networkStatus.latency < 500 ? 'good' : 
      networkStatus.latency < 1000 ? 'fair' : 'poor'
    ) : 'unknown',
  };
};