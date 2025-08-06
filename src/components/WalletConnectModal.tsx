import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle, ExternalLink, Copy, ChevronDown } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import AuthService from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chains } from "@/lib/web3-config";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WalletConnectModal({ isOpen, onClose, onSuccess }: WalletConnectModalProps) {
  const { toast } = useToast();
  const {
    isConnected,
    isConnecting,
    address,
    balance,
    chainId,
    chainName,
    walletLabel,
    connect,
    disconnect,
    switchChain,
    authenticate,
    isAuthenticated,
  } = useWallet();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setShowSuccess(false);
      setCopied(false);
    }
  }, [isOpen]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && !isAuthenticated && isOpen) {
      handleAuthenticate();
    }
  }, [isConnected, isAuthenticated, isOpen]);

  // Handle wallet connection
  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  };

  // Handle authentication
  const handleAuthenticate = async () => {
    if (!isConnected) return;
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const success = await authenticate();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowSuccess(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    }
  };

  // Handle chain switch
  const handleChainSwitch = async (chainId: string) => {
    try {
      await switchChain(chainId);
    } catch (err) {
      toast({
        title: "Failed to switch network",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Success state - authenticated
  if (showSuccess && isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-card border-border animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="text-center py-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500 delay-200">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-300">
              <h2 className="text-xl font-semibold text-card-foreground">
                Successfully Connected!
              </h2>
              <p className="text-sm text-muted-foreground">
                Your wallet has been connected and authenticated
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Connected state - showing wallet info
  if (isConnected && address) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-card border-border animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader>
            <h2 className="text-lg font-semibold text-card-foreground">
              Wallet Connected
            </h2>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Wallet Info */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wallet</span>
                <span className="font-medium">{walletLabel}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(address)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyAddress}
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              {balance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <span className="font-medium">{parseFloat(balance).toFixed(4)} ETH</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7">
                      {chainName || "Unknown"}
                      <ChevronDown className="ml-2 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {chains.map((chain) => (
                      <DropdownMenuItem
                        key={chain.id}
                        onClick={() => handleChainSwitch(chain.id)}
                        className={chainId === chain.id ? "bg-muted" : ""}
                      >
                        {chain.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Authentication Status */}
            {!isAuthenticated && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-card-foreground">
                      Please sign a message to authenticate your wallet
                    </p>
                    <Button
                      onClick={handleAuthenticate}
                      disabled={isAuthenticating}
                      size="sm"
                      className="w-full"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        "Authenticate"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="flex-1"
              >
                Disconnect
              </Button>
              {isAuthenticated && (
                <Button onClick={onClose} className="flex-1">
                  Continue
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Initial state - wallet selection
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader>
          <h2 className="text-lg font-semibold text-card-foreground">
            Connect Wallet
          </h2>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Connect Button */}
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            size="lg"
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
          
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}
          
          {/* Supported Wallets */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Supported wallets:
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🦊</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">MetaMask</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">WalletConnect</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">◉</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Coinbase</span>
              </div>
            </div>
          </div>
          
          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
            By connecting, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto text-xs">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="p-0 h-auto text-xs">
              Privacy Policy
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}