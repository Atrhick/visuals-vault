import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import WalletConnectModal from "@/components/WalletConnectModal";
import UserDropdown from "@/components/UserDropdown";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = "Dashboard Overview" }: DashboardLayoutProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground" />
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 hover:scale-105 transition-transform"
              >
                Connect wallet
              </Button>
              <UserDropdown />
            </div>
          </header>
          
          {/* Content */}
          <div className="flex-1 bg-background">
            {children}
          </div>
        </main>
      </div>
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </SidebarProvider>
  );
}