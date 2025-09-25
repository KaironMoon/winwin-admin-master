import { useEffect, useRef } from 'react';

const OrderOverlay = ({ 
  chart, 
  candlestickSeries, 
  orders = [], 
  positions = [],
  onOrderEdit,
  onOrderCancel 
}) => {
  const orderLinesRef = useRef({});
  const positionLinesRef = useRef({});

  // 주문 타입별 스타일 정의
  const getOrderLineStyle = (orderType, side, orderData = {}) => {
    const styles = {
      // Take Profit
      take_profit: {
        color: '#22c55e',
        lineWidth: 2,
        lineStyle: 0, // 실선
        title: 'TP'
      },
      // Stop Loss  
      stop_loss: {
        color: '#ef4444',
        lineWidth: 2,
        lineStyle: 0,
        title: 'SL'
      },
      // Trigger 주문
      trigger: {
        color: '#f59e0b',
        lineWidth: 2,
        lineStyle: 1, // 점선
        title: 'Trigger'
      },
      // Conditional 주문 (알고리즘 주문)
      conditional: {
        color: '#8b5cf6',
        lineWidth: 2,
        lineStyle: 1,
        title: 'Cond'
      },
      // OCO 주문 
      oco: {
        color: '#06b6d4',
        lineWidth: 2,
        lineStyle: 0,
        title: 'OCO'
      },
      // Limit 주문
      limit: {
        color: '#3b82f6',
        lineWidth: 2,
        lineStyle: 0,
        title: 'Limit'
      },
      // Market 주문 (즉시 체결)
      market: {
        color: '#8b5cf6',
        lineWidth: 1,
        lineStyle: 2, // 큰 점선
        title: 'Market'
      }
    };

    // OKX API의 실제 필드명 확인 (tpTriggerPx, slTriggerPx 등)
    if (orderData.tpTriggerPx && parseFloat(orderData.tpTriggerPx) > 0) {
      return {
        color: '#22c55e',
        lineWidth: 2,
        lineStyle: 0,
        title: 'TP'
      };
    }
    
    if (orderData.slTriggerPx && parseFloat(orderData.slTriggerPx) > 0) {
      return {
        color: '#ef4444', 
        lineWidth: 2,
        lineStyle: 0,
        title: 'SL'
      };
    }

    const baseStyle = styles[orderType] || styles.limit;
    const orderSide = side || 'BUY'; // 기본값 설정
    
    return {
      ...baseStyle,
      title: `${baseStyle.title} ${orderSide.toUpperCase()}: `
    };
  };

  // 포지션 라인 스타일
  const getPositionLineStyle = (position) => {
    const isProfit = parseFloat(position.upl || 0) >= 0;
    const side = position.side || position.posSide || 'LONG'; // posSide 필드도 확인
    
    return {
      color: isProfit ? '#22c55e' : '#ef4444',
      lineWidth: 2,
      lineStyle: 2, // 큰 점선
      title: `포지션 ${side.toUpperCase()}: `
    };
  };

  // 주문 라인 생성/업데이트
  useEffect(() => {
    console.log('🔍 OrderOverlay useEffect 실행:', { 
      chart: !!chart, 
      candlestickSeries: !!candlestickSeries, 
      ordersCount: orders.length,
      orders 
    });

    if (!chart || !candlestickSeries) {
      console.warn('⚠️ 차트나 캔들스틱 시리즈가 준비되지 않음');
      return;
    }

    // 기존 주문 라인 제거
    Object.values(orderLinesRef.current).forEach(line => {
      try {
        candlestickSeries.removePriceLine(line);
      } catch (e) {
        console.warn('라인 제거 실패:', e);
      }
    });
    orderLinesRef.current = {};

    console.log(`📊 ${orders.length}개 주문 라인 생성 시작`);

    // 새로운 주문 라인 추가
    orders.forEach(order => {
      try {
        console.log('주문 라인 생성 시도:', order);
        
        if (!order.px || !order.ordType) {
          console.warn('주문 데이터 불완전:', order);
          return;
        }

        const price = parseFloat(order.px);
        if (isNaN(price)) {
          console.warn('잘못된 가격:', order.px);
          return;
        }

        // OKX API 응답에서 side 필드 확인 (side, posSide 등 다양한 가능성)
        const orderSide = order.side || order.posSide || 'buy';
        const style = getOrderLineStyle(order.ordType, orderSide);
        console.log('라인 스타일:', style);
        
        const priceLine = candlestickSeries.createPriceLine({
          price: price,
          color: style.color,
          lineWidth: style.lineWidth,
          lineStyle: style.lineStyle,
          axisLabelVisible: true,
          title: `${style.title}${price.toFixed(2)}`
        });

        console.log('라인 생성됨:', priceLine);
        orderLinesRef.current[order.ordId] = priceLine;

      } catch (error) {
        console.error('주문 라인 생성 실패:', error, order);
      }
    });

    console.log('📋 주문 라인 생성 완료. 총 생성된 라인:', Object.keys(orderLinesRef.current).length);
  }, [chart, candlestickSeries, orders]);

  // 포지션 라인 생성/업데이트
  useEffect(() => {
    if (!chart || !candlestickSeries) return;

    // 기존 포지션 라인 제거
    Object.values(positionLinesRef.current).forEach(line => {
      try {
        candlestickSeries.removePriceLine(line);
      } catch (e) {
        // 이미 제거된 라인일 수 있음
      }
    });
    positionLinesRef.current = {};

    // 새로운 포지션 라인 추가
    positions.forEach(position => {
      try {
        if (!position.avgPx || parseFloat(position.pos || 0) === 0) return;

        const entryPrice = parseFloat(position.avgPx);
        if (isNaN(entryPrice)) return;

        const style = getPositionLineStyle(position);
        const profitPercent = parseFloat(position.uplRatio || 0);
        const positionSize = parseFloat(position.pos || 0);
        const side = position.side || position.posSide || 'LONG';

        const priceLine = candlestickSeries.createPriceLine({
          price: entryPrice,
          color: style.color,
          lineWidth: style.lineWidth,
          lineStyle: style.lineStyle,
          axisLabelVisible: true,
          title: `${side.toUpperCase()} ${Math.abs(positionSize)} @ ${entryPrice.toFixed(2)} (${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%)`
        });

        positionLinesRef.current[position.posId] = priceLine;

      } catch (error) {
        console.error('포지션 라인 생성 실패:', error);
      }
    });
  }, [chart, candlestickSeries, positions]);

  // 컴포넌트 언마운트 시 라인 정리
  useEffect(() => {
    return () => {
      if (candlestickSeries) {
        // 모든 라인 제거
        [...Object.values(orderLinesRef.current), ...Object.values(positionLinesRef.current)]
          .forEach(line => {
            try {
              candlestickSeries.removePriceLine(line);
            } catch (e) {
              // 이미 제거된 라인일 수 있음
            }
          });
      }
    };
  }, [candlestickSeries]);

  // 이 컴포넌트는 차트에 직접 오버레이를 그리므로 렌더링할 JSX 없음
  return null;
};

export default OrderOverlay;