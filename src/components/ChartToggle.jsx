import React from 'react';
import { useAtom } from 'jotai';
import { chartTypeAtom } from '../stores/chartTypeStore';
import { BarChart3, TrendingUp } from 'lucide-react';

const ChartToggle = () => {
  const [chartType, setChartType] = useAtom(chartTypeAtom);

  return (
    <div className="flex items-center space-x-1 bg-card border rounded-lg p-1">
      <button
        onClick={() => setChartType('tradingview')}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          chartType === 'tradingview'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
        title="TradingView 차트"
      >
        <BarChart3 size={14} />
        <span>TradingView</span>
      </button>
      
      <button
        onClick={() => setChartType('okx')}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          chartType === 'okx'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
        title="OKX 네이티브 차트"
      >
        <TrendingUp size={14} />
        <span>OKX</span>
      </button>
    </div>
  );
};

export default ChartToggle;