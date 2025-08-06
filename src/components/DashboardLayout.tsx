import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import WalletStatus from "@/components/WalletStatus";
import UserDropdown from "@/components/UserDropdown";
import Breadcrumbs from "@/components/Breadcrumbs";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import QuickAccess from "@/components/QuickAccess";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = "Dashboard Overview" }: DashboardLayoutProps) {

  return (
    <SidebarProvider>
      <KeyboardShortcuts />
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
              <WalletStatus compact={true} />
              <UserDropdown />
            </div>
          </header>
          
          {/* Content */}
          <div className="flex-1 bg-background">
            <div className="p-6 pb-0">
              <Breadcrumbs />
            </div>
            {children}
          </div>
        </main>
      </div>
      
      {/* Quick Access */}
      <QuickAccess />
    </SidebarProvider>
  );
}