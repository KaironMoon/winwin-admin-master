import React, { useEffect, useRef, useState, useCallback } from 'react';

const Chart = ({ isDarkMode, symbol = 'BTC/USDT' }) => {
  const container = useRef();
  const widgetRef = useRef();
  const containerId = 'tradingview-chart-main';
  const [chartHeight, setChartHeight] = useState('45vh');
  
  // iOS 디바이스 감지
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // iOS 감지 (iPhone, iPad, iPod)
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(checkIOS);
  }, []);

  // 반응형 높이 설정 및 윈도우 리사이즈 처리
  useEffect(() => {
    const updateChartHeight = () => {
      let newHeight;
      
      // iOS 모바일에서는 고정 픽셀 높이 사용
      if (isIOS && window.innerWidth < 768) {
        newHeight = '400px';
      } else if (window.innerWidth >= 1080) {
        newHeight = 'calc(100vh - 188px)';
      } else if (window.innerWidth < 768) {
        // 일반 모바일에서도 고정 높이 사용
        newHeight = '420px';
      } else {
        newHeight = '45vh';
      }
      
      setChartHeight(newHeight);
      
      // DOM 요소 높이 스타일 적용
      if (container.current) {
        try {
          container.current.style.height = newHeight;
          container.current.style.minHeight = window.innerWidth < 768 ? '300px' : '380px';
          container.current.style.maxHeight = newHeight;
        } catch (e) {
          console.warn('차트 높이 설정 중 에러:', e);
        }
      }
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    
    return () => {
      window.removeEventListener('resize', updateChartHeight);
    };
  }, [isIOS]);

  // 심볼을 TradingView 형식으로 변환
  const convertSymbolToTradingView = (symbol) => {
    const [base, quote] = symbol.split('/');
    return `OKX:${base}${quote}.P`;
  };

  // TradingView 위젯 생성 및 관리
  const createWidget = useCallback(async (symbol) => {
    // 기본 안전성 검사
    if (!container.current) {
      return;
    }

    // 기존 위젯이 있으면 안전하게 제거
    if (widgetRef.current) {
      try {
        if (typeof widgetRef.current.remove === 'function') {
          widgetRef.current.remove();
        }
        widgetRef.current = null;
      } catch (e) {
        widgetRef.current = null;
      }
    }

    // 컨테이너 정리
    if (container.current) {
      container.current.innerHTML = '';
    }

    // TradingView 스크립트 로드 확인
    if (!window.TradingView) {
      return;
    }

    const tvSymbol = convertSymbolToTradingView(symbol);
    
    try {
      widgetRef.current = new window.TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": tvSymbol,
        "interval": "15",
        "timezone": "Asia/Seoul",
        "theme": isDarkMode ? "dark" : "light",
        "style": "1",
        "locale": "kr",
        "toolbar_bg": isDarkMode ? "#1a1a2e" : "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": containerId,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "backgroundColor": isDarkMode ? "rgba(19, 23, 34, 1)" : "rgba(255, 255, 255, 1)",
        "gridColor": isDarkMode ? "rgba(240, 243, 250, 0.07)" : "rgba(0, 0, 0, 0.1)",
        "loading_screen": { "backgroundColor": isDarkMode ? "#131722" : "#ffffff" },
        "overrides": {}
      });
    } catch (error) {
      console.error('TradingView 위젯 생성 중 에러:', error);
    }
  }, [isDarkMode]);

  // TradingView 초기화 및 스크립트 로드
  useEffect(() => {
    const initializeWidget = () => {
      // TradingView 스크립트가 이미 로드되어 있으면 위젯 생성
      if (window.TradingView && container.current) {
        createWidget(symbol);
        return;
      }

      // TradingView 스크립트 로드
      if (!document.querySelector('script[src*="tradingview.com/tv.js"]')) {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
          if (window.TradingView && container.current) {
            createWidget(symbol);
          }
        };
        script.onerror = (error) => {
          console.error('TradingView 스크립트 로드 실패:', error);
        };
        document.head.appendChild(script);
      }
    };

    // DOM 안정화 후 초기화
    const timeoutId = setTimeout(initializeWidget, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [symbol, createWidget]);

  return (
    <div className="chart-container relative overflow-hidden">
      <style>
        {`
          .chart-container {
            height: ${chartHeight} !important;
            min-height: ${window.innerWidth < 768 ? '300px' : '380px'} !important;
            max-height: ${chartHeight} !important;
            overflow: hidden !important;
            position: relative !important;
            contain: layout !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .chart-container > div:first-child {
            height: 100% !important;
            min-height: ${window.innerWidth < 768 ? '300px' : '380px'} !important;
            max-height: 100% !important;
            overflow: hidden !important;
            position: relative !important;
          }
          .chart-container iframe {
            height: 100% !important;
            width: 100% !important;
            min-height: ${window.innerWidth < 768 ? '300px' : '380px'} !important;
            max-height: 100% !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            -webkit-transform: translateZ(0) !important; /* iOS GPU acceleration */
          }
          #${containerId} {
            height: 100% !important;
            min-height: ${window.innerWidth < 768 ? '300px' : '380px'} !important;
            max-height: 100% !important;
            overflow: hidden !important;
            position: relative !important;
          }
          
          /* iOS Safari specific fixes */
          @supports (-webkit-touch-callout: none) {
            .chart-container {
              height: ${chartHeight} !important;
              max-height: ${chartHeight} !important;
              overflow: hidden !important;
              -webkit-mask-image: -webkit-radial-gradient(white, black) !important;
            }
            .chart-container iframe {
              max-height: ${chartHeight} !important;
              overflow: hidden !important;
            }
          }
          
          /* Additional mobile containment */
          @media (max-width: 767px) {
            .chart-container {
              max-height: ${isIOS ? '400px' : '420px'} !important;
              overflow: hidden !important;
              contain: strict !important;
            }
          }
        `}
      </style>
      
      <div 
        id={containerId} 
        ref={container} 
        className="w-full transition-none" 
        style={{ 
          height: chartHeight,
          minHeight: window.innerWidth < 768 ? '300px' : '380px',
          maxHeight: chartHeight,
          overflow: 'hidden',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default Chart;