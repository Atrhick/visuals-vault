import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    color: "bg-orange-500"
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    color: "bg-blue-500"
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "◉",
    color: "bg-blue-600"
  },
  {
    id: "rainbow",
    name: "Rainbow Wallet",
    icon: "🌈",
    color: "bg-gradient-to-r from-purple-500 to-pink-500"
  }
];

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletOption | null>(null);
  const [connectedAddress] = useState("q106-ehjw-q346g");

  const handleWalletSelect = (wallet: WalletOption) => {
    setConnectedWallet(wallet);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectedWallet(null);
  };

  const handleClose = () => {
    setIsConnected(false);
    setConnectedWallet(null);
    onClose();
  };

  // Success state - wallet connected
  if (isConnected && connectedWallet) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <div></div>
          </DialogHeader>
          
          <div className="text-center py-6 space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500 delay-200">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Success Message */}
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-300">
              <h2 className="text-xl font-semibold text-card-foreground">
                Your wallet has been connected successfully!
              </h2>
            </div>
            
            {/* Connected Wallet Info */}
            <div className="flex items-center justify-between bg-muted rounded-lg p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connectedWallet.color}`}>
                  <span className="text-white text-sm">{connectedWallet.icon}</span>
                </div>
                <span className="font-medium text-card-foreground">
                  Account {connectedAddress}
                </span>
              </div>
              <Button
                variant="link"
                onClick={handleDisconnect}
                className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
              >
                Disconnect
              </Button>
            </div>
            
            {/* Close Button */}
            <Button
              onClick={handleClose}
              className="w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500"
              size="lg"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Initial state - wallet selection
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="flex flex-row items-center justify-between p-0">
          <h2 className="text-lg font-semibold text-card-foreground animate-in fade-in-0 slide-in-from-left-2 duration-300 delay-100">
            Connect Wallet
          </h2>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Wallet Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {walletOptions.map((wallet, index) => (
              <Button
                key={wallet.id}
                variant="outline"
                onClick={() => handleWalletSelect(wallet)}
                className="p-4 h-auto flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 delay-200"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${wallet.color}`}>
                  <span className="text-white text-lg">{wallet.icon}</span>
                </div>
                <span className="font-medium text-sm text-card-foreground">
                  {wallet.name}
                </span>
              </Button>
            ))}
          </div>
          
          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center animate-in fade-in-0 duration-300 delay-600">
            By connecting your wallet, you agree to Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}