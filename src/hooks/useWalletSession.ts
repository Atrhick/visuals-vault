import { useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import AuthService from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface UseWalletSessionOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  onSessionExpired?: () => void;
}

export const useWalletSession = (options: UseWalletSessionOptions = {}) => {
  const { requireAuth = false, redirectTo = '/', onSessionExpired } = options;
  const { isConnected, isAuthenticated, address, disconnect } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check session validity
  const checkSession = useCallback(() => {
    const session = AuthService.getSession();
    
    if (!session) {
      if (requireAuth) {
        toast({
          title: 'Authentication Required',
          description: 'Please connect your wallet to continue',
          variant: 'destructive',
        });
        navigate(redirectTo);
      }
      return false;
    }
    
    // Check if session address matches connected wallet
    if (isConnected && address && session.address.toLowerCase() !== address.toLowerCase()) {
      toast({
        title: 'Session Mismatch',
        description: 'Connected wallet does not match authenticated wallet',
        variant: 'destructive',
      });
      AuthService.clearSession();
      disconnect();
      return false;
    }
    
    return true;
  }, [isConnected, address, requireAuth, redirectTo, disconnect, toast, navigate]);
  
  // Setup session monitoring
  useEffect(() => {
    if (!requireAuth) return;
    
    const valid = checkSession();
    if (!valid) return;
    
    // Check session periodically
    const interval = setInterval(() => {
      const session = AuthService.getSession();
      if (!session) {
        onSessionExpired?.();
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please reconnect your wallet.',
          variant: 'destructive',
        });
        navigate(redirectTo);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [requireAuth, checkSession, onSessionExpired, toast, navigate, redirectTo]);
  
  // Handle wallet disconnect
  useEffect(() => {
    if (!isConnected && requireAuth) {
      AuthService.clearSession();
      navigate(redirectTo);
    }
  }, [isConnected, requireAuth, redirectTo, navigate]);
  
  return {
    isSessionValid: isAuthenticated && AuthService.isAuthenticated(),
    session: AuthService.getSession(),
    checkSession,
  };
};