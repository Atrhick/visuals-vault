import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, LineChart } from "lucide-react";

interface PerformanceData {
  period: string;
  value: number;
  change: number;
  changePercent: number;
  data: { time: string; value: number; volume?: number }[];
}

const PortfolioPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"1D" | "7D" | "30D" | "1Y">("7D");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const performanceData: Record<string, PerformanceData> = {
    "1D": {
      period: "24 Hours",
      value: 162500,
      change: 2000,
      changePercent: 1.25,
      data: [
        { time: "00:00", value: 160500 },
        { time: "04:00", value: 161200 },
        { time: "08:00", value: 160800 },
        { time: "12:00", value: 161500 },
        { time: "16:00", value: 162000 },
        { time: "20:00", value: 162500 }
      ]
    },
    "7D": {
      period: "7 Days",
      value: 162500,
      change: 12000,
      changePercent: 7.98,
      data: [
        { time: "Mon", value: 150500 },
        { time: "Tue", value: 152000 },
        { time: "Wed", value: 155000 },
        { time: "Thu", value: 158000 },
        { time: "Fri", value: 160000 },
        { time: "Sat", value: 161000 },
        { time: "Sun", value: 162500 }
      ]
    },
    "30D": {
      period: "30 Days",
      value: 162500,
      change: 42500,
      changePercent: 35.42,
      data: [
        { time: "Week 1", value: 120000 },
        { time: "Week 2", value: 135000 },
        { time: "Week 3", value: 148000 },
        { time: "Week 4", value: 162500 }
      ]
    },
    "1Y": {
      period: "1 Year",
      value: 162500,
      change: 102500,
      changePercent: 170.83,
      data: [
        { time: "Jan", value: 60000 },
        { time: "Mar", value: 75000 },
        { time: "May", value: 95000 },
        { time: "Jul", value: 120000 },
        { time: "Sep", value: 140000 },
        { time: "Nov", value: 162500 }
      ]
    }
  };

  const currentData = performanceData[selectedPeriod];
  const isPositive = currentData.change >= 0;

  const LineChart = () => {
    const maxValue = Math.max(...currentData.data.map(d => d.value));
    const minValue = Math.min(...currentData.data.map(d => d.value));
    const valueRange = maxValue - minValue;

    const pathData = currentData.data.map((point, index) => {
      const x = 50 + (index * (1100 / (currentData.data.length - 1)));
      const y = 50 + ((maxValue - point.value) / valueRange) * 200;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-64" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        <defs>
          <pattern id="performanceGrid" width="50" height="25" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 25" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="1200" height="250" fill="url(#performanceGrid)" />

        {/* Y-axis labels */}
        <g className="text-xs fill-muted-foreground">
          <text x="40" y="60" textAnchor="end">{(maxValue / 1000).toFixed(0)}k</text>
          <text x="40" y="150" textAnchor="end">{((maxValue + minValue) / 2000).toFixed(0)}k</text>
          <text x="40" y="240" textAnchor="end">{(minValue / 1000).toFixed(0)}k</text>
        </g>

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={isPositive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"} stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        <path
          d={`${pathData} L ${50 + (1100)} 250 L 50 250 Z`}
          fill="url(#areaGradient)"
        />

        {/* Main line */}
        <path
          d={pathData}
          stroke={isPositive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {currentData.data.map((point, index) => {
          const x = 50 + (index * (1100 / (currentData.data.length - 1)));
          const y = 50 + ((maxValue - point.value) / valueRange) * 200;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={isPositive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
              stroke="white"
              strokeWidth="2"
              className="hover:r-6 transition-all cursor-pointer"
            />
          );
        })}

        {/* X-axis labels */}
        <g className="text-xs fill-muted-foreground">
          {currentData.data.map((point, index) => {
            const x = 50 + (index * (1100 / (currentData.data.length - 1)));
            return (
              <text key={index} x={x} y="280" textAnchor="middle">
                {point.time}
              </text>
            );
          })}
        </g>
      </svg>
    );
  };

  const BarChart = () => {
    const maxValue = Math.max(...currentData.data.map(d => d.value));
    const minValue = Math.min(...currentData.data.map(d => d.value));
    const valueRange = maxValue - minValue;
    const barWidth = 1100 / currentData.data.length - 20;

    return (
      <svg className="w-full h-64" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        <rect width="1200" height="250" fill="url(#performanceGrid)" />

        {/* Y-axis labels */}
        <g className="text-xs fill-muted-foreground">
          <text x="40" y="60" textAnchor="end">{(maxValue / 1000).toFixed(0)}k</text>
          <text x="40" y="150" textAnchor="end">{((maxValue + minValue) / 2000).toFixed(0)}k</text>
          <text x="40" y="240" textAnchor="end">{(minValue / 1000).toFixed(0)}k</text>
        </g>

        {/* Bars */}
        {currentData.data.map((point, index) => {
          const x = 50 + (index * (1100 / currentData.data.length)) + 10;
          const height = ((point.value - minValue) / valueRange) * 200;
          const y = 250 - height;
          
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={height}
              fill={isPositive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
              rx="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}

        {/* X-axis labels */}
        <g className="text-xs fill-muted-foreground">
          {currentData.data.map((point, index) => {
            const x = 50 + (index * (1100 / currentData.data.length)) + 10 + barWidth / 2;
            return (
              <text key={index} x={x} y="280" textAnchor="middle">
                {point.time}
              </text>
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground mb-2">Portfolio Performance</h2>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-card-foreground">
              {currentData.value.toLocaleString()} UNDEAD
            </div>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-medium">
                {isPositive ? '+' : ''}{currentData.change.toLocaleString()} 
                ({isPositive ? '+' : ''}{currentData.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {currentData.period} Performance
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className="h-8 px-3"
            >
              <LineChart className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="h-8 px-3"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {(["1D", "7D", "30D", "1Y"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="h-8 px-3"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        {chartType === "line" ? <LineChart /> : <BarChart />}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">High</div>
          <div className="font-semibold text-card-foreground">
            {Math.max(...currentData.data.map(d => d.value)).toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Low</div>
          <div className="font-semibold text-card-foreground">
            {Math.min(...currentData.data.map(d => d.value)).toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Average</div>
          <div className="font-semibold text-card-foreground">
            {Math.round(currentData.data.reduce((acc, d) => acc + d.value, 0) / currentData.data.length).toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Volatility</div>
          <div className="font-semibold text-card-foreground">
            {(((Math.max(...currentData.data.map(d => d.value)) - Math.min(...currentData.data.map(d => d.value))) / Math.min(...currentData.data.map(d => d.value))) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioPerformance;