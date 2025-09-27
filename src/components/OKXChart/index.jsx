import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useAtomValue } from 'jotai';
import { isDemoAtom } from '../../stores/isDemoStore';
import useOKXChartData from './hooks/useOKXChartData';
import useOKXOrders from './hooks/useOKXOrders';
import OrderOverlay from './OrderOverlay';
import SampleData from './SampleData';

const OKXChart = ({ 
  symbol = 'BTC/USDT', 
  isDarkMode = true,
  height = '500px',
  onSymbolChange,
  orders = [],
  positions = []
}) => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const candlestickSeries = useRef();
  const [timeframe, setTimeframe] = useState('15m');
  const [sampleOrders, setSampleOrders] = useState([]);
  const [samplePositions, setSamplePositions] = useState([]);
  const isDemo = useAtomValue(isDemoAtom);
  
  // 커스텀 훅으로 데이터 관리 (demo 모드 포함)
  const { candleData, loading, error, loadCandles } = useOKXChartData(symbol, timeframe, isDemo);
  
  // 실제 주문/포지션 데이터 훅
  const { 
    orders: realOrders, 
    positions: realPositions, 
    loading: ordersLoading, 
    error: ordersError,
    loadOrdersAndPositions 
  } = useOKXOrders(symbol, isDemo);

  // 실제 주문/포지션 데이터와 샘플 데이터 병합
  const displayOrders = [...orders, ...realOrders, ...sampleOrders];
  const displayPositions = [...positions, ...realPositions, ...samplePositions];

  // 샘플 데이터 적용 핸들러
  const handleApplySampleData = (newOrders, newPositions) => {
    setSampleOrders(newOrders);
    setSamplePositions(newPositions);
  };

  // 차트 초기화
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current) {
      console.warn('차트 컨테이너 ref가 없습니다');
      return;
    }

    // 기존 차트가 있으면 완전히 제거
    if (chart.current) {
      console.log('🧹 기존 차트 정리 시작');
      try {
        // price line들 먼저 정리
        if (candlestickSeries.current) {
          candlestickSeries.current = null;
        }
        
        // 차트 제거
        chart.current.remove();
        chart.current = null;
        console.log('✅ 기존 차트 제거 완료');
      } catch (e) {
        console.warn('기존 차트 제거 중 에러:', e);
        // 에러가 나도 강제로 정리
        chart.current = null;
        candlestickSeries.current = null;
      }
    }

    // DOM 완전 정리
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
      console.log('🧹 차트 컨테이너 DOM 정리 완료');
    }

    // 새 차트 생성 (즉시 실행, setTimeout 제거)
    console.log('🚀 새 차트 생성 시작');
    
    try {
      // 새 차트 생성
      chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: 'solid',
          color: isDarkMode ? '#131722' : '#ffffff',
        },
        textColor: isDarkMode ? '#d1d4dc' : '#191919',
        fontSize: 12,
        fontFamily: 'Pretendard, system-ui, sans-serif',
      },
      grid: {
        vertLines: {
          color: isDarkMode ? '#363c4e' : '#f0f3fa',
          style: 1,
          visible: true,
        },
        horzLines: {
          color: isDarkMode ? '#363c4e' : '#f0f3fa',
          style: 1,
          visible: true,
        },
      },
      crosshair: {
        mode: 1, // 일반 십자선
        vertLine: {
          color: isDarkMode ? '#758696' : '#9598a1',
          width: 1,
          style: 3, // 점선
          visible: true,
          labelVisible: true,
          labelBackgroundColor: isDarkMode ? '#363c4e' : '#f0f3fa',
        },
        horzLine: {
          color: isDarkMode ? '#758696' : '#9598a1',
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: isDarkMode ? '#363c4e' : '#f0f3fa',
        },
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#485c7b' : '#cccccc',
        textColor: isDarkMode ? '#d1d4dc' : '#191919',
        entireTextOnly: false,
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: isDarkMode ? '#485c7b' : '#cccccc',
        textColor: isDarkMode ? '#d1d4dc' : '#191919',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 3,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // 캔들스틱 시리즈 추가 (v5 API) - 색상 대비 강화
    candlestickSeries.current = chart.current.addSeries(CandlestickSeries, {
      upColor: '#00ff00', // 상승 - 강한 녹색
      downColor: '#ff0000', // 하락 - 강한 빨간색
      borderVisible: true,
      wickUpColor: '#00ff00',
      wickDownColor: '#ff0000',
      borderUpColor: '#00ff00',
      borderDownColor: '#ff0000',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // 차트 크기 조정
    const handleResize = () => {
      if (chart.current) {
        chart.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight 
        });
      }
    };

      window.addEventListener('resize', handleResize);
      handleResize();
      
      console.log('✅ 새 차트 생성 완료');

      return () => {
        window.removeEventListener('resize', handleResize);
      };
      
    } catch (error) {
      console.error('차트 생성 중 에러:', error);
    }
    
    // cleanup 함수 반환
    return () => {
      console.log('🧹 차트 초기화 cleanup 실행');
    };
  }, [isDarkMode]);

  // 캔들 데이터가 업데이트되면 차트에 반영
  useEffect(() => {
    console.log('📊 캔들 데이터 업데이트 useEffect:', { 
      candlestickSeries: !!candlestickSeries.current, 
      candleDataLength: candleData.length,
      candleData: candleData.slice(0, 3) // 처음 3개만 로깅
    });
    
    if (candlestickSeries.current && candleData.length > 0) {
      console.log('✅ 차트에 캔들 데이터 설정 중...');
      
      // 🔍 디버깅: 실제 데이터 값 확인
      console.log('🔍 실제 캔들 데이터 첫 3개:', JSON.stringify(candleData.slice(0, 3), null, 2));
      console.log('🔍 마지막 3개:', JSON.stringify(candleData.slice(-3), null, 2));
      console.log('🔍 현재 시간:', new Date().toISOString());
      console.log('🔍 데이터 시간 범위:', {
        first: new Date(candleData[0]?.time * 1000).toISOString(),
        last: new Date(candleData[candleData.length - 1]?.time * 1000).toISOString()
      });
      
      candlestickSeries.current.setData(candleData);
      chart.current.timeScale().fitContent();
      
      // 🔍 차트 스케일 정보 확인
      const timeScale = chart.current.timeScale();
      console.log('🔍 차트 시간 축 정보:', {
        visibleLogicalRange: timeScale.getVisibleLogicalRange(),
        visibleTimeRange: timeScale.getVisibleRange()
      });
      
      console.log('✅ 캔들 데이터 설정 완료');
      console.log('✅ 차트 및 캔들스틱 시리즈 생성 완료');
    }
  }, [candleData]);

  // 차트 준비 상태 추가
  const [chartReady, setChartReady] = useState(false);
  
  useEffect(() => {
    const isReady = chart.current && candlestickSeries.current && candleData.length > 0;
    console.log('🔍 차트 준비 상태 확인:', { 
      chart: !!chart.current, 
      candlestickSeries: !!candlestickSeries.current, 
      candleDataLength: candleData.length,
      isReady 
    });
    
    if (isReady && !chartReady) {
      console.log('✅ 차트 준비 완료 - OrderOverlay 활성화');
      setChartReady(true);
    } else if (!isReady && chartReady) {
      console.log('⚠️ 차트 준비 해제');
      setChartReady(false);
    }
  }, [candleData, chartReady]);

  // 차트 초기화
  useEffect(() => {
    const cleanup = initializeChart();
    return cleanup;
  }, [initializeChart]);


  // 컴포넌트 언마운트 시 차트 정리
  useEffect(() => {
    return () => {
      // 1. 먼저 price line들 정리
      if (candlestickSeries.current) {
        try {
          // 혹시 남아있는 price line들 제거
          candlestickSeries.current = null;
        } catch (e) {
          console.warn('시리즈 정리 중 에러:', e);
        }
      }
      
      // 2. 그 다음 차트 제거
      if (chart.current) {
        try {
          chart.current.remove();
          chart.current = null;
        } catch (e) {
          console.warn('차트 제거 중 에러:', e);
        }
      }
    };
  }, []);

  return (
    <div className="relative w-full bg-card rounded-lg border overflow-hidden" style={{ height }}>
      {/* 차트 툴바 */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center space-x-1">
          <span className="text-sm font-semibold text-foreground mr-2">{symbol}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            isDemo ? 'bg-blue-500/20 text-blue-600' : 'bg-green-500/20 text-green-600'
          }`}>
            {isDemo ? 'DEMO' : 'LIVE'}
          </span>
          {['1m', '5m', '15m', '30m', '1h', '4h', '1d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeframe === tf 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="text-xs text-muted-foreground">차트 로딩...</div>
          )}
          {ordersLoading && (
            <div className="text-xs text-blue-500">주문 로딩...</div>
          )}
          {error && (
            <div className="text-xs text-red-500">차트 오류: {error}</div>
          )}
          {ordersError && (
            <div className="text-xs text-red-500">주문 오류: {ordersError}</div>
          )}
          <div className="text-xs text-muted-foreground">
            주문: {displayOrders.length} | 포지션: {displayPositions.length}
          </div>
          <SampleData onApplySampleData={handleApplySampleData} />
          <button
            onClick={() => {
              loadCandles(false);
              loadOrdersAndPositions();
            }}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
            title="모든 데이터 새로고침"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 차트 컨테이너 */}
      <div 
        ref={chartContainerRef} 
        className="w-full bg-background"
        style={{ 
          height: '600px', 
          minHeight: '500px',
          border: '1px solid #333',
          backgroundColor: isDarkMode ? '#131722' : '#ffffff'
        }}
      />
      
      {/* 주문 오버레이 - 차트가 준비된 후에만 렌더링 */}
      {chartReady && (
        <>
          {console.log('🔧 OrderOverlay에 전달하는 props:', { 
            chart: !!chart.current, 
            candlestickSeries: !!candlestickSeries.current,
            ordersCount: displayOrders.length,
            positionsCount: displayPositions.length,
            displayOrders: displayOrders.slice(0, 3) // 처음 3개만 로깅
          })}
          <OrderOverlay 
            chart={chart.current}
            candlestickSeries={candlestickSeries.current}
            orders={displayOrders}
            positions={displayPositions}
          />
        </>
      )}
      
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">차트 데이터를 불러오는 중...</div>
        </div>
      )}
      
      {/* 에러 오버레이 */}
      {error && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-red-500 mb-2">차트 로드 실패</div>
            <div className="text-xs text-muted-foreground mb-3">{error}</div>
            <button
              onClick={() => loadCandles(false)}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKXChart;