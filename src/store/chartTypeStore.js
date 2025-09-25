import { atom } from 'jotai';

// 차트 타입 선택 아톰 (tradingview | okx)
export const chartTypeAtom = atom('tradingview');

// 차트 설정 아톰
export const chartConfigAtom = atom({
  enableOrderOverlay: true,
  enableRealTimeUpdate: true,
  defaultTimeframe: '15m',
  showVolume: true,
  showGrid: true,
  autoFitContent: true
});

// OKX 차트 전용 설정
export const okxChartConfigAtom = atom({
  theme: {
    upColor: '#22c55e',
    downColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
    borderUpColor: '#22c55e',
    borderDownColor: '#ef4444'
  },
  timeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
  defaultSymbol: 'BTC/USDT'
});