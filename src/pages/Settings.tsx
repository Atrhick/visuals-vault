import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("Notifications");
  const [fullName, setFullName] = useState({ first: "Kylie", last: "Lee" });
  const [email, setEmail] = useState("email@example.com");
  const [bio, setBio] = useState("I'm a Sales Assistant based in Melbourne, Australia. I specialize in brand strategy, and customer experience.");
  
  // Notification settings
  const [pivotUpdates, setPivotUpdates] = useState("Daily");
  const [transactionAlerts, setTransactionAlerts] = useState({
    deposit: true,
    withdraw: false,
    trade: true
  });
  
  const tabs = [
    "General",
    "Profile", 
    "Notifications",
    "Wallet Management",
    "Security"
  ];
  
  const handleImageUpload = () => {
    // Handle image upload logic
    console.log("Image upload clicked");
  };
  
  const handleSave = () => {
    // Handle save logic
    console.log("Profile saved");
  };

  return (
    <DashboardLayout title="Settings">
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <Card className="p-6 bg-card border-border shadow-sm">
          {/* Tabs Navigation */}
          <div className="flex gap-1 mb-8 border-b border-border">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 relative ${
                  activeTab === tab
                    ? "text-primary hover:text-primary"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </Button>
            ))}
          </div>
          
          {/* Profile Tab Content */}
          {activeTab === "Profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground mb-2">Profile</h2>
                <p className="text-muted-foreground text-sm">Update your photo and personal details here</p>
              </div>
              
              {/* Full Name */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-card-foreground">Full Name</Label>
                <div className="flex gap-4">
                  <Input
                    value={fullName.first}
                    onChange={(e) => setFullName({ ...fullName, first: e.target.value })}
                    className="flex-1 bg-input border-border"
                    placeholder="First name"
                  />
                  <Input
                    value={fullName.last}
                    onChange={(e) => setFullName({ ...fullName, last: e.target.value })}
                    className="flex-1 bg-input border-border"
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              {/* Email Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-card-foreground">Email Address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-md bg-input border-border"
                  placeholder="Email address"
                />
              </div>
              
              {/* Profile Image */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-card-foreground">Profile Image</Label>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-medium text-muted-foreground">
                    KL
                  </div>
                  
                  {/* Upload Area */}
                  <div 
                    onClick={handleImageUpload}
                    className="flex-1 max-w-md border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-primary font-medium text-sm">Click to upload</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          or drag&drop any JPG, JPEG, PNG up to 512MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* BIO */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-card-foreground">BIO</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-32 bg-input border-border resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
          
          {/* Notifications Tab Content */}
          {activeTab === "Notifications" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground mb-2">Notifications</h2>
                <p className="text-muted-foreground text-sm">Manage your notification preferences</p>
              </div>
              
              {/* Pivot Updates */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-card-foreground">Pivot Updates</Label>
                <RadioGroup value={pivotUpdates} onValueChange={setPivotUpdates} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Daily" id="daily" className="border-border" />
                    <Label htmlFor="daily" className="text-sm text-card-foreground cursor-pointer">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Weekly" id="weekly" className="border-border" />
                    <Label htmlFor="weekly" className="text-sm text-card-foreground cursor-pointer">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Monthly" id="monthly" className="border-border" />
                    <Label htmlFor="monthly" className="text-sm text-card-foreground cursor-pointer">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Never" id="never" className="border-border" />
                    <Label htmlFor="never" className="text-sm text-card-foreground cursor-pointer">Never</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Transaction Alerts */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-card-foreground">Transaction Alerts</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="deposit"
                      checked={transactionAlerts.deposit}
                      onCheckedChange={(checked) => 
                        setTransactionAlerts(prev => ({ ...prev, deposit: checked as boolean }))
                      }
                      className="border-border"
                    />
                    <Label htmlFor="deposit" className="text-sm text-card-foreground cursor-pointer">Deposit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="withdraw"
                      checked={transactionAlerts.withdraw}
                      onCheckedChange={(checked) => 
                        setTransactionAlerts(prev => ({ ...prev, withdraw: checked as boolean }))
                      }
                      className="border-border"
                    />
                    <Label htmlFor="withdraw" className="text-sm text-card-foreground cursor-pointer">Withdraw</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="trade"
                      checked={transactionAlerts.trade}
                      onCheckedChange={(checked) => 
                        setTransactionAlerts(prev => ({ ...prev, trade: checked as boolean }))
                      }
                      className="border-border"
                    />
                    <Label htmlFor="trade" className="text-sm text-card-foreground cursor-pointer">Trade</Label>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => console.log('Notifications saved')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
          
          {/* Other Tab Content Placeholders */}
          {activeTab !== "Profile" && activeTab !== "Notifications" && (
            <div className="py-12 text-center">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">{activeTab}</h2>
              <p className="text-muted-foreground">{activeTab} settings coming soon...</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;