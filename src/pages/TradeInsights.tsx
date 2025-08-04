import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Search, ZoomIn, BarChart3, TrendingUp, Plus, Activity, AlertTriangle, Target, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import TechnicalIndicators from "@/components/TechnicalIndicators";

interface TradingPair {
  id: string;
  name: string;
  icon1: string;
  icon2: string;
  price: number;
  change: number;
}

interface WalletAccount {
  id: string;
  name: string;
  balance: string;
  isActive: boolean;
}

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const tradingPairs: TradingPair[] = [
  { id: "eth-undead", name: "ETH/UNDEAD", icon1: "⟐", icon2: "●", price: 42500, change: 2.5 },
  { id: "btc-undead", name: "BTC/UNDEAD", icon1: "₿", icon2: "●", price: 58000, change: -1.2 },
  { id: "btc-eth", name: "BTC/ETH", icon1: "₿", icon2: "⟐", price: 1.38, change: 0.8 }
];

const walletAccounts: WalletAccount[] = [
  { id: "1", name: "Account q106-ehjw-q346g", balance: "42500.00", isActive: true },
  { id: "2", name: "Account w622-kapf-l120r", balance: "42000.00", isActive: false },
  { id: "3", name: "Account s483-vasx-g126d", balance: "41500.00", isActive: false }
];

// Generate mock chart data
const generateChartData = (points: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let basePrice = 40000;
  
  for (let i = 0; i < points; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() + i * 5);
    
    const volatility = 500;
    const trend = Math.sin(i * 0.1) * 200;
    
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + trend + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;
    const volume = Math.random() * 1000;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      open,
      high,
      low,
      close,
      volume
    });
    
    basePrice = close;
  }
  
  return data;
};

const TradeInsights = () => {
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");
  const [chartData] = useState(() => generateChartData(60));
  
  const timeframes = ["24h", "7d", "30d"];
  
  const CandlestickChart = () => {
    const minPrice = Math.min(...chartData.map(d => d.low));
    const maxPrice = Math.max(...chartData.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const maxVolume = Math.max(...chartData.map(d => d.volume));
    
    return (
      <div className="w-full h-[500px] bg-card rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          {/* Price Grid Lines */}
          <defs>
            <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          
          <rect width="1000" height="300" fill="url(#grid)" />
          
          {/* Price Levels */}
          <g className="text-xs fill-muted-foreground">
            <text x="970" y="50" textAnchor="end">42500.00</text>
            <text x="970" y="100" textAnchor="end">42000.00</text>
            <text x="970" y="150" textAnchor="end">41500.00</text>
            <text x="970" y="200" textAnchor="end">41000.00</text>
            <text x="970" y="250" textAnchor="end">40500.00</text>
            <text x="970" y="290" textAnchor="end">40000.00</text>
          </g>
          
          {/* Current Price Line */}
          <line x1="0" y1="80" x2="850" y2="80" stroke="#f97316" strokeWidth="1" strokeDasharray="5,5" opacity="0.8" />
          <text x="860" y="85" className="fill-orange-500 text-xs font-medium">40000.00</text>
          
          {/* Candlesticks */}
          {chartData.slice(0, 40).map((candle, index) => {
            const x = 30 + (index * 20);
            const normalizedHigh = 40 + ((maxPrice - candle.high) / priceRange) * 200;
            const normalizedLow = 40 + ((maxPrice - candle.low) / priceRange) * 200;
            const normalizedOpen = 40 + ((maxPrice - candle.open) / priceRange) * 200;
            const normalizedClose = 40 + ((maxPrice - candle.close) / priceRange) * 200;
            
            const isGreen = candle.close > candle.open;
            const bodyTop = Math.min(normalizedOpen, normalizedClose);
            const bodyHeight = Math.abs(normalizedClose - normalizedOpen);
            
            return (
              <g key={index}>
                {/* High-Low line */}
                <line
                  x1={x}
                  y1={normalizedHigh}
                  x2={x}
                  y2={normalizedLow}
                  stroke={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                  strokeWidth="1"
                />
                
                {/* Candle body */}
                <rect
                  x={x - 6}
                  y={bodyTop}
                  width="12"
                  height={Math.max(bodyHeight, 1)}
                  fill={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                  stroke={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                  strokeWidth="1"
                  rx="1"
                />
              </g>
            );
          })}
          
          {/* Volume bars */}
          {chartData.slice(0, 40).map((candle, index) => {
            const x = 30 + (index * 20);
            const volumeHeight = (candle.volume / maxVolume) * 80;
            const isGreen = candle.close > candle.open;
            
            return (
              <rect
                key={`volume-${index}`}
                x={x - 6}
                y={320 - volumeHeight}
                width="12"
                height={volumeHeight}
                fill={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                opacity="0.6"
                rx="1"
              />
            );
          })}
          
          {/* Volume scale */}
          <g className="text-xs fill-muted-foreground">
            <text x="970" y="320" textAnchor="end">800k</text>
            <text x="970" y="370" textAnchor="end">0</text>
          </g>
          
          {/* Time axis */}
          <g className="text-xs fill-muted-foreground">
            <text x="50" y="395" textAnchor="middle">1:00</text>
            <text x="200" y="395" textAnchor="middle">1:15</text>
            <text x="350" y="395" textAnchor="middle">1:30</text>
            <text x="500" y="395" textAnchor="middle">1:45</text>
            <text x="650" y="395" textAnchor="middle">2:00</text>
            <text x="800" y="395" textAnchor="middle">2:15</text>
          </g>
        </svg>
      </div>
    );
  };
  
  const LineChart = () => {
    const minPrice = Math.min(...chartData.map(d => d.close));
    const maxPrice = Math.max(...chartData.map(d => d.close));
    const priceRange = maxPrice - minPrice;
    
    // Generate path for green and red lines
    const midPrice = (minPrice + maxPrice) / 2;
    const greenPath = chartData.slice(0, 40).map((candle, index) => {
      const x = 30 + (index * 20);
      const y = 40 + ((maxPrice - Math.max(candle.close, midPrice)) / priceRange) * 200;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    const redPath = chartData.slice(0, 40).map((candle, index) => {
      const x = 30 + (index * 20);
      const y = 40 + ((maxPrice - Math.min(candle.close, midPrice)) / priceRange) * 200;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return (
      <div className="w-full h-[500px] bg-card rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          <defs>
            <pattern id="lineGrid" width="50" height="30" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          
          <rect width="1000" height="300" fill="url(#lineGrid)" />
          
          {/* Price Levels */}
          <g className="text-xs fill-muted-foreground">
            <text x="970" y="50" textAnchor="end">42500.00</text>
            <text x="970" y="100" textAnchor="end">42000.00</text>
            <text x="970" y="150" textAnchor="end">41500.00</text>
            <text x="970" y="200" textAnchor="end">41000.00</text>
            <text x="970" y="250" textAnchor="end">40500.00</text>
            <text x="970" y="290" textAnchor="end">40000.00</text>
          </g>
          
          {/* Current Price Line */}
          <line x1="0" y1="80" x2="850" y2="80" stroke="#f97316" strokeWidth="1" strokeDasharray="5,5" opacity="0.8" />
          <text x="860" y="85" className="fill-orange-500 text-xs font-medium">40000.00</text>
          
          {/* Price Lines */}
          <path
            d={greenPath}
            stroke="hsl(142 71% 45%)"
            strokeWidth="2"
            fill="none"
          />
          
          <path
            d={redPath}
            stroke="hsl(0 84% 60%)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Volume scale */}
          <g className="text-xs fill-muted-foreground">
            <text x="970" y="370" textAnchor="end">800k</text>
            <text x="970" y="390" textAnchor="end">0</text>
          </g>
          
          {/* Time axis */}
          <g className="text-xs fill-muted-foreground">
            <text x="50" y="395" textAnchor="middle">1:00</text>
            <text x="200" y="395" textAnchor="middle">1:15</text>
            <text x="350" y="395" textAnchor="middle">1:30</text>
            <text x="500" y="395" textAnchor="middle">1:45</text>
            <text x="650" y="395" textAnchor="middle">2:00</text>
            <text x="800" y="395" textAnchor="middle">2:15</text>
          </g>
        </svg>
      </div>
    );
  };
  
  return (
    <DashboardLayout title="Trade Insights">
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex gap-6">
          {/* Main Chart Area */}
          <div className="flex-1 space-y-4">
            {/* Chart Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Trading Pair Selector */}
                <Select value={selectedPair.id} onValueChange={(value) => {
                  const pair = tradingPairs.find(p => p.id === value);
                  if (pair) setSelectedPair(pair);
                }}>
                  <SelectTrigger className="w-48 bg-card border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs z-10">
                          {selectedPair.icon1}
                        </div>
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          {selectedPair.icon2}
                        </div>
                      </div>
                      <span className="font-medium">{selectedPair.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {tradingPairs.map((pair) => (
                      <SelectItem key={pair.id} value={pair.id}>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center -space-x-1">
                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs z-10">
                              {pair.icon1}
                            </div>
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                              {pair.icon2}
                            </div>
                          </div>
                          <span>{pair.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Chart Tools */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="w-8 h-8">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-8 h-8">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Chart Type Toggle */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant={chartType === "candlestick" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("candlestick")}
                    className="h-8 px-3"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className="h-8 px-3"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Timeframe Selector */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  {timeframes.map((timeframe) => (
                    <Button
                      key={timeframe}
                      variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className="h-8 px-3"
                    >
                      {timeframe}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Chart */}
            {chartType === "candlestick" ? <CandlestickChart /> : <LineChart />}
          </div>
          
          {/* Technical Analysis */}
          <div className="col-span-full">
            <TechnicalIndicators chartData={chartData} />
          </div>
          
          {/* Trading Panels Sidebar */}
          <div className="w-80 space-y-6">
            {/* Technical Indicators Widget */}
            <Card className="p-4 bg-card border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Technical Indicators
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* RSI */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">RSI (14)</span>
                    <span className="text-sm font-medium text-card-foreground">65.4</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65.4%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Oversold</span>
                    <span>Overbought</span>
                  </div>
                </div>
                
                {/* MACD */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">MACD</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Bullish</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Signal: 0.0045 | Histogram: 0.0012
                  </div>
                </div>
                
                {/* Moving Averages */}
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Moving Averages</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">MA 20</span>
                      <span className="text-green-600">↗ 42,150</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">MA 50</span>
                      <span className="text-green-600">↗ 41,890</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">MA 200</span>
                      <span className="text-red-600">↘ 40,250</span>
                    </div>
                  </div>
                </div>
                
                {/* Volume Analysis */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volume</span>
                    <span className="text-sm font-medium text-card-foreground">1.2M</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">Above Average (+15%)</span>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Quick Trade Panel */}
            <Card className="p-4 bg-card border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Quick Trade
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Order Type Toggle */}
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                  >
                    Market
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                  >
                    Limit
                  </Button>
                </div>
                
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Amount</label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="0.00"
                      className="flex-1 bg-input border-border h-9 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">UNDEAD</span>
                  </div>
                </div>
                
                {/* Price Input (for limit orders) */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Price</label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="42,500.00"
                      className="flex-1 bg-input border-border h-9 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">UNDEAD</span>
                  </div>
                </div>
                
                {/* Risk Controls */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-muted-foreground">Risk Controls</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Stop Loss</label>
                      <Input
                        placeholder="40,000"
                        className="bg-input border-border h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Take Profit</label>
                      <Input
                        placeholder="45,000"
                        className="bg-input border-border h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Trade Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button className="bg-green-600 hover:bg-green-700 text-white h-10 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    <span className="text-sm font-medium">BUY</span>
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white h-10 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" />
                    <span className="text-sm font-medium">SELL</span>
                  </Button>
                </div>
                
                {/* Portfolio Info */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                  Available: 15,200 UNDEAD | Position: 0%
                </div>
              </div>
            </Card>
            
            {/* Wallets Card (Simplified) */}
            <Card className="p-4 bg-card border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-card-foreground text-sm">Active Wallet</h3>
                <Button variant="outline" size="icon" className="w-6 h-6">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-card-foreground truncate">
                    Account q106-ehjw-q346g
                  </div>
                  <div className="text-xs text-muted-foreground">
                    42,500.00 UNDEAD
                  </div>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TradeInsights;