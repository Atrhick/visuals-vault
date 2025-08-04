import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, MoreHorizontal, Activity, Target } from "lucide-react";
import PortfolioPerformance from "@/components/PortfolioPerformance";
import RiskAssessment from "@/components/RiskAssessment";
import DiversificationAnalysis from "@/components/DiversificationAnalysis";

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

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
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

// Sample candlestick data for the last 20 time periods
const mockCandleData: CandleData[] = [
  { time: "1:00 PM", open: 85000, high: 87000, low: 84000, close: 86500 },
  { time: "1:20 PM", open: 86500, high: 88000, low: 85500, close: 87200 },
  { time: "1:40 PM", open: 87200, high: 89000, low: 86800, close: 88500 },
  { time: "2:00 PM", open: 88500, high: 90000, low: 87000, close: 87800 },
  { time: "2:20 PM", open: 87800, high: 89500, low: 86500, close: 89000 },
  { time: "2:40 PM", open: 89000, high: 91000, low: 88000, close: 90200 },
  { time: "3:00 PM", open: 90200, high: 92000, low: 89500, close: 91500 },
  { time: "3:20 PM", open: 91500, high: 93000, low: 90000, close: 92800 },
  { time: "3:40 PM", open: 92800, high: 94500, low: 91500, close: 93200 },
  { time: "4:00 PM", open: 93200, high: 95000, low: 92000, close: 94100 },
  { time: "4:20 PM", open: 94100, high: 96000, low: 93500, close: 95200 },
  { time: "4:40 PM", open: 95200, high: 97000, low: 94000, close: 96500 },
  { time: "5:00 PM", open: 96500, high: 98000, low: 95500, close: 97200 },
  { time: "5:20 PM", open: 97200, high: 99000, low: 96000, close: 98100 },
  { time: "5:40 PM", open: 98100, high: 100000, low: 97000, close: 99200 },
  { time: "6:00 PM", open: 99200, high: 101000, low: 98500, close: 100500 },
  { time: "6:20 PM", open: 100500, high: 102000, low: 99000, close: 101200 },
  { time: "6:40 PM", open: 101200, high: 103000, low: 100000, close: 102100 },
  { time: "7:00 PM", open: 102100, high: 104000, low: 101500, close: 103200 },
  { time: "7:20 PM", open: 103200, high: 105000, low: 102000, close: 104500 },
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
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleCandleHover = (index: number, event: React.MouseEvent) => {
    setHoveredCandle(index);
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handleCandleLeave = () => {
    setHoveredCandle(null);
  };

  return (
    <div className="px-6 pb-6 space-y-6 bg-background min-h-screen">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Portfolio Performance Card */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Portfolio Performance</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            {/* 24h P&L */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">24h P&L</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-card-foreground">+2,450.00</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                  +1.52%
                </span>
              </div>
            </div>
            
            {/* Monthly Returns */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">Monthly Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-card-foreground">+18,200.00</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                  +12.85%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Active Positions Summary */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Positions</h3>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            {/* Active Stakes */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Stakes</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-card-foreground">8</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
            
            {/* Active Trades */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Open Trades</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-card-foreground">3</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
            </div>
            
            {/* Total Value */}
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Value</span>
                <span className="text-sm font-bold text-card-foreground">45,800 UNDEAD</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Total Value Locked */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <h3 className="text-sm text-muted-foreground mb-2">Total Value Locked</h3>
          <p className="text-2xl font-bold text-card-foreground">2.8M UNDEAD</p>
        </Card>
        
        {/* Available Balance */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <h3 className="text-sm text-muted-foreground mb-2">Available Balance</h3>
          <p className="text-2xl font-bold text-card-foreground">15,200 UNDEAD</p>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <div className="grid grid-cols-1 gap-6">
        <PortfolioPerformance />
      </div>

      {/* Risk Assessment and Diversification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskAssessment />
        <div className="space-y-6">
          <DiversificationAnalysis />
        </div>
      </div>

      {/* Portfolio Value Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-card border-border shadow-sm">
          <h2 className="text-lg font-medium text-card-foreground mb-2">Portfolio Value</h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-card-foreground">160,500.00 UNDEAD</span>
            <span className="text-accent font-medium">+10%</span>
          </div>
          
          {/* Candlestick Chart */}
          <div className="h-64 bg-muted rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent"></div>
            <div className="w-full h-full relative p-4">
              {/* Candlestick Chart */}
              <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Grid pattern */}
                  <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 24" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                
                {/* Grid background */}
                <rect width="800" height="240" fill="url(#grid)" />
                
                {/* Y-axis labels */}
                <g className="text-xs fill-muted-foreground">
                  <text x="15" y="30" textAnchor="end">105k</text>
                  <text x="15" y="80" textAnchor="end">95k</text>
                  <text x="15" y="130" textAnchor="end">90k</text>
                  <text x="15" y="180" textAnchor="end">85k</text>
                  <text x="15" y="230" textAnchor="end">80k</text>
                </g>
                
                {/* Candlesticks */}
                {mockCandleData.map((candle, index) => {
                  const x = 50 + (index * 37);
                  const minPrice = 80000;
                  const maxPrice = 105000;
                  const priceRange = maxPrice - minPrice;
                  
                  // Convert prices to y coordinates (inverted)
                  const highY = 20 + ((maxPrice - candle.high) / priceRange) * 200;
                  const lowY = 20 + ((maxPrice - candle.low) / priceRange) * 200;
                  const openY = 20 + ((maxPrice - candle.open) / priceRange) * 200;
                  const closeY = 20 + ((maxPrice - candle.close) / priceRange) * 200;
                  
                  const isGreen = candle.close > candle.open;
                  const bodyTop = Math.min(openY, closeY);
                  const bodyHeight = Math.abs(closeY - openY);
                  const isHovered = hoveredCandle === index;
                  
                  return (
                    <g key={index}>
                      {/* Invisible hover area */}
                      <rect
                        x={x - 18}
                        y={0}
                        width="36"
                        height="240"
                        fill="transparent"
                        style={{ cursor: 'crosshair' }}
                        onMouseEnter={(e) => handleCandleHover(index, e)}
                        onMouseMove={(e) => handleCandleHover(index, e)}
                        onMouseLeave={handleCandleLeave}
                      />
                      
                      {/* High-Low line */}
                      <line
                        x1={x}
                        y1={highY}
                        x2={x}
                        y2={lowY}
                        stroke={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                        strokeWidth={isHovered ? "2" : "1"}
                        style={{ transition: 'stroke-width 0.2s ease' }}
                        pointerEvents="none"
                      />
                      
                      {/* Candle body */}
                      <rect
                        x={x - 8}
                        y={bodyTop}
                        width="16"
                        height={Math.max(bodyHeight, 2)}
                        fill={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                        stroke={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                        strokeWidth={isHovered ? "2" : "1"}
                        rx="1"
                        style={{ 
                          transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                          opacity: isHovered ? 0.8 : 1
                        }}
                        pointerEvents="none"
                      />
                      
                      {/* Hover highlight */}
                      {isHovered && (
                        <rect
                          x={x - 18}
                          y={0}
                          width="36"
                          height="240"
                          fill="hsl(var(--primary) / 0.1)"
                          pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}
                
                {/* X-axis time labels */}
                <g className="text-xs fill-muted-foreground">
                  <text x="50" y="235" textAnchor="middle">1:00 PM</text>
                  <text x="200" y="235" textAnchor="middle">2:00 PM</text>
                  <text x="350" y="235" textAnchor="middle">3:00 PM</text>
                  <text x="500" y="235" textAnchor="middle">5:00 PM</text>
                  <text x="650" y="235" textAnchor="middle">7:00 PM</text>
                </g>
              </svg>
              
              {/* Interactive Tooltip */}
              {hoveredCandle !== null && (
                <div 
                  className="absolute bg-card border border-border rounded-lg p-3 text-sm shadow-lg z-10 pointer-events-none transition-all duration-200 ease-out"
                  style={{
                    left: Math.min(mousePosition.x + 10, 300), // Prevent tooltip from going off-screen
                    top: Math.max(mousePosition.y - 80, 10),
                    transform: hoveredCandle !== null ? 'scale(1)' : 'scale(0.95)',
                    opacity: hoveredCandle !== null ? 1 : 0
                  }}
                >
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs font-medium">
                      {mockCandleData[hoveredCandle].time}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Open: </span>
                        <span className="font-medium text-card-foreground">
                          {(mockCandleData[hoveredCandle].open / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">High: </span>
                        <span className="font-medium text-card-foreground">
                          {(mockCandleData[hoveredCandle].high / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Low: </span>
                        <span className="font-medium text-card-foreground">
                          {(mockCandleData[hoveredCandle].low / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Close: </span>
                        <span className="font-medium text-card-foreground">
                          {(mockCandleData[hoveredCandle].close / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-border">
                      <div className={`text-xs font-medium ${
                        mockCandleData[hoveredCandle].close > mockCandleData[hoveredCandle].open 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {mockCandleData[hoveredCandle].close > mockCandleData[hoveredCandle].open ? '+' : ''}
                        {((mockCandleData[hoveredCandle].close - mockCandleData[hoveredCandle].open) / 1000).toFixed(1)}k UNDEAD
                        {' '}({((mockCandleData[hoveredCandle].close - mockCandleData[hoveredCandle].open) / mockCandleData[hoveredCandle].open * 100).toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Static Tooltip (when not hovering) */}
              {hoveredCandle === null && (
                <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 text-sm shadow-sm">
                  <div className="text-muted-foreground text-xs">Wed, Nov 6, 2024 at 7:20 PM</div>
                  <div className="font-medium text-card-foreground">Current: 104,500 UNDEAD</div>
                  <div className="text-accent text-xs">+24,500 (+30.5%)</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-card-foreground">Recent Transactions</h2>
            <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto font-medium">
              View all
            </Button>
          </div>
          
          <div className="space-y-3">
            {mockTransactions.map((transaction, index) => (
              <div key={transaction.id}>
                {index === 0 && (
                  <div className="text-xs text-muted-foreground mb-3 font-medium">{transaction.date}</div>
                )}
                {index === 2 && (
                  <div className="text-xs text-muted-foreground mb-3 mt-4 font-medium">{transaction.date}</div>
                )}
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm text-card-foreground">
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
                  
                  <Button size="sm" variant="ghost" className="ml-2 text-muted-foreground hover:text-card-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Assets */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground mb-6">Assets (3)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockAssets.map((asset) => (
            <Card key={asset.id} className="p-4 bg-muted/50 border-border hover:bg-muted transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary">
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
          <Card className="p-4 border-2 border-dashed border-primary/30 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
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