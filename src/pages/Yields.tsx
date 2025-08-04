import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Calculator, Target, Coins, Timer, ArrowUpRight, MoreHorizontal } from "lucide-react";

interface YieldOpportunity {
  id: string;
  name: string;
  protocol: string;
  icon1: string;
  icon2: string;
  apy: number;
  tvl: string;
  risk: "Low" | "Medium" | "High";
  lockPeriod: string;
  minStake: string;
}

interface ActivePosition {
  id: string;
  protocol: string;
  asset: string;
  icon: string;
  staked: string;
  rewards: string;
  apy: number;
  status: "Active" | "Unlocking" | "Claimable";
  timeLeft?: string;
}

const yieldOpportunities: YieldOpportunity[] = [
  {
    id: "1",
    name: "ETH/UNDEAD LP",
    protocol: "PivotSwap",
    icon1: "⟐",
    icon2: "◎",
    apy: 12.5,
    tvl: "2.4M UNDEAD",
    risk: "Medium",
    lockPeriod: "7 days",
    minStake: "100 UNDEAD"
  },
  {
    id: "2", 
    name: "BTC/ETH LP",
    protocol: "PivotSwap",
    icon1: "₿",
    icon2: "⟐",
    apy: 15.8,
    tvl: "1.8M UNDEAD",
    risk: "Medium",
    lockPeriod: "14 days",
    minStake: "50 UNDEAD"
  },
  {
    id: "3",
    name: "UNDEAD Staking",
    protocol: "PivotStake",
    icon1: "◎",
    icon2: "◎",
    apy: 8.2,
    tvl: "5.2M UNDEAD",
    risk: "Low",
    lockPeriod: "30 days",
    minStake: "10 UNDEAD"
  },
  {
    id: "4",
    name: "High Yield Pool",
    protocol: "PivotYield",
    icon1: "🚀",
    icon2: "💎",
    apy: 25.4,
    tvl: "850K UNDEAD",
    risk: "High",
    lockPeriod: "90 days",
    minStake: "500 UNDEAD"
  }
];

const activePositions: ActivePosition[] = [
  {
    id: "1",
    protocol: "PivotSwap",
    asset: "ETH/UNDEAD LP",
    icon: "⟐",
    staked: "2,500 UNDEAD",
    rewards: "125.50 UNDEAD",
    apy: 12.5,
    status: "Active"
  },
  {
    id: "2",
    protocol: "PivotStake", 
    asset: "UNDEAD",
    icon: "◎",
    staked: "5,000 UNDEAD",
    rewards: "410.25 UNDEAD",
    apy: 8.2,
    status: "Active"
  },
  {
    id: "3",
    protocol: "PivotYield",
    asset: "High Yield Pool",
    icon: "🚀",
    staked: "1,000 UNDEAD",
    rewards: "254.00 UNDEAD",
    apy: 25.4,
    status: "Claimable"
  }
];

const Yields = () => {
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState("1000");
  const [calculatorPeriod, setCalculatorPeriod] = useState("30");
  const [selectedOpportunity, setSelectedOpportunity] = useState(yieldOpportunities[0].id);

  const calculateYield = () => {
    const amount = parseFloat(calculatorAmount) || 0;
    const days = parseFloat(calculatorPeriod) || 0;
    const opportunity = yieldOpportunities.find(op => op.id === selectedOpportunity);
    const apy = opportunity?.apy || 0;
    
    const dailyRate = apy / 365 / 100;
    const totalReward = amount * dailyRate * days;
    
    return {
      totalReward: totalReward.toFixed(2),
      dailyReward: (totalReward / days).toFixed(2),
      finalAmount: (amount + totalReward).toFixed(2)
    };
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "High": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-blue-600 bg-blue-100";
      case "Unlocking": return "text-yellow-600 bg-yellow-100";
      case "Claimable": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <DashboardLayout title="My Yields">
      <div className="p-6 space-y-6 bg-background min-h-screen">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Staked</h3>
              <Coins className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-card-foreground">8,500 UNDEAD</p>
              <p className="text-xs text-muted-foreground">Across 3 protocols</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Rewards</h3>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-card-foreground">789.75 UNDEAD</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600">+45.20 this week</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Average APY</h3>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-card-foreground">15.37%</p>
              <p className="text-xs text-muted-foreground">Weighted average</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Rewards</h3>
              <Timer className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-card-foreground">254.00 UNDEAD</p>
              <Button size="sm" className="text-xs h-6 px-2">
                Claim All
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Positions */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">Active Positions</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCalculatorModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calculator
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Protocol</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Staked</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Rewards</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">APY</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePositions.map((position) => (
                      <tr key={position.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                              {position.icon}
                            </div>
                            <span className="font-medium text-card-foreground">{position.protocol}</span>
                          </div>
                        </td>
                        <td className="py-4 text-card-foreground">{position.asset}</td>
                        <td className="py-4 text-card-foreground">{position.staked}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-card-foreground">{position.rewards}</span>
                            {position.status === "Claimable" && (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-green-600 font-medium">{position.apy}%</span>
                        </td>
                        <td className="py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(position.status)}`}>
                            {position.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            {position.status === "Claimable" ? (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                Claim
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Available Opportunities */}
          <div>
            <Card className="p-6 bg-card border-border shadow-sm">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Available Opportunities</h2>
              
              <div className="space-y-4">
                {yieldOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center -space-x-1">
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs z-10">
                            {opportunity.icon1}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {opportunity.icon2}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground text-sm">{opportunity.name}</div>
                          <div className="text-xs text-muted-foreground">{opportunity.protocol}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(opportunity.risk)}`}>
                        {opportunity.risk}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-muted-foreground">APY: </span>
                        <span className="font-medium text-green-600">{opportunity.apy}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">TVL: </span>
                        <span className="font-medium text-card-foreground">{opportunity.tvl}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lock: </span>
                        <span className="font-medium text-card-foreground">{opportunity.lockPeriod}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Min: </span>
                        <span className="font-medium text-card-foreground">{opportunity.minStake}</span>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full flex items-center gap-1 text-xs">
                      <span>Stake Now</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Yield Calculator Modal */}
      <Dialog open={isCalculatorModalOpen} onOpenChange={setIsCalculatorModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Yield Calculator
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Yield Opportunity</label>
              <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yieldOpportunities.map((opportunity) => (
                    <SelectItem key={opportunity.id} value={opportunity.id}>
                      <div className="flex items-center gap-2">
                        <span>{opportunity.name}</span>
                        <span className="text-green-600 text-xs">({opportunity.apy}% APY)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Amount (UNDEAD)</label>
              <Input
                value={calculatorAmount}
                onChange={(e) => setCalculatorAmount(e.target.value)}
                className="bg-input border-border"
                placeholder="1000"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Period (Days)</label>
              <Input
                value={calculatorPeriod}
                onChange={(e) => setCalculatorPeriod(e.target.value)}
                className="bg-input border-border"
                placeholder="30"
              />
            </div>
            
            <div className="space-y-2 text-sm pt-4 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Reward</span>
                <span className="text-card-foreground font-medium">{calculateYield().dailyReward} UNDEAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Reward</span>
                <span className="text-green-600 font-medium">{calculateYield().totalReward} UNDEAD</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-border">
                <span className="text-card-foreground">Final Amount</span>
                <span className="text-card-foreground">{calculateYield().finalAmount} UNDEAD</span>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCalculatorModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  // Navigate to staking
                  setIsCalculatorModalOpen(false);
                }}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Stake Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Yields;