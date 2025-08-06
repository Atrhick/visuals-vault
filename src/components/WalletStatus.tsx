import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Zap,
  Activity,
  WifiOff,
  Wifi,
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useNetworkMonitor } from '@/hooks/useNetworkMonitor';
import { useToast } from '@/components/ui/use-toast';
import { getBlockExplorer, getChainName, getChainToken, chains } from '@/lib/web3-config';
import { debugLog } from '@/lib/config';
import AuthService from '@/services/authService';

interface WalletStatusProps {
  showBalance?: boolean;
  showNetworkStatus?: boolean;
  compact?: boolean;
  enableAuthentication?: boolean;
}

export default function WalletStatus({ 
  showBalance = true, 
  showNetworkStatus = true,
  compact = false,
  enableAuthentication = true 
}: WalletStatusProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    address,
    ensName,
    balance,
    chainId,
    chainName,
    walletLabel,
    connect,
    disconnect,
    switchChain,
    isAuthenticated,
    authenticate,
    session,
    lastError,
    clearError,
  } = useWallet();

  const { networkStatus, isReconnecting: networkReconnecting } = useNetworkMonitor({
    enableAutoReconnect: true,
  });

  // Clear errors after 5 seconds
  useEffect(() => {
    if (lastError) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [lastError, clearError]);

  const formatAddress = (addr: string) => {
    return AuthService.formatAddress(addr, 4);
  };

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: 'Address copied',
          description: 'Wallet address copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Copy failed',
          description: 'Failed to copy address to clipboard',
          variant: 'destructive',
        });
      }
    }
  };

  const openInExplorer = () => {
    if (address && chainId) {
      const explorerUrl = getBlockExplorer(chainId);
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, '_blank', 'noopener,noreferrer');
      } else {
        toast({
          title: 'Explorer not available',
          description: 'Block explorer not configured for this network',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAuthentication = async () => {
    if (!enableAuthentication) return;
    
    setIsAuthenticating(true);
    try {
      const success = await authenticate();
      if (success) {
        debugLog('Authentication successful');
      }
    } catch (error) {
      debugLog('Authentication failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: 'Disconnected',
        description: 'Your wallet has been disconnected',
      });
    } catch (error) {
      toast({
        title: 'Disconnect failed',
        description: 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  const handleChainSwitch = async (newChainId: string) => {
    try {
      const success = await switchChain(newChainId);
      if (!success) {
        toast({
          title: 'Network switch failed',
          description: 'Failed to switch to the selected network',
          variant: 'destructive',
        });
      }
    } catch (error) {
      debugLog('Failed to switch chain:', error);
    }
  };

  const getConnectionStatus = () => {
    if (!isConnected) return { status: 'disconnected', color: 'bg-gray-400' };
    if (isReconnecting || networkReconnecting) return { status: 'reconnecting', color: 'bg-yellow-500' };
    if (lastError) return { status: 'error', color: 'bg-red-500' };
    if (!networkStatus.isConnectedToRPC) return { status: 'network-error', color: 'bg-orange-500' };
    if (isAuthenticated) return { status: 'authenticated', color: 'bg-green-500' };
    return { status: 'connected', color: 'bg-blue-500' };
  };

  const getStatusText = () => {
    const { status } = getConnectionStatus();
    switch (status) {
      case 'disconnected': return 'Disconnected';
      case 'reconnecting': return 'Reconnecting...';
      case 'error': return 'Error';
      case 'network-error': return 'Network Issue';
      case 'authenticated': return 'Authenticated';
      case 'connected': return 'Connected';
      default: return 'Unknown';
    }
  };

  const getNetworkLatencyBadge = () => {
    if (!networkStatus.latency) return null;
    
    const { latency } = networkStatus;
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    let text = 'Good';
    
    if (latency > 1000) {
      variant = 'destructive';
      text = 'Poor';
    } else if (latency > 500) {
      variant = 'secondary';
      text = 'Fair';
    }
    
    return (
      <Badge variant={variant} className="text-xs">
        {networkStatus.isOnline ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
        {text} ({latency}ms)
      </Badge>
    );
  };

  // Not connected state
  if (!isConnected) {
    return (
      <>
        <Button
          onClick={connect}
          disabled={isConnecting}
          variant="outline"
          size={compact ? "sm" : "default"}
          className="flex items-center gap-2"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </>
    );
  }

  const { color } = getConnectionStatus();

  // Compact connected state
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            {ensName || formatAddress(address!)}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Wallet Status</DropdownMenuLabel>
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? (
                  <>
                    <Shield className="mr-1 h-3 w-3" />
                    {getStatusText()}
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {getStatusText()}
                  </>
                )}
              </Badge>
              {showNetworkStatus && getNetworkLatencyBadge()}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{walletLabel}</p>
            <p className="text-xs font-mono">{address}</p>
            {showBalance && balance && (
              <p className="text-sm text-muted-foreground mt-1">
                Balance: {parseFloat(balance).toFixed(4)} {getChainToken(chainId!)}
              </p>
            )}
            {lastError && (
              <p className="text-xs text-destructive mt-1">{lastError.message}</p>
            )}
          </div>
          <DropdownMenuSeparator />
          
          {enableAuthentication && !isAuthenticated && (
            <>
              <DropdownMenuItem onClick={handleAuthentication} disabled={isAuthenticating}>
                {isAuthenticating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Authenticate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={copyAddress}>
            {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openInExplorer}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View in Explorer
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
          {chains.slice(0, 4).map((chain: any) => (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => handleChainSwitch(chain.id)}
              className={chainId === chain.id ? 'bg-muted' : ''}
            >
              <Activity className="mr-2 h-4 w-4" />
              {chain.label}
              {chainId === chain.id && <CheckCircle className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full connected state
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {ensName || formatAddress(address!)}
                </span>
                <Badge variant={isAuthenticated ? "default" : "secondary"} className="text-xs">
                  {isAuthenticated ? (
                    <>
                      <Shield className="mr-1 h-3 w-3" />
                      Authenticated
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Not Authenticated
                    </>
                  )}
                </Badge>
                {showNetworkStatus && getNetworkLatencyBadge()}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{walletLabel}</span>
                <span>•</span>
                <span>{chainName}</span>
                {showBalance && balance && (
                  <>
                    <span>•</span>
                    <span>{parseFloat(balance).toFixed(4)} {getChainToken(chainId!)}</span>
                  </>
                )}
              </div>
              
              {(session || lastError) && (
                <div className="text-xs text-muted-foreground mt-1">
                  {session && (
                    <span>Session expires: {new Date(session.expires).toLocaleString()}</span>
                  )}
                  {lastError && (
                    <span className="text-destructive">{lastError.message}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {enableAuthentication && !isAuthenticated && (
            <Button 
              onClick={handleAuthentication} 
              disabled={isAuthenticating}
              variant="outline" 
              size="sm"
            >
              {isAuthenticating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyAddress}>
                {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Address'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openInExplorer}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View in Explorer
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
              {chains.map((chain: any) => (
                <DropdownMenuItem
                  key={chain.id}
                  onClick={() => handleChainSwitch(chain.id)}
                  className={chainId === chain.id ? 'bg-muted' : ''}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  {chain.label}
                  {chainId === chain.id && <CheckCircle className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}