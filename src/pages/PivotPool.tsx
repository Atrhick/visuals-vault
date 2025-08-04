import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, TrendingUp, TrendingDown, X } from "lucide-react";

interface Pool {
  id: string;
  name: string;
  icon1: string;
  icon2: string;
  assetValue: string;
  tvl: string;
  volume24h: string;
  change24h: number;
  poolLimits: string;
  utilization: number;
  openPositions: number;
  myStake: string;
  details: {
    asset1: string;
    asset1Value: string;
    asset2: string;
    asset2Value: string;
  };
}

interface Currency {
  id: string;
  name: string;
  icon: string;
  balance: string;
}

const mockPools: Pool[] = [
  {
    id: "1",
    name: "BTC/ETH",
    icon1: "₿",
    icon2: "⟐",
    assetValue: "100,000 UNDEAD",
    tvl: "100 UNDEAD",
    volume24h: "+5.6%",
    change24h: 5.6,
    poolLimits: "200,000 UNDEAD",
    utilization: 50,
    openPositions: 2,
    myStake: "100 UNDEAD",
    details: {
      asset1: "BTC: 60,000 UNDEAD",
      asset1Value: "60,000",
      asset2: "ETH: 4,000 UNDEAD",
      asset2Value: "4,000"
    }
  },
  {
    id: "2",
    name: "ETH/UNDEAD",
    icon1: "⟐",
    icon2: "◎",
    assetValue: "50,000 UNDEAD",
    tvl: "100 UNDEAD",
    volume24h: "-2.3%",
    change24h: -2.3,
    poolLimits: "300,000 UNDEAD",
    utilization: 50,
    openPositions: 1,
    myStake: "100 UNDEAD",
    details: {
      asset1: "BTC: 40,000 UNDEAD",
      asset1Value: "40,000",
      asset2: "UNDEAD: 60,000 UNDEAD",
      asset2Value: "60,000"
    }
  },
  {
    id: "3",
    name: "BTC/ETH",
    icon1: "₿",
    icon2: "⟐",
    assetValue: "150,000 UNDEAD",
    tvl: "100 UNDEAD",
    volume24h: "+5.6%",
    change24h: 5.6,
    poolLimits: "100,000 UNDEAD",
    utilization: 50,
    openPositions: 3,
    myStake: "100 UNDEAD",
    details: {
      asset1: "BTC: 60,000 UNDEAD",
      asset1Value: "60,000",
      asset2: "ETH: 4,000 UNDEAD",
      asset2Value: "4,000"
    }
  },
  {
    id: "4",
    name: "ETH/UNDEAD",
    icon1: "⟐",
    icon2: "◎",
    assetValue: "50,000 UNDEAD",
    tvl: "100 UNDEAD",
    volume24h: "-2.3%",
    change24h: -2.3,
    poolLimits: "200,000 UNDEAD",
    utilization: 50,
    openPositions: 2,
    myStake: "100 UNDEAD",
    details: {
      asset1: "BTC: 40,000 UNDEAD",
      asset1Value: "40,000",
      asset2: "UNDEAD: 60,000 UNDEAD",
      asset2Value: "60,000"
    }
  },
  {
    id: "5",
    name: "BTC/ETH",
    icon1: "₿",
    icon2: "⟐",
    assetValue: "100,000 UNDEAD",
    tvl: "100 UNDEAD",
    volume24h: "+5.6%",
    change24h: 5.6,
    poolLimits: "300,000 UNDEAD",
    utilization: 50,
    openPositions: 1,
    myStake: "100 UNDEAD",
    details: {
      asset1: "BTC: 60,000 UNDEAD",
      asset1Value: "60,000",
      asset2: "ETH: 4,000 UNDEAD",
      asset2Value: "4,000"
    }
  },
  {
    id: "6",
    name: "ETH/UNDEAD",
    icon1: "⟐",
    icon2: "◎",
    assetValue: "150,000 UNDEAD",
    tvl: "100 UNDEAD",
    volume24h: "-2.3%",
    change24h: -2.3,
    poolLimits: "100,000 UNDEAD",
    utilization: 50,
    openPositions: 3,
    myStake: "100 UNDEAD",
    details: {
      asset1: "BTC: 40,000 UNDEAD",
      asset1Value: "40,000",
      asset2: "UNDEAD: 60,000 UNDEAD",
      asset2Value: "60,000"
    }
  }
];

const currencies: Currency[] = [
  { id: "ethereum", name: "Ethereum", icon: "⟐", balance: "2.5 ETH" },
  { id: "coinmarket", name: "CoinMarket", icon: "◉", balance: "1,500 CMT" },
  { id: "undead", name: "UNDEAD", icon: "◎", balance: "10,000 UNDEAD" },
  { id: "bitcoin", name: "Bitcoin", icon: "₿", balance: "0.15 BTC" }
];

const PivotPool = () => {
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[3].id);
  const [transferAccount] = useState("Account q106-ehjw-q346g");

  const handleInvest = (pool: Pool) => {
    setSelectedPool(pool);
    setInvestAmount("500");
    setIsInvestModalOpen(true);
  };

  const handleWithdraw = (pool: Pool) => {
    setSelectedPool(pool);
    setWithdrawAmount("100");
    setIsWithdrawModalOpen(true);
  };

  const confirmInvestment = () => {
    // Handle investment logic
    setIsInvestModalOpen(false);
    setSelectedPool(null);
  };

  const confirmWithdrawal = () => {
    // Handle withdrawal logic
    setIsWithdrawModalOpen(false);
    setSelectedPool(null);
  };

  const calculateTotal = (amount: string, fee: string) => {
    const amountNum = parseFloat(amount) || 0;
    const feeNum = parseFloat(fee) || 0;
    return (amountNum + feeNum).toFixed(2);
  };

  const MiniChart = ({ isPositive }: { isPositive: boolean }) => (
    <svg width="60" height="20" viewBox="0 0 60 20" className="inline-block">
      <path
        d={isPositive ? "M 2 15 Q 15 10 30 8 T 58 5" : "M 2 5 Q 15 8 30 12 T 58 15"}
        stroke={isPositive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  return (
    <DashboardLayout title="Pivot Pool Management">
      <div className="p-6 space-y-6 bg-background min-h-screen">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border shadow-sm">
            <h3 className="text-sm text-muted-foreground mb-2">Total Value Locked (TVL)</h3>
            <p className="text-2xl font-bold text-card-foreground">2.8M UNDEAD</p>
          </Card>
          
          <Card className="p-6 bg-card border-border shadow-sm">
            <h3 className="text-sm text-muted-foreground mb-2">KPI Card</h3>
            <p className="text-2xl font-bold text-card-foreground">100.00 UNDEAD</p>
          </Card>
          
          <Card className="p-6 bg-card border-border shadow-sm">
            <h3 className="text-sm text-muted-foreground mb-2">KPI Card</h3>
            <p className="text-2xl font-bold text-card-foreground">100.00 UNDEAD</p>
          </Card>
        </div>

        {/* Pivot Pools Table */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">Pivot Pools</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Pool Name</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset Value</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">TVL</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">24h Volume</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Pool Limits & Size</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Open...</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">My Stake</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPools.map((pool) => (
                  <tr key={pool.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium z-10">
                            {pool.icon1}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {pool.icon2}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">{pool.name}</div>
                          <div className="text-xs text-muted-foreground">{pool.details.asset1}</div>
                          <div className="text-xs text-muted-foreground">{pool.details.asset2}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-card-foreground">{pool.assetValue}</td>
                    <td className="py-4 text-card-foreground">{pool.tvl}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          pool.change24h > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {pool.change24h > 0 ? (
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 inline mr-1" />
                          )}
                          {pool.volume24h}
                        </span>
                        <MiniChart isPositive={pool.change24h > 0} />
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-card-foreground">{pool.poolLimits}</div>
                      <div className="text-xs text-muted-foreground">{pool.utilization}%</div>
                    </td>
                    <td className="py-4 text-card-foreground">{pool.openPositions}</td>
                    <td className="py-4 text-card-foreground">{pool.myStake}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleWithdraw(pool)}
                          className="hover:bg-muted"
                        >
                          Withdraw
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleInvest(pool)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Invest
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">6 results shown</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Invest Modal */}
      <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <DialogTitle className="text-lg font-semibold text-card-foreground">Invest</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Amount</label>
              <div className="flex items-center gap-2">
                <Input
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="flex-1 bg-input border-border"
                />
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-20 bg-input border-border">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                        {currencies.find(c => c.id === selectedCurrency)?.icon}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                            {currency.icon}
                          </span>
                          <span>{currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Transfer from</label>
              <Select value="account" disabled>
                <SelectTrigger className="bg-input border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                    <span>{transferAccount}</span>
                  </div>
                </SelectTrigger>
              </Select>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Fee</span>
                <span className="text-card-foreground">10.00 UNDEAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waiting Periods</span>
                <span className="text-card-foreground">1 day</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-border">
                <span className="text-card-foreground">Total</span>
                <span className="text-card-foreground">{calculateTotal(investAmount, "10")} UNDEAD</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsInvestModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmInvestment}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Investment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <DialogTitle className="text-lg font-semibold text-card-foreground">Withdraw</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Amount</label>
              <div className="flex items-center gap-2">
                <Input
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 bg-input border-border"
                />
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-20 bg-input border-border">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                        {currencies.find(c => c.id === selectedCurrency)?.icon}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                            {currency.icon}
                          </span>
                          <span>{currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Transfer to</label>
              <Select value="account" disabled>
                <SelectTrigger className="bg-input border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                    <span>{transferAccount}</span>
                  </div>
                </SelectTrigger>
              </Select>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Fee</span>
                <span className="text-card-foreground">5.00 UNDEAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waiting Periods</span>
                <span className="text-card-foreground">1 day</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-border">
                <span className="text-card-foreground">Total</span>
                <span className="text-card-foreground">{calculateTotal(withdrawAmount, "5")} UNDEAD</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmWithdrawal}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PivotPool;