import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  icon: string;
  amount: string;
  currency: string;
  change: string;
  isPositive: boolean;
}

interface Transaction {
  id: string;
  name: string;
  icon: string;
  type: "Deposit" | "Withdraw";
  amount: string;
  currency: string;
  time: string;
  date: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "Ethereum",
    icon: "⟐",
    amount: "5,850.00",
    currency: "UNDEAD",
    change: "+10%",
    isPositive: true,
  },
  {
    id: "2", 
    name: "CoinMarket",
    icon: "◉",
    amount: "5,850.00",
    currency: "UNDEAD",
    change: "+10%",
    isPositive: true,
  },
  {
    id: "3",
    name: "Bitcoin",
    icon: "₿",
    amount: "5,850.00", 
    currency: "UNDEAD",
    change: "+10%",
    isPositive: true,
  },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    name: "Ethereum",
    icon: "⟐",
    type: "Deposit",
    amount: "-50.25",
    currency: "UNDEAD",
    time: "23:46:17",
    date: "Today",
  },
  {
    id: "2",
    name: "CoinMarket", 
    icon: "◉",
    type: "Withdraw",
    amount: "-100.00",
    currency: "UNDEAD",
    time: "23:46:17",
    date: "Today",
  },
  {
    id: "3",
    name: "Bitcoin",
    icon: "₿",
    type: "Deposit", 
    amount: "-50.25",
    currency: "UNDEAD",
    time: "23:46:17",
    date: "Yesterday",
  },
];

export default function DashboardOverview() {
  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Value */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-gradient-card border-border">
          <h2 className="text-lg font-medium text-card-foreground mb-2">Portfolio Value</h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-card-foreground">160,500.00 UNDEAD</span>
            <span className="text-accent font-medium">+10%</span>
          </div>
          
          {/* Chart placeholder */}
          <div className="h-64 bg-secondary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20"></div>
            <div className="relative">
              {/* Simple chart visualization */}
              <svg width="400" height="150" viewBox="0 0 400 150" className="text-primary">
                <path
                  d="M 0 100 Q 50 80 100 90 T 200 70 T 300 50 T 400 40"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <circle cx="300" cy="50" r="4" fill="currentColor" />
              </svg>
              
              {/* Tooltip */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg p-3 text-sm">
                <div className="text-muted-foreground">Wed, Nov 6, 2024 at 2:00 PM</div>
                <div className="font-medium text-card-foreground">Total Value: 70k UNDEAD</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 bg-gradient-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-card-foreground">Recent Transactions</h2>
            <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto">
              View all
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockTransactions.map((transaction, index) => (
              <div key={transaction.id}>
                {index === 0 && (
                  <div className="text-xs text-muted-foreground mb-3">{transaction.date}</div>
                )}
                {index === 2 && (
                  <div className="text-xs text-muted-foreground mb-3 mt-4">{transaction.date}</div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                      {transaction.icon}
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">{transaction.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {transaction.type === "Deposit" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {transaction.type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-card-foreground">
                      {transaction.amount} {transaction.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">{transaction.time}</div>
                  </div>
                  
                  <Button size="sm" variant="ghost" className="ml-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Assets */}
      <Card className="p-6 bg-gradient-card border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-6">Assets (3)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockAssets.map((asset) => (
            <Card key={asset.id} className="p-4 bg-secondary/50 border-border hover:bg-secondary/70 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                    {asset.icon}
                  </div>
                  <span className="font-medium text-card-foreground">{asset.name}</span>
                </div>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="text-xl font-bold text-card-foreground">
                  {asset.amount} {asset.currency}
                </div>
                <div className={`text-sm font-medium ${asset.isPositive ? 'text-accent' : 'text-destructive'}`}>
                  {asset.change}
                </div>
              </div>
            </Card>
          ))}
          
          {/* Add Asset Button */}
          <Card className="p-4 border-2 border-dashed border-primary/50 bg-transparent hover:border-primary transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium text-primary">Add Asset</span>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}