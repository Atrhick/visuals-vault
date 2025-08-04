import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-border shadow-card p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-card-foreground mb-4">
            Your account has been created successfully
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Ara utor coaegresco decumbo. Abduco debilito cado.
          </p>
          
          <Button 
            onClick={handleSetupComplete}
            className="w-full"
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
              onClick={() => setCurrentStep("login")}
              className="text-primary hover:text-primary/80 p-0 h-auto"
            >
              Disconnect
            </Button>
          </div>
          
          <Button 
            onClick={handleSetupComplete}
            className="w-full"
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
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-border shadow-card p-8">
          <h1 className="text-2xl font-bold text-card-foreground mb-4">Verify your email</h1>
          <p className="text-muted-foreground mb-8">
            Please enter the code sent to {email}
          </p>
          
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-input border-border" />
                  <InputOTPSlot index={1} className="bg-input border-border" />
                  <InputOTPSlot index={2} className="bg-input border-border" />
                  <InputOTPSlot index={3} className="bg-input border-border" />
                  <InputOTPSlot index={4} className="bg-input border-border" />
                  <InputOTPSlot index={5} className="bg-input border-border" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button 
              onClick={handleOtpSubmit}
              className="w-full" 
              size="lg"
              disabled={otpValue.length !== 6}
            >
              Submit
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="w-full"
              size="lg"
            >
              Go Back
            </Button>
            
            <div className="text-center">
              <span className="text-muted-foreground">Didn't receive the code? </span>
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
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
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-border shadow-card p-8">
          <h1 className="text-2xl font-bold text-card-foreground mb-2">Create a password</h1>
          <p className="text-muted-foreground mb-8">{email}</p>
          
          <form onSubmit={handleSubmit(handlePasswordNext)} className="space-y-6">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match"
                })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button type="submit" className="w-full" size="lg">
              Next
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={handleGoBack}
              className="w-full"
              size="lg"
            >
              Go Back
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Login or Signup Screen
  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border shadow-card p-8">
        <h1 className="text-2xl font-bold text-card-foreground mb-8">
          {currentStep === "signup" ? "Create an account" : "Log In"}
        </h1>
        
        <form onSubmit={handleSubmit(handleEmailNext)} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
              })}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email.message as string}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" size="lg">
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
                type="button"
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
            {currentStep === "signup" ? (
              <>
                <span className="text-muted-foreground">Already have an account? </span>
                <Button 
                  type="button"
                  variant="link" 
                  className="p-0 h-auto text-primary hover:text-primary/80"
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
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => setCurrentStep("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
          
          {currentStep === "signup" && (
            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to Terms of Service and Privacy Policy.
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default AuthFlow;