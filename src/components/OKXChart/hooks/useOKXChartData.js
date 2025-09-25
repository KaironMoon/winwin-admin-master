import { useState, useCallback, useEffect, useRef } from 'react';

const useOKXChartData = (symbol, timeframe, isDemo = false) => {
  const [candleData, setCandleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  // 심볼을 OKX 형식으로 변환
  const convertSymbolToOKX = useCallback((symbol) => {
    const [base, quote] = symbol.split('/');
    return `${base}-${quote}-SWAP`;
  }, []);

  // 시간대를 OKX API 형식으로 변환
  const convertTimeframeToOKX = useCallback((timeframe) => {
    const timeframeMap = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1H',
      '2h': '2H',
      '4h': '4H',
      '6h': '6H',
      '12h': '12H',
      '1d': '1D',
      '3d': '3D',
      '1w': '1W'
    };
    return timeframeMap[timeframe] || '15m';
  }, []);

  // OKX 캔들 데이터를 Lightweight Charts 형식으로 변환
  const convertOKXCandles = useCallback((okxData) => {
    if (!okxData || !Array.isArray(okxData)) return [];
    
    return okxData
      .map(candle => ({
        time: parseInt(candle[0]) / 1000, // Unix timestamp (초)
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }))
      .sort((a, b) => a.time - b.time); // 시간순 정렬
  }, []);

  // 캐시 키 생성 (demo 모드 포함)
  const getCacheKey = useCallback((symbol, timeframe, isDemo) => {
    return `${symbol}_${timeframe}_${isDemo ? 'demo' : 'live'}`;
  }, []);

  // 직접 공개 API 호출 (인증 불필요)
  const loadCandlesDirectly = useCallback(async (useCache = true) => {
    const cacheKey = getCacheKey(symbol, timeframe, isDemo);
    
    // 캐시 확인 (일시적으로 비활성화)
    /*
    if (useCache && cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      const cacheAge = Date.now() - cachedData.timestamp;
      
      if (cacheAge < 5 * 60 * 1000) {
        setCandleData(cachedData.data);
        return cachedData.data;
      }
    }
    */

    setLoading(true);
    setError(null);

    try {
      const okxSymbol = convertSymbolToOKX(symbol);
      const okxTimeframe = convertTimeframeToOKX(timeframe);
      
      console.log('직접 API 호출:', { okxSymbol, okxTimeframe, isDemo });
      
      // 직접 OKX API 호출 (데모 모드에 따른 엔드포인트 구분)
      const baseUrl = isDemo 
        ? 'https://www.okx.com/api/v5' // 데모 모드도 일단 같은 엔드포인트 (OKX는 공개 데이터가 동일)
        : 'https://www.okx.com/api/v5';
      const url = new URL(`${baseUrl}/market/candles`);
      url.searchParams.append('instId', okxSymbol);
      url.searchParams.append('bar', okxTimeframe);
      url.searchParams.append('limit', '300');

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (isDemo) {
        headers['x-simulated-trading'] = '1';
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers
      });

      const responseData = await response.json();
      console.log('직접 API 응답:', responseData);

      if (responseData.code === '0' && responseData.data) {
        let candleData = convertOKXCandles(responseData.data);
        
        // 데모 모드에서는 시각적으로 확실히 구분되도록 큰 변형 적용
        if (isDemo) {
          candleData = candleData.map((candle, index) => {
            // 더 크고 눈에 띄는 변형 적용 (1-3% 가격 변동)
            const variation = 0.01 + (Math.random() * 0.02); // 1-3% 변동
            const multiplier = Math.random() > 0.5 ? (1 + variation) : (1 - variation);
            
            // 매 5번째 캔들마다 더 큰 변동 적용 (데모 모드 시각적 확인용)
            const demoMultiplier = index % 5 === 0 ? multiplier * 1.02 : multiplier;
            
            return {
              ...candle,
              open: candle.open * demoMultiplier,
              high: candle.high * demoMultiplier * 1.01, // high는 조금 더 높게
              low: candle.low * demoMultiplier * 0.99,   // low는 조금 더 낮게  
              close: candle.close * demoMultiplier
            };
          });
          console.log('🔸 데모 모드: 가상 데이터 변형 적용됨 (1-3% 가격 변동)');
        console.log('📊 변형된 캔들 데이터 샘플:', candleData.slice(0, 3));
        } else {
          console.log('🟢 라이브 모드: 실제 시장 데이터 사용');
          console.log('📊 원본 캔들 데이터 샘플:', candleData.slice(0, 3));
        }
        
        // 캐시에 저장
        cacheRef.current.set(cacheKey, {
          data: candleData,
          timestamp: Date.now()
        });
        
        setCandleData(candleData);
        return candleData;
      } else {
        throw new Error(responseData.msg || '캔들 데이터 로드 실패');
      }
    } catch (error) {
      console.error('직접 API 호출 실패:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, isDemo, convertSymbolToOKX, convertTimeframeToOKX, convertOKXCandles, getCacheKey]);

  // 캔들 데이터 로드
  const loadCandles = useCallback(async (useCache = true) => {
    // 우선 직접 API 호출 사용 (WebSocket 문제 우회)
    return await loadCandlesDirectly(useCache);

    /* OKX API 인스턴스 사용 (나중에 활성화)
    if (!window.okxApi) {
      console.log('OKX API 인스턴스 없음, 직접 공개 API 호출');
      return await loadCandlesDirectly(useCache);
    }

    const cacheKey = getCacheKey(symbol, timeframe, isDemo);
    
    // 캐시 확인
    if (useCache && cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      const cacheAge = Date.now() - cachedData.timestamp;
      
      // 캐시가 5분 이내면 사용
      if (cacheAge < 5 * 60 * 1000) {
        setCandleData(cachedData.data);
        return cachedData.data;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const okxSymbol = convertSymbolToOKX(symbol);
      const okxTimeframe = convertTimeframeToOKX(timeframe);
      
      const response = await window.okxApi.getCandles(okxSymbol, okxTimeframe, '300', isDemo);

      if (response.code === '0' && response.data) {
        const candleData = convertOKXCandles(response.data);
        
        // 캐시에 저장
        cacheRef.current.set(cacheKey, {
          data: candleData,
          timestamp: Date.now()
        });
        
        setCandleData(candleData);
        return candleData;
      } else {
        throw new Error(response.msg || '캔들 데이터 로드 실패');
      }
    } catch (error) {
      console.error('캔들 데이터 로드 실패:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
    */
  }, [symbol, timeframe, isDemo, convertSymbolToOKX, convertTimeframeToOKX, convertOKXCandles, getCacheKey]);

  // 실시간 데이터 업데이트 (향후 WebSocket 연동용)
  const updateLastCandle = useCallback((newCandleData) => {
    setCandleData(prevData => {
      if (!prevData || prevData.length === 0) return [newCandleData];
      
      const lastCandle = prevData[prevData.length - 1];
      
      // 같은 시간대면 업데이트, 다른 시간대면 추가
      if (lastCandle.time === newCandleData.time) {
        return [...prevData.slice(0, -1), newCandleData];
      } else {
        return [...prevData, newCandleData];
      }
    });
  }, []);

  // 캐시 정리 (최대 10개 심볼/시간대 조합만 유지)
  const cleanupCache = useCallback(() => {
    const MAX_CACHE_SIZE = 10;
    if (cacheRef.current.size > MAX_CACHE_SIZE) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // 가장 오래된 캐시 제거
      const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => {
        cacheRef.current.delete(key);
      });
    }
  }, []);

  // 심볼이나 시간대, demo 모드 변경 시 데이터 로드
  useEffect(() => {
    loadCandles();
    cleanupCache();
  }, [symbol, timeframe, isDemo, loadCandles, cleanupCache]);

  return {
    candleData,
    loading,
    error,
    loadCandles,
    updateLastCandle
  };
};

export default useOKXChartData;