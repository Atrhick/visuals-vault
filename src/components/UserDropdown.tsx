import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserDropdownProps {
  userName?: string;
  userInitials?: string;
  accountId?: string;
}

export default function UserDropdown({ 
  userName = "Kylie Lee", 
  userInitials = "KL",
  accountId = "Account q106-ehjw-q346g"
}: UserDropdownProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/settings");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleLogout = () => {
    // Handle logout logic here
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-1 hover:bg-muted">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-sm font-medium text-white">{userInitials}</span>
          </div>
          <span className="text-sm font-medium text-foreground">{userInitials}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-lg">
        {/* User Info Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-sm font-medium text-white">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-card-foreground text-sm">{userName}</div>
              <div className="text-xs text-muted-foreground truncate">{accountId}</div>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="p-1">
          <DropdownMenuItem 
            onClick={handleProfileClick}
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted focus:bg-muted"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSettingsClick}
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted focus:bg-muted"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1" />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted focus:bg-muted text-red-600 focus:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}