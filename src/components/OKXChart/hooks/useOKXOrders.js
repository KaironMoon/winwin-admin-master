import { useState, useCallback, useEffect } from 'react';

const useOKXOrders = (symbol, isDemo = false) => {
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // OKX API 인스턴스 확인
  const getOKXApi = useCallback(() => {
    if (!window.okxApi) {
      throw new Error('OKX API 인스턴스가 초기화되지 않음');
    }
    return window.okxApi;
  }, []);

  // 심볼을 OKX 형식으로 변환
  const convertSymbolToOKX = useCallback((symbol) => {
    const [base, quote] = symbol.split('/');
    return `${base}-${quote}-SWAP`;
  }, []);

  // 주문 데이터 로드
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const api = getOKXApi();
      const okxSymbol = convertSymbolToOKX(symbol);
      
      console.log('🔍 주문 데이터 로드 시작:', { symbol, okxSymbol, isDemo });
      
      // 주문 조회
      const ordersResponse = await api.getOrders(okxSymbol, 'live');
      console.log('📋 주문 응답:', ordersResponse);
      
      if (ordersResponse && ordersResponse.data) {
        // 현재 심볼과 일치하는 주문만 필터링
        const filteredOrders = ordersResponse.data.filter(order => 
          order.instId === okxSymbol
        );
        console.log('✅ 필터링된 주문:', filteredOrders);
        setOrders(filteredOrders);
      } else {
        console.log('📋 주문 데이터 없음');
        setOrders([]);
      }

    } catch (error) {
      console.error('❌ 주문 로드 실패:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, isDemo, getOKXApi, convertSymbolToOKX]);

  // 포지션 데이터 로드
  const loadPositions = useCallback(async () => {
    try {
      const api = getOKXApi();
      const okxSymbol = convertSymbolToOKX(symbol);
      
      console.log('🔍 포지션 데이터 로드 시작:', { symbol, okxSymbol, isDemo });
      
      // 포지션 조회
      const positionsResponse = await api.getPositions();
      console.log('📊 포지션 응답:', positionsResponse);
      
      if (positionsResponse && positionsResponse.data) {
        // 현재 심볼과 일치하고 실제 포지션이 있는 것만 필터링
        const filteredPositions = positionsResponse.data.filter(position => 
          position.instId === okxSymbol && parseFloat(position.pos || 0) !== 0
        );
        console.log('✅ 필터링된 포지션:', filteredPositions);
        setPositions(filteredPositions);
      } else {
        console.log('📊 포지션 데이터 없음');
        setPositions([]);
      }

    } catch (error) {
      console.error('❌ 포지션 로드 실패:', error);
      setError(error.message);
      setPositions([]);
    }
  }, [symbol, isDemo, getOKXApi, convertSymbolToOKX]);

  // 주문과 포지션 데이터를 함께 로드
  const loadOrdersAndPositions = useCallback(async () => {
    if (!window.okxApi) {
      console.log('⚠️ OKX API 없음, 샘플 데이터만 사용');
      return;
    }

    await Promise.all([
      loadOrders(),
      loadPositions()
    ]);
  }, [loadOrders, loadPositions]);

  // 심볼이나 데모 모드 변경 시 데이터 로드
  useEffect(() => {
    loadOrdersAndPositions();
  }, [symbol, isDemo, loadOrdersAndPositions]);

  return {
    orders,
    positions,
    loading,
    error,
    loadOrdersAndPositions,
    loadOrders,
    loadPositions
  };
};

export default useOKXOrders;