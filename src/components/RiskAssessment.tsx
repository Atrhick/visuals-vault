import { Card } from "@/components/ui/card";
import { AlertTriangle, Shield, TrendingUp, Target, Zap } from "lucide-react";

interface RiskMetric {
  name: string;
  value: number;
  maxValue: number;
  level: "Low" | "Medium" | "High";
  description: string;
  icon: React.ReactNode;
}

const RiskAssessment = () => {
  const riskMetrics: RiskMetric[] = [
    {
      name: "Portfolio Volatility",
      value: 68,
      maxValue: 100,
      level: "Medium",
      description: "Based on 30-day price movements",
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      name: "Concentration Risk",
      value: 45,
      maxValue: 100,
      level: "Medium", 
      description: "Diversification across assets",
      icon: <Target className="w-4 h-4" />
    },
    {
      name: "Liquidity Risk",
      value: 25,
      maxValue: 100,
      level: "Low",
      description: "Ability to exit positions quickly",
      icon: <Zap className="w-4 h-4" />
    },
    {
      name: "Smart Contract Risk",
      value: 35,
      maxValue: 100,
      level: "Low",
      description: "Protocol security assessment",
      icon: <Shield className="w-4 h-4" />
    }
  ];

  const overallRiskScore = Math.round(
    riskMetrics.reduce((acc, metric) => acc + metric.value, 0) / riskMetrics.length
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";  
      case "High": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getOverallRiskLevel = (score: number): "Low" | "Medium" | "High" => {
    if (score <= 30) return "Low";
    if (score <= 60) return "Medium";
    return "High";
  };

  const overallLevel = getOverallRiskLevel(overallRiskScore);

  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground mb-2">Risk Assessment</h2>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-card-foreground">
              {overallRiskScore}/100
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRiskColor(overallLevel)}`}>
              {overallLevel} Risk
            </span>
          </div>
        </div>
        <div className="text-muted-foreground">
          <AlertTriangle className="w-8 h-8" />
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="space-y-4 mb-6">
        {riskMetrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">
                  {metric.icon}
                </div>
                <span className="font-medium text-card-foreground">{metric.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-card-foreground">
                  {metric.value}/{metric.maxValue}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(metric.level)}`}>
                  {metric.level}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metric.level === "Low" ? "bg-green-500" :
                  metric.level === "Medium" ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Risk Recommendations */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="font-medium text-card-foreground mb-2">Recommendations</h3>
        
        {overallRiskScore > 50 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800 dark:text-yellow-300">
                Consider Diversification
              </div>
              <div className="text-yellow-700 dark:text-yellow-400 mt-1">
                Your portfolio shows moderate concentration risk. Consider spreading investments across more protocols.
              </div>
            </div>
          </div>
        )}

        {riskMetrics.find(m => m.name === "Liquidity Risk")?.value! > 40 && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Zap className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-orange-800 dark:text-orange-300">
                Improve Liquidity
              </div>
              <div className="text-orange-700 dark:text-orange-400 mt-1">
                Some positions may be difficult to exit quickly. Consider maintaining liquid reserves.
              </div>
            </div>
          </div>
        )}

        {overallRiskScore <= 30 && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-green-800 dark:text-green-300">
                Well Balanced Portfolio
              </div>
              <div className="text-green-700 dark:text-green-400 mt-1">
                Your risk profile looks healthy. Continue monitoring and rebalancing as needed.
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskAssessment;