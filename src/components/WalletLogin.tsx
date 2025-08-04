import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface WalletLoginProps {
  onWalletConnected?: (walletAddress: string) => void;
}

const WalletLogin = ({ onWalletConnected }: WalletLoginProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState("");
  const [email, setEmail] = useState("");

  const walletOptions = [
    { name: "MetaMask", icon: "🦊" },
    { name: "WalletConnect", icon: "🔗" },
    { name: "Coinbase Wallet", icon: "🌐" },
    { name: "Rainbow Wallet", icon: "🌈" },
  ];

  const handleWalletConnect = (walletName: string) => {
    // Simulate wallet connection
    const mockAddress = "q106-ehjw-q346g";
    setConnectedWallet(mockAddress);
    setIsConnected(true);
    onWalletConnected?.(mockAddress);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectedWallet("");
  };

  const handleGetStarted = () => {
    // Handle navigation to main app
    console.log("Getting started...");
  };

  if (isConnected) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-border shadow-card p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-card-foreground mb-4">
            Your wallet has been connected
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Ara utor coaegresco decumbo. Abduco debilito cado.
          </p>
          
          <div className="flex items-center justify-between bg-secondary rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
              <span className="text-card-foreground font-medium">
                Account {connectedWallet}
              </span>
            </div>
            <Button 
              variant="link" 
              onClick={handleDisconnect}
              className="text-primary hover:text-primary/80 p-0 h-auto"
            >
              Disconnect
            </Button>
          </div>
          
          <Button 
            onClick={handleGetStarted}
            className="w-full"
            size="lg"
          >
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border shadow-card p-8">
        <h1 className="text-2xl font-bold text-card-foreground mb-8">Log In</h1>
        
        <div className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <Button className="w-full" size="lg">
            Next
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.name}
                variant="wallet"
                onClick={() => handleWalletConnect(wallet.name)}
                className="text-left"
              >
                <span className="text-lg">{wallet.icon}</span>
                <span className="text-sm font-medium">{wallet.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="text-center">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
              Sign Up
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WalletLogin;