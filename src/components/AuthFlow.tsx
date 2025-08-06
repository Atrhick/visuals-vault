import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import AuthService from "@/services/authService";

interface AuthFlowProps {
  onComplete?: () => void;
}

const AuthFlow = ({ onComplete }: AuthFlowProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isConnected,
    address,
    walletLabel,
    connect,
    authenticate,
    isAuthenticated,
  } = useWallet();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && AuthService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Add direct dashboard access button for testing
  const goToDashboardDirectly = () => {
    navigate('/dashboard');
  };

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('Starting wallet connection...');
      await connect();
      console.log('Connect called, waiting for state update...');
      
      // Wait a moment for wallet state to update, then authenticate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Connection state:', { isConnected, address, walletLabel });
      
      // Authenticate after connection
      const authSuccess = await authenticate();
      console.log('Authentication result:', authSuccess);
      
      if (authSuccess) {
        // Navigate directly to dashboard after successful authentication
        navigate('/dashboard');
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };


  // Wallet-Only Connection Screen
  return (
    <div className="min-h-screen bg-sidebar-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg p-8 text-center transform animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-4 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-200">
            Welcome to Pivot Protocol
          </h1>
          <p className="text-muted-foreground animate-in fade-in-0 duration-500 delay-300">
            Connect your wallet to access your DeFi trading dashboard
          </p>
        </div>
        
        <Button
          onClick={handleWalletConnect}
          disabled={isConnecting}
          size="lg"
          className="w-full mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400 hover:scale-105 transition-transform"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting Wallet...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 animate-in fade-in-0 duration-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3 text-sm text-muted-foreground animate-in fade-in-0 duration-500 delay-600">
          <p>Supported wallets:</p>
          <div className="flex justify-center gap-4">
            <span>🦊 MetaMask</span>
            <span>📱 WalletConnect</span>
            <span>🔵 Coinbase</span>
          </div>
        </div>
        
        {/* Temporary dashboard access button */}
        <div className="text-center mt-6 pt-6 border-t border-border">
          <Button 
            type="button"
            variant="outline" 
            onClick={goToDashboardDirectly}
            className="w-full"
          >
            Skip to Dashboard (Demo Mode)
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AuthFlow;