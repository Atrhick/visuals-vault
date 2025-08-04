import { Card } from "@/components/ui/card";
import { PieChart, BarChart3, TrendingUp } from "lucide-react";

interface AssetAllocation {
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  color: string;
  risk: "Low" | "Medium" | "High";
  category: "DeFi" | "Staking" | "Liquidity" | "Governance";
}

interface ProtocolAllocation {
  protocol: string;
  value: number;
  percentage: number;
  color: string;
  assets: string[];
}

const DiversificationAnalysis = () => {
  const assetAllocations: AssetAllocation[] = [
    { name: "Ethereum", symbol: "ETH", value: 45000, percentage: 27.7, color: "#627EEA", risk: "Medium", category: "DeFi" },
    { name: "UNDEAD", symbol: "UNDEAD", value: 40000, percentage: 24.6, color: "#FF6B35", risk: "High", category: "Governance" },
    { name: "Bitcoin", symbol: "BTC", value: 35000, percentage: 21.5, color: "#F7931A", risk: "Low", category: "Staking" },
    { name: "LP Tokens", symbol: "LP", value: 25000, percentage: 15.4, color: "#4DABF7", risk: "Medium", category: "Liquidity" },
    { name: "Staked ETH", symbol: "stETH", value: 17500, percentage: 10.8, color: "#00D4AA", risk: "Low", category: "Staking" }
  ];

  const protocolAllocations: ProtocolAllocation[] = [
    { protocol: "PivotSwap", value: 65000, percentage: 40.0, color: "#8B5CF6", assets: ["ETH/UNDEAD LP", "BTC/ETH LP"] },
    { protocol: "PivotStake", value: 45000, percentage: 27.7, color: "#06B6D4", assets: ["UNDEAD", "stETH"] },
    { protocol: "External", value: 35000, percentage: 21.5, color: "#10B981", assets: ["BTC", "ETH"] },
    { protocol: "PivotYield", value: 17500, percentage: 10.8, color: "#F59E0B", assets: ["High Yield Pool"] }
  ];

  const totalValue = assetAllocations.reduce((sum, asset) => sum + asset.value, 0);

  const PieChartComponent = () => {
    let currentAngle = 0;
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    return (
      <div className="flex items-center justify-center">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {assetAllocations.map((asset, index) => {
            const angle = (asset.percentage / 100) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            const path = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            currentAngle += angle;

            return (
              <path
                key={asset.symbol}
                d={path}
                fill={asset.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
          
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="45"
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="text-sm font-medium fill-card-foreground"
          >
            Total
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {(totalValue / 1000).toFixed(0)}k
          </text>
        </svg>
      </div>
    );
  };

  const getDiversificationScore = () => {
    // Calculate Herfindahl-Hirschman Index (HHI) for diversification
    const hhi = assetAllocations.reduce((sum, asset) => {
      return sum + Math.pow(asset.percentage, 2);
    }, 0);
    
    // Convert HHI to a score (lower HHI = better diversification)
    // Perfect diversification (5 equal assets) would be 2000 HHI
    // Convert to 0-100 scale where 100 is perfectly diversified
    const score = Math.max(0, 100 - ((hhi - 2000) / 80));
    return Math.round(score);
  };

  const diversificationScore = getDiversificationScore();

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 75) return "Well Diversified";
    if (score >= 50) return "Moderately Diversified";
    return "Concentrated";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Allocation */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Asset Allocation</h2>
          <PieChart className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PieChartComponent />
          
          <div className="space-y-3">
            {assetAllocations.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: asset.color }}
                  />
                  <div>
                    <div className="font-medium text-card-foreground text-sm">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {asset.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-card-foreground text-sm">
                    {asset.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(asset.value / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Protocol Distribution */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Protocol Distribution</h2>
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {protocolAllocations.map((protocol) => (
            <div key={protocol.protocol} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: protocol.color }}
                  />
                  <span className="font-medium text-card-foreground">
                    {protocol.protocol}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-card-foreground">
                    {protocol.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(protocol.value / 1000).toFixed(0)}k UNDEAD
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: protocol.color,
                    width: `${protocol.percentage}%` 
                  }}
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                Assets: {protocol.assets.join(", ")}
              </div>
            </div>
          ))}
        </div>

        {/* Diversification Score */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-card-foreground">Diversification Score</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(diversificationScore)}`}>
                {diversificationScore}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                diversificationScore >= 75 ? "bg-green-500" :
                diversificationScore >= 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${diversificationScore}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${getScoreColor(diversificationScore)}`}>
              {getScoreLevel(diversificationScore)}
            </span>
            <TrendingUp className={`w-4 h-4 ${getScoreColor(diversificationScore)}`} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DiversificationAnalysis;