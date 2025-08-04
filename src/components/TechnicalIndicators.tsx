import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Activity, Zap } from "lucide-react";

interface TechnicalIndicatorProps {
  chartData: any[];
}

const TechnicalIndicators = ({ chartData }: TechnicalIndicatorProps) => {
  const [activeIndicators, setActiveIndicators] = useState<string[]>(["bollinger", "fibonacci"]);

  const toggleIndicator = (indicator: string) => {
    setActiveIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  // Calculate Bollinger Bands
  const calculateBollingerBands = (data: any[], period: number = 20) => {
    const bands = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sma = slice.reduce((sum, candle) => sum + candle.close, 0) / period;
      
      const variance = slice.reduce((sum, candle) => 
        sum + Math.pow(candle.close - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      bands.push({
        index: i,
        middle: sma,
        upper: sma + (stdDev * 2),
        lower: sma - (stdDev * 2)
      });
    }
    
    return bands;
  };

  // Calculate Fibonacci Retracement Levels
  const calculateFibonacci = (data: any[]) => {
    if (data.length === 0) return [];
    
    const prices = data.map(d => d.close);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const diff = high - low;
    
    const levels = [
      { level: "0%", price: high, percentage: 0 },
      { level: "23.6%", price: high - (diff * 0.236), percentage: 23.6 },
      { level: "38.2%", price: high - (diff * 0.382), percentage: 38.2 },
      { level: "50%", price: high - (diff * 0.5), percentage: 50 },
      { level: "61.8%", price: high - (diff * 0.618), percentage: 61.8 },
      { level: "78.6%", price: high - (diff * 0.786), percentage: 78.6 },
      { level: "100%", price: low, percentage: 100 }
    ];
    
    return levels;
  };

  const bollingerBands = calculateBollingerBands(chartData);
  const fibonacciLevels = calculateFibonacci(chartData);

  const EnhancedChart = () => {
    if (!chartData || chartData.length === 0) return null;

    const minPrice = Math.min(...chartData.map(d => d.low));
    const maxPrice = Math.max(...chartData.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const maxVolume = Math.max(...chartData.map(d => d.volume || 0));

    return (
      <div className="w-full h-[600px] bg-card rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="techGrid" width="50" height="30" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
            
            {/* Gradient for Bollinger Bands */}
            <linearGradient id="bollingerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          <rect width="1000" height="400" fill="url(#techGrid)" />
          
          {/* Price Levels */}
          <g className="text-xs fill-muted-foreground">
            <text x="970" y="50" textAnchor="end">{(maxPrice / 1000).toFixed(1)}k</text>
            <text x="970" y="125" textAnchor="end">{((maxPrice * 0.75 + minPrice * 0.25) / 1000).toFixed(1)}k</text>
            <text x="970" y="200" textAnchor="end">{((maxPrice + minPrice) / 2000).toFixed(1)}k</text>
            <text x="970" y="275" textAnchor="end">{((maxPrice * 0.25 + minPrice * 0.75) / 1000).toFixed(1)}k</text>
            <text x="970" y="350" textAnchor="end">{(minPrice / 1000).toFixed(1)}k</text>
          </g>

          {/* Fibonacci Retracement Levels */}
          {activeIndicators.includes("fibonacci") && fibonacciLevels.map((level, index) => {
            const y = 50 + ((maxPrice - level.price) / priceRange) * 300;
            const color = index % 2 === 0 ? "#FF6B35" : "#4DABF7";
            
            return (
              <g key={level.level}>
                <line
                  x1="30"
                  y1={y}
                  x2="850"
                  y2={y}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />
                <text
                  x="860"
                  y={y + 4}
                  className="fill-muted-foreground text-xs"
                >
                  {level.level} ({(level.price / 1000).toFixed(1)}k)
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands */}
          {activeIndicators.includes("bollinger") && bollingerBands.length > 0 && (
            <g>
              {/* Upper and Lower Band Lines */}
              <path
                d={bollingerBands.map((band, i) => {
                  const x = 30 + (band.index * 20);
                  const y = 50 + ((maxPrice - band.upper) / priceRange) * 300;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="hsl(142 71% 45%)"
                strokeWidth="1"
                strokeDasharray="3,3"
                fill="none"
                opacity="0.7"
              />
              
              <path
                d={bollingerBands.map((band, i) => {
                  const x = 30 + (band.index * 20);
                  const y = 50 + ((maxPrice - band.lower) / priceRange) * 300;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="hsl(142 71% 45%)"
                strokeWidth="1"
                strokeDasharray="3,3"
                fill="none"
                opacity="0.7"
              />

              {/* Middle Line (SMA) */}
              <path
                d={bollingerBands.map((band, i) => {
                  const x = 30 + (band.index * 20);
                  const y = 50 + ((maxPrice - band.middle) / priceRange) * 300;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="hsl(142 71% 45%)"
                strokeWidth="2"
                fill="none"
                opacity="0.9"
              />

              {/* Band Fill */}
              <path
                d={[
                  ...bollingerBands.map((band, i) => {
                    const x = 30 + (band.index * 20);
                    const y = 50 + ((maxPrice - band.upper) / priceRange) * 300;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }),
                  ...bollingerBands.slice().reverse().map((band, i) => {
                    const x = 30 + (band.index * 20);
                    const y = 50 + ((maxPrice - band.lower) / priceRange) * 300;
                    return `L ${x} ${y}`;
                  }),
                  'Z'
                ].join(' ')}
                fill="url(#bollingerGradient)"
              />
            </g>
          )}

          {/* Candlesticks */}
          {chartData.slice(0, 40).map((candle, index) => {
            const x = 30 + (index * 20);
            const normalizedHigh = 50 + ((maxPrice - candle.high) / priceRange) * 300;
            const normalizedLow = 50 + ((maxPrice - candle.low) / priceRange) * 300;
            const normalizedOpen = 50 + ((maxPrice - candle.open) / priceRange) * 300;
            const normalizedClose = 50 + ((maxPrice - candle.close) / priceRange) * 300;
            
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
            const volumeHeight = ((candle.volume || 0) / maxVolume) * 80;
            const isGreen = candle.close > candle.open;
            
            return (
              <rect
                key={`volume-${index}`}
                x={x - 6}
                y={420 - volumeHeight}
                width="12"
                height={volumeHeight}
                fill={isGreen ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                opacity="0.6"
                rx="1"
              />
            );
          })}

          {/* Time axis */}
          <g className="text-xs fill-muted-foreground">
            <text x="50" y="490" textAnchor="middle">1:00</text>
            <text x="200" y="490" textAnchor="middle">1:15</text>
            <text x="350" y="490" textAnchor="middle">1:30</text>
            <text x="500" y="490" textAnchor="middle">1:45</text>
            <text x="650" y="490" textAnchor="middle">2:00</text>
            <text x="800" y="490" textAnchor="middle">2:15</text>
          </g>
        </svg>
      </div>
    );
  };

  const indicatorOptions = [
    { id: "bollinger", name: "Bollinger Bands", icon: <Activity className="w-4 h-4" />, color: "bg-green-500" },
    { id: "fibonacci", name: "Fibonacci", icon: <TrendingUp className="w-4 h-4" />, color: "bg-orange-500" },
    { id: "macd", name: "MACD", icon: <BarChart3 className="w-4 h-4" />, color: "bg-blue-500" },
    { id: "rsi", name: "RSI", icon: <Zap className="w-4 h-4" />, color: "bg-purple-500" }
  ];

  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Technical Analysis</h3>
        
        <div className="flex items-center gap-2">
          {indicatorOptions.map((indicator) => (
            <Button
              key={indicator.id}
              variant={activeIndicators.includes(indicator.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleIndicator(indicator.id)}
              className="flex items-center gap-2"
            >
              {indicator.icon}
              <span className="hidden sm:inline">{indicator.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <EnhancedChart />

      {/* Indicator Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {activeIndicators.map((indicatorId) => {
          const indicator = indicatorOptions.find(opt => opt.id === indicatorId);
          if (!indicator) return null;
          
          return (
            <div key={indicatorId} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${indicator.color}`} />
              <span className="text-muted-foreground">{indicator.name}</span>
            </div>
          );
        })}
      </div>

      {/* Analysis Summary */}
      {activeIndicators.length > 0 && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-card-foreground mb-2">Current Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {activeIndicators.includes("bollinger") && bollingerBands.length > 0 && (
              <div>
                <span className="text-muted-foreground">Bollinger Position:</span>
                <span className="ml-2 font-medium text-card-foreground">
                  {(() => {
                    const latest = bollingerBands[bollingerBands.length - 1];
                    const currentPrice = chartData[chartData.length - 1]?.close || 0;
                    if (currentPrice > latest.upper) return "Above Upper Band";
                    if (currentPrice < latest.lower) return "Below Lower Band";
                    return "Within Bands";
                  })()}
                </span>
              </div>
            )}
            
            {activeIndicators.includes("fibonacci") && (
              <div>
                <span className="text-muted-foreground">Fib Support:</span>
                <span className="ml-2 font-medium text-card-foreground">
                  {(() => {
                    const currentPrice = chartData[chartData.length - 1]?.close || 0;
                    const supportLevel = fibonacciLevels.find(level => 
                      level.price < currentPrice && 
                      Math.abs(level.price - currentPrice) < (currentPrice * 0.05)
                    );
                    return supportLevel ? supportLevel.level : "No nearby support";
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TechnicalIndicators;