import CryptoJS from 'crypto-js';

class OKXApi {
  constructor(apiKey, apiSecret, passphrase, isSandbox = false) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.passphrase = passphrase;
    /*
    this.baseUrl = isSandbox 
      ? 'https://www.okx.com/api/v5/sandbox' 
      : 'https://www.okx.com/api/v5';
    */
    this.baseUrl = 'https://www.okx.com/api/v5';
    this.timeOffset = 0; // 서버와 로컬 시간 차이 보정값
    this.isSandbox = isSandbox;
  }

  // 문자열 마스킹 (보안을 위해)
  maskString(str, visibleChars = 4) {
    if (!str || str.length <= visibleChars * 2) {
      return str;
    }
    return str.substring(0, visibleChars) + '*'.repeat(str.length - visibleChars * 2) + str.substring(str.length - visibleChars);
  }

  // 민감한 데이터 제거
  sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = ['apiKey', 'apiSecret', 'passphrase', 'sign', 'signature'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.includes(key) && sanitized[key]) {
        sanitized[key] = this.maskString(sanitized[key]);
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }

  // 시간 동기화 상태 확인
  isTimeSyncValid() {
    if (!this.lastServerTime) {
      return false;
    }
    
    const now = Date.now();
    const timeDiff = Math.abs(now - this.lastServerTime);
    
    // 10분 이상 지났으면 재동기화 필요 (5분에서 10분으로 증가)
    return timeDiff < 600000;
  }

  // 강제 시간 동기화
  async forceTimeSync() {
    this.timeOffset = 0;
    this.lastServerTime = null;
    await this.getServerTime(true); // 강제 동기화
  }

  // 서버 시간 가져오기 (개선된 방식)
  async getServerTime(forceSync = false) {
    // 강제 동기화가 아니고 유효한 캐시가 있으면 캐시된 시간 반환
    if (!forceSync && this.isTimeSyncValid() && this.timeOffset !== 0) {
      const currentTime = Date.now();
      const adjustedTime = currentTime + this.timeOffset;
      return new Date(adjustedTime).toISOString();
    }

    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/public/time`);
      const endTime = Date.now();
      const networkLatency = endTime - startTime;
      
      if (!response.ok) {
        throw new Error(`서버 시간 요청 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code !== '0') {
        throw new Error(`서버 시간 API 오류: ${data.msg}`);
      }
      
      const serverMs = parseInt(data.data[0].ts);
      const localMs = endTime; // 네트워크 지연을 고려한 로컬 시간
      const timeDiff = serverMs - localMs;
      
      // 네트워크 지연을 고려한 시간 차이 계산
      const adjustedTimeDiff = timeDiff + (networkLatency / 2);
      
      // 시간 차이 보정값 업데이트 (이동 평균 사용)
      if (this.timeOffset === 0) {
        this.timeOffset = adjustedTimeDiff;
      } else {
        // 이동 평균으로 부드러운 보정
        this.timeOffset = this.timeOffset * 0.7 + adjustedTimeDiff * 0.3;
      }
      
      this.lastServerTime = serverMs;
      
      // 보정된 시간 반환 (OKX API는 ISO 8601 형식 요구)
      const adjustedTime = localMs + this.timeOffset;
      return new Date(adjustedTime).toISOString();
    } catch (error) {
      // 이전 보정값이 있으면 사용, 없으면 현재 시간 사용
      if (this.timeOffset !== 0) {
        const adjustedTime = Date.now() + this.timeOffset;
        return new Date(adjustedTime).toISOString();
      }
      
      return new Date().toISOString();
    }
  }

  // OKX API 서명 생성 (개선된 방식)
  async generateSignature(method, requestPath, body = '') {
    try {
      // 시간 동기화 상태 확인
      if (!this.isTimeSyncValid()) {
        await this.forceTimeSync();
      }
      
      // 캐시된 시간 보정값을 사용하여 현재 시간 계산
      const currentTime = Date.now();
      const adjustedTime = currentTime + this.timeOffset;
      const timestamp = new Date(adjustedTime).toISOString();
      
      const message = timestamp + method.toUpperCase() + requestPath + body;
      
      // API Secret 검증
      if (!this.apiSecret) {
        throw new Error('API Secret이 설정되지 않았습니다');
      }
      
      // HMAC-SHA256 서명 생성 (Base64 인코딩)
      const signature = CryptoJS.enc.Base64.stringify(
        CryptoJS.HmacSHA256(message, this.apiSecret)
      );
      
      return { timestamp, signature };
    } catch (error) {
      throw error;
    }
  }

  // API 헤더 생성
  async getHeaders(method, requestPath, body = '') {
    const { timestamp, signature } = await this.generateSignature(method, requestPath, body);

    if (this.isSandbox) {
      return {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
        'x-simulated-trading': 1,
      };
    }
    else {
      return {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };
    }
  }

  // API 요청 실행 (공통 메서드)
  async makeRequest(method, endpoint, params = {}, body = null, retryCount = 0) {
    try {
      // URL 구성
      const url = new URL(`${this.baseUrl}${endpoint}`);
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      const requestPath = url.pathname + url.search;
      const requestBody = body ? JSON.stringify(body) : '';
      
      // 헤더 생성
      const headers = await this.getHeaders(method, requestPath, requestBody);
      
      // 요청 실행
      const requestOptions = {
        method,
        headers,
        ...(body && { body: requestBody })
      };
      
      const response = await fetch(url.toString(), requestOptions);
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }
      
      // 응답 검증
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      // OKX API 응답 코드 검증
      if (responseData.code && responseData.code !== '0') {
        throw new Error(`OKX API 오류: ${responseData.msg || responseData.code}`);
      }
      
      return responseData;
    } catch (error) {
      // 재시도 로직 (네트워크 오류나 일시적 오류의 경우)
      if (retryCount < 3 && (error.message.includes('network') || error.message.includes('timeout'))) {

        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.makeRequest(method, endpoint, params, body, retryCount + 1);
      }
      
      throw error;
    }
  }


  // 잔액 조회
  async getBalance() {
    return this.makeRequest('GET', '/account/balance');
  }

  // 포지션 조회
  async getPositions() {
    return this.makeRequest('GET', '/account/positions');
  }

  // 🔥🔥🔥 ULTRA NEW VERSION - 완전 새로운 주문 조회 🔥🔥🔥
  async getOrders(instId = null, state = 'live') {
    
    try {
      const results = [];
      
      // 📋 일반 대기중 주문 조회
      const pendingOrders = await this.makeRequest('GET', '/trade/orders-pending', {});
      if (pendingOrders && pendingOrders.data) {
        console.log('📋 Pending orders:', pendingOrders.data.length);
        results.push(...pendingOrders.data);
      }
      
      // 🎯 Trigger 주문 조회 (별도 API)
      const triggerOrders = await this.makeRequest('GET', '/trade/orders-algo-pending', {
        ordType: 'trigger'
      });
      if (triggerOrders && triggerOrders.data) {
        console.log('🎯 Trigger orders:', triggerOrders.data.length);
        results.push(...triggerOrders.data);
      }

      // 🛡️ Stop-loss/Take-profit 주문 조회 (여러 타입 시도)
      const conditionalOrders = await this.makeRequest('GET', '/trade/orders-algo-pending', {
        ordType: 'conditional'
      });
      if (conditionalOrders && conditionalOrders.data) {
        console.log('🛡️ Conditional orders:', conditionalOrders.data.length);
        results.push(...conditionalOrders.data);
      }

      // 🎯 OCO (One-Cancels-Other) 주문 조회 - TP/SL이 여기 있을 수 있음
      const ocoOrders = await this.makeRequest('GET', '/trade/orders-algo-pending', {
        ordType: 'oco'
      });
      if (ocoOrders && ocoOrders.data) {
        console.log('🎯 OCO orders (TP/SL):', ocoOrders.data.length);
        results.push(...ocoOrders.data);
      }

      // 📈 모든 알고리즘 주문 조회 (파라미터 없이)
      const allAlgoOrders = await this.makeRequest('GET', '/trade/orders-algo-pending', {});
      if (allAlgoOrders && allAlgoOrders.data) {
        console.log('📈 All algo orders:', allAlgoOrders.data.length);
        // 중복 제거를 위해 ordId 기준으로 필터링
        const existingOrderIds = new Set(results.map(order => order.ordId));
        const newOrders = allAlgoOrders.data.filter(order => !existingOrderIds.has(order.ordId));
        console.log('📈 새로운 알고 주문:', newOrders.length);
        results.push(...newOrders);
      }
      
      console.log(`📊 총 ${results.length}개 주문 조회됨`);
      return { data: results };
    } catch (error) {
      console.error('❌ 주문 조회 실패:', error);
      return { data: [] };
    }
  }


  // 서명 테스트 메서드
  async testSignature() {
    try {
      // 1. 서버 시간 테스트 (강제 동기화)
      await this.getServerTime(true);

      // 2. 간단한 API 호출로 서명 테스트
      await this.getBalance();
      
      return { success: true, message: '서명 테스트 성공' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 서명 검증 메서드
  async verifySignature(method, requestPath, body = '', expectedSignature, originalTimestamp = null) {
    try {
      // 원본 timestamp가 있으면 사용, 없으면 캐시된 시간 사용
      let timestamp;
      if (originalTimestamp) {
        timestamp = originalTimestamp;
      } else if (this.isTimeSyncValid() && this.timeOffset !== 0) {
        // 캐시된 시간 보정값 사용
        const currentTime = Date.now();
        const adjustedTime = currentTime + this.timeOffset;
        timestamp = new Date(adjustedTime).toISOString();
      } else {
        // 캐시가 없으면 서버에서 조회
        timestamp = await this.getServerTime();
      }
      
      const message = timestamp + method.toUpperCase() + requestPath + body;
      
      const calculatedSignature = CryptoJS.enc.Base64.stringify(
        CryptoJS.HmacSHA256(message, this.apiSecret)
      );
      
      const isValid = calculatedSignature === expectedSignature;
      
      return {
        isValid,
        calculatedSignature,
        expectedSignature,
        message,
        timestamp
      };
    } catch (error) {
      throw error;
    }
  }

  // 디버그 모드 설정
  setDebugMode(enabled) {
    // 디버그 모드 기능 제거
  }

  // 시장 데이터 관련 메서드들

  // 특정 심볼의 현재 가격 가져오기
  async getTicker(instId) {
    try {
      const response = await fetch(`${this.baseUrl}/market/ticker?instId=${instId}`);
      const data = await response.json();
      
      if (data.code !== '0') {
        throw new Error(`시장 데이터 API 오류: ${data.msg}`);
      }
      
      return data.data[0];
    } catch (error) {
      console.error('시장 데이터 가져오기 실패:', error);
      throw error;
    }
  }

  // 특정 심볼의 현재 가격만 가져오기
  async getCurrentPrice(instId) {
    try {
      const ticker = await this.getTicker(instId);
      return parseFloat(ticker.last);
    } catch (error) {
      console.error('현재 가격 가져오기 실패:', error);
      throw error;
    }
  }

  // 여러 심볼의 현재 가격을 한 번에 가져오기
  async getMultipleTickers(instIds) {
    try {
      const instIdList = instIds.join(',');
      const response = await this.makeRequest('GET', '/market/tickers', { instId: instIdList });
      
      if (response.code !== '0') {
        throw new Error(`티커 조회 실패: ${response.msg}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('여러 티커 조회 중 오류:', error);
      throw error;
    }
  }

  // 공개 API 요청 실행 (인증 불필요)
  async makePublicRequest(method, endpoint, params = {}) {
    try {
      // URL 구성
      const url = new URL(`${this.baseUrl}${endpoint}`);
      Object.keys(params).forEach(key => {
        if (params[key] !== '') { // 빈 문자열이 아닌 경우만 추가
          url.searchParams.append(key, params[key]);
        }
      });
      
      // 요청 실행
      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await fetch(url.toString(), requestOptions);
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }
      
      // 응답 검증
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('공개 API 요청 실패:', error);
      throw error;
    }
  }

  // 캔들 데이터 조회 (demo/production 모드 지원)
  // 데모 모드 동적 설정
  setSandboxMode(isDemo) {
    this.isSandbox = isDemo;
    this.baseUrl = isDemo 
      ? 'https://www.okx.com/api/v5' 
      : 'https://www.okx.com/api/v5';
  }

  async getCandles(instId, bar = '15m', limit = '300') {
    try {
      // URL 구성
      const url = new URL(`${this.baseUrl}/market/candles`);
      const params = { instId, bar, limit };
      Object.keys(params).forEach(key => {
        if (params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });
      
      // 헤더 설정 - 데모 모드일 때 x-simulated-trading 추가
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.isSandbox) {
        headers['x-simulated-trading'] = '1';
      }
      
      // 요청 실행
      const requestOptions = {
        method: 'GET',
        headers
      };
      
      const response = await fetch(url.toString(), requestOptions);
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      if (responseData.code !== '0') {
        throw new Error(`캔들 데이터 조회 실패: ${responseData.msg}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('캔들 데이터 조회 중 오류:', error);
      throw error;
    }
  }

  // 선물 심볼 목록 가져오기
  async getFuturesSymbols() {
    try {
      const response = await this.makePublicRequest('GET', '/public/instruments', { 
        instType: 'SWAP'
      });
      
      if (response.code !== '0') {
        throw new Error(`선물 심볼 조회 실패: ${response.msg}`);
      }
      
      return response.data.map(item => ({
        instId: item.instId, // 실제 API에서 사용할 값 (예: BTC-USDT-SWAP)
        displayName: item.instId.replace('-SWAP', '').replace('-', '/'), // 표시용 값 (예: BTC/USDT)
        baseCcy: item.baseCcy,
        quoteCcy: item.quoteCcy,
        uly: item.uly,
        category: item.category,
        state: item.state
      })).filter(item => item.state === 'live'); // 활성화된 심볼만 필터링
    } catch (error) {
      console.error('선물 심볼 조회 중 오류:', error);
      throw error;
    }
  }
}

export default OKXApi; 