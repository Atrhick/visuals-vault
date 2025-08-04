import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthStep = 
  | "login" 
  | "signup" 
  | "create-password" 
  | "verify-email" 
  | "account-created" 
  | "wallet-connected" 
  | "setup-complete";

interface AuthFlowProps {
  onComplete?: () => void;
}

const AuthFlow = ({ onComplete }: AuthFlowProps) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const walletOptions = [
    { name: "MetaMask", icon: "🦊" },
    { name: "WalletConnect", icon: "🔗" },
    { name: "Coinbase Wallet", icon: "🌐" },
    { name: "Rainbow Wallet", icon: "🌈" },
  ];

  const handleEmailNext = (data: any) => {
    setEmail(data.email);
    if (currentStep === "login") {
      // For login, we could go directly to wallet connected or add password verification
      setCurrentStep("wallet-connected");
    } else {
      setCurrentStep("create-password");
    }
  };

  const handlePasswordNext = () => {
    setCurrentStep("verify-email");
  };

  const handleOtpSubmit = () => {
    setCurrentStep("account-created");
  };

  const handleWalletConnect = (walletName: string) => {
    const mockAddress = "q106-ehjw-q346g";
    setConnectedWallet(mockAddress);
    setCurrentStep("wallet-connected");
  };

  const handleSetupComplete = () => {
    window.location.href = "/dashboard";
  };

  const handleGoBack = () => {
    switch (currentStep) {
      case "create-password":
        setCurrentStep("signup");
        break;
      case "verify-email":
        setCurrentStep("create-password");
        break;
      default:
        setCurrentStep("login");
    }
  };

  // Account Created Success Screen
  if (currentStep === "account-created") {
    return (
      <div className="min-h-screen bg-sidebar-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-lg p-8 text-center transform animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center animate-in zoom-in-50 duration-700 delay-200">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-card-foreground mb-4 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-300">
            Your account has been created successfully
          </h1>
          
          <p className="text-muted-foreground mb-8 animate-in fade-in-0 duration-500 delay-400">
            Welcome to Pivot Protocol! Your account is ready to use.
          </p>
          
          <Button 
            onClick={handleSetupComplete}
            className="w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500 hover:scale-105 transition-transform"
            size="lg"
          >
            Set It Up Now
          </Button>
        </Card>
      </div>
    );
  }

  // Wallet Connected Success Screen
  if (currentStep === "wallet-connected") {
    return (
      <div className="min-h-screen bg-sidebar-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-lg p-8 text-center transform animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center animate-in zoom-in-50 duration-700 delay-200">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-card-foreground mb-4 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-300">
            Your wallet has been connected
          </h1>
          
          <p className="text-muted-foreground mb-8 animate-in fade-in-0 duration-500 delay-400">
            Great! Your wallet is now connected and ready to use.
          </p>
          
          <div className="flex items-center justify-between bg-muted rounded-lg p-4 mb-8 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span className="text-card-foreground font-medium">
                Account {connectedWallet}
              </span>
            </div>
            <Button 
              variant="link" 
              onClick={() => setCurrentStep("login")}
              className="text-primary hover:text-primary/80 p-0 h-auto hover:scale-105 transition-transform"
            >
              Disconnect
            </Button>
          </div>
          
          <Button 
            onClick={handleSetupComplete}
            className="w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600 hover:scale-105 transition-transform"
            size="lg"
          >
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  // Email Verification Screen
  if (currentStep === "verify-email") {
    return (
      <div className="min-h-screen bg-sidebar-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-lg p-8 transform animate-in fade-in-0 slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleGoBack}
              className="text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-card-foreground animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-200">Verify your email</h1>
          </div>
          <p className="text-muted-foreground mb-8 animate-in fade-in-0 duration-500 delay-300">
            Please enter the code sent to {email}
          </p>
          
          <div className="space-y-6">
            <div className="flex justify-center animate-in fade-in-0 zoom-in-95 duration-500 delay-400">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-input border-border transition-all duration-200 hover:border-primary focus:border-primary" />
                  <InputOTPSlot index={1} className="bg-input border-border transition-all duration-200 hover:border-primary focus:border-primary" />
                  <InputOTPSlot index={2} className="bg-input border-border transition-all duration-200 hover:border-primary focus:border-primary" />
                  <InputOTPSlot index={3} className="bg-input border-border transition-all duration-200 hover:border-primary focus:border-primary" />
                  <InputOTPSlot index={4} className="bg-input border-border transition-all duration-200 hover:border-primary focus:border-primary" />
                  <InputOTPSlot index={5} className="bg-input border-border transition-all duration-200 hover:border-primary focus:border-primary" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button 
              onClick={handleOtpSubmit}
              className="w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500 hover:scale-105 transition-transform disabled:hover:scale-100" 
              size="lg"
              disabled={otpValue.length !== 6}
            >
              Submit
            </Button>
            
            <div className="text-center animate-in fade-in-0 duration-500 delay-600">
              <span className="text-muted-foreground">Didn't receive the code? </span>
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 hover:scale-105 transition-transform">
                Click to resend
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Create Password Screen
  if (currentStep === "create-password") {
    return (
      <div className="min-h-screen bg-sidebar-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-lg p-8 transform animate-in fade-in-0 slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleGoBack}
              className="text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-200">Create a password</h1>
              <p className="text-muted-foreground animate-in fade-in-0 duration-500 delay-300">{email}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(handlePasswordNext)} className="space-y-6">
            <div className="relative animate-in fade-in-0 slide-in-from-right-2 duration-500 delay-400">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="relative animate-in fade-in-0 slide-in-from-right-2 duration-500 delay-500">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match"
                })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button type="submit" className="w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600 hover:scale-105 transition-transform" size="lg">
              Next
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Login or Signup Screen
  return (
    <div className="min-h-screen bg-sidebar-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg p-8 transform animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <h1 className="text-2xl font-bold text-card-foreground mb-8 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-200">
          {currentStep === "signup" ? "Create an account" : "Log In"}
        </h1>
        
        <form onSubmit={handleSubmit(handleEmailNext)} className="space-y-6">
          <div className="animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-300">
            <Input
              type="email"
              placeholder="Enter your email address"
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
              })}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1 animate-in fade-in-0 duration-200">{errors.email.message as string}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400 hover:scale-105 transition-transform" size="lg">
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
          
          <div className="grid grid-cols-2 gap-3 animate-in fade-in-0 zoom-in-95 duration-500 delay-600">
            {walletOptions.map((wallet, index) => (
              <Button
                key={wallet.name}
                type="button"
                variant="outline"
                onClick={() => handleWalletConnect(wallet.name)}
                className="text-left p-4 h-auto flex-col gap-2 hover:scale-105 transition-all duration-200 hover:border-primary animate-in fade-in-0 slide-in-from-bottom-1 delay-700"
                style={{ animationDelay: `${700 + index * 100}ms` }}
              >
                <span className="text-lg">{wallet.icon}</span>
                <span className="text-sm font-medium">{wallet.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="text-center animate-in fade-in-0 duration-500 delay-1000">
            {currentStep === "signup" ? (
              <>
                <span className="text-muted-foreground">Already have an account? </span>
                <Button 
                  type="button"
                  variant="link" 
                  className="p-0 h-auto text-primary hover:text-primary/80 hover:scale-105 transition-transform"
                  onClick={() => setCurrentStep("login")}
                >
                  Log In
                </Button>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button 
                  type="button"
                  variant="link" 
                  className="p-0 h-auto text-primary hover:text-primary/80 hover:scale-105 transition-transform"
                  onClick={() => setCurrentStep("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
          
          {currentStep === "signup" && (
            <p className="text-xs text-muted-foreground text-center animate-in fade-in-0 duration-500 delay-1100">
              By creating an account, you agree to Terms of Service and Privacy Policy.
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default AuthFlow;