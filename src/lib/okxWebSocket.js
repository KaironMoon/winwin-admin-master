import CryptoJS from 'crypto-js';
import OKXApi from './okxApi.js';

class OKXWebSocket {
  constructor(apiKey, apiSecret, passphrase, isSandbox = false) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.passphrase = passphrase;
    this.isSandbox = isSandbox;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.onBalanceUpdate = null;
    this.onConnectionChange = null;
    this.onPositionUpdate = null;
    this.onOrderUpdate = null;
    // onFillUpdate 제거됨 (VIP5 이상 필요)
    
    // API 클라이언트 (서버 시간 동기화용)
    this.api = new OKXApi(apiKey, apiSecret, passphrase, isSandbox);
  }

  // WebSocket URL 생성
  getWebSocketUrl() {
    if (this.isSandbox) {
      return 'wss://wspap.okx.com:8443/ws/v5/private';
    } else {
      return 'wss://ws.okx.com:8443/ws/v5/private';
    }
  }

  // 서버 epoch seconds (10자리) 가져오기
  async getServerTimestamp() {
    try {
      const response = await fetch('https://www.okx.com/api/v5/public/time');
      const data = await response.json();
      const ms = parseInt(data.data[0].ts);
      return Math.floor(ms / 1000).toString(); // 10자리 초
    } catch (error) {
      return Math.floor(Date.now() / 1000).toString(); // 폴백
    }
  }

  // 서명 생성
  generateSignature(timestamp) {
    const message = `${timestamp}GET/users/self/verify`;
    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, this.apiSecret));
    return signature;
  }

  // WebSocket 연결
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log('🔗 OKX WebSocket 연결 시도');
      console.log(this.getWebSocketUrl());
      this.ws = null;
      try {
        this.ws = new WebSocket(this.getWebSocketUrl());
      } catch (error) {
        console.error('❌ OKX WebSocket 연결 실패:', error);
        return;
      }
      
      this.ws.onopen = async () => {
        try {
          // 1) 로그인
          const timestamp = await this.getServerTimestamp();
          const signature = this.generateSignature(timestamp);
          
          const loginMessage = {
            op: 'login',
            args: [{
              apiKey: this.apiKey,
              passphrase: this.passphrase,
              timestamp: timestamp,
              sign: signature
            }]
          };

          const response = this.safeSend(loginMessage);
          console.log('🔑 OKX WebSocket 로그인 응답:', response);
        } catch (error) {
          console.error('❌ OKX WebSocket 로그인 실패:', error);
          this.isConnected = false;
          if (this.onConnectionChange) {
            this.onConnectionChange(false);
          }
        }
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.stopHeartbeat();
        
        if (this.onConnectionChange) {
          this.onConnectionChange(false);
        }
        
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        this.isConnected = false;
        this.stopHeartbeat();
        
        if (this.onConnectionChange) {
          this.onConnectionChange(false);
        }
      };
    } catch (error) {
      this.isConnected = false;
      
      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }
    }
  }

  // WebSocket 연결 해제
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.stopHeartbeat();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // 안전한 메시지 전송
  safeSend(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const response = this.ws.send(JSON.stringify(message));
      return response;
    }
  }

  // 메시지 처리
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      if (message.event === 'login') {
        if (message.code === '0') {
  
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.subscribeToAccount();
          
          if (this.onConnectionChange) {
            this.onConnectionChange(true);
          }
        } else {
          console.error('❌ OKX WebSocket 로그인 실패:', message);
          this.isConnected = false;
          
          if (this.onConnectionChange) {
            this.onConnectionChange(false);
          }
          
          this.attemptReconnect();
        }
      } else if (message.event === 'subscribe') {

      } else if (message.event === 'error') {
        console.error('❌ OKX WebSocket 에러:', message);
      } else if (message.data) {

        
        // 잔액 업데이트 처리 (현물 계정이 아닌 경우 무시)
        if (message.arg && message.arg.channel === 'account') {
          this.handleBalanceUpdate(message.data);
        }
        
        // 포지션 업데이트 처리
        if (message.arg && message.arg.channel === 'positions') {

          this.handlePositionUpdate(message.data);
        }
        
        // 주문 업데이트 처리
        if (message.arg && message.arg.channel === 'orders') {

          this.handleOrderUpdate(message.data);
        }
        
        // fills 채널은 VIP5 이상만 접근 가능하므로 제거
        // 체결 정보는 orders 채널의 filled 상태로 판단
      }
    } catch (error) {
      console.error('❌ OKX WebSocket 메시지 처리 오류:', error);
    }
  }

  // 잔액 업데이트 처리
  handleBalanceUpdate(data) {
    
    // 데이터 구조 검증
    if (Array.isArray(data) && data.length > 0) {
      const accountData = data[0];
      
      // details 배열이 있고 현물 계정 데이터인지 확인
      if (accountData.details && Array.isArray(accountData.details)) {
        // 현물 계정 데이터로 판단 (SWAP 계정과 구분)
        const hasValidData = accountData.details.some(detail => 
          detail.availBal && parseFloat(detail.availBal) > 0
        );
        
        if (hasValidData) {
          if (this.onBalanceUpdate) {
            this.onBalanceUpdate({ data: data });
          }
        } else {
        }
      } else {
      }
    } else {
    }
  }

  // 포지션 업데이트 처리
  handlePositionUpdate(data) {
    if (Array.isArray(data) && data.length > 0) {
      if (this.onPositionUpdate) {
        this.onPositionUpdate({ data: data });
      }
    }
  }

  // 주문 업데이트 처리
  handleOrderUpdate(data) {
    if (Array.isArray(data) && data.length > 0) {
      if (this.onOrderUpdate) {
        this.onOrderUpdate({ data: data });
      }
    }
  }

  // handleFillUpdate 제거됨 (VIP5 이상 필요)

  // 계정 정보 구독
  subscribeToAccount() {
    // 계정 정보 구독
    const accountSubscribeMessage = {
      op: 'subscribe',
      args: [{
        channel: 'account',
        instType: 'SWAP'
      }]
    };
    
    this.safeSend(accountSubscribeMessage);
    
    // 포지션 정보 구독
    const positionSubscribeMessage = {
      op: 'subscribe',
      args: [{
        channel: 'positions',
        instType: 'SWAP'
      }]
    };
    
    this.safeSend(positionSubscribeMessage);
    
    // 주문 정보 구독 (SWAP)
    const orderSubscribeMessage = {
      op: 'subscribe',
      args: [{
        channel: 'orders',
        instType: 'SWAP'
      }]
    };
    
    this.safeSend(orderSubscribeMessage);
    
    // fills 채널은 VIP5 이상만 접근 가능하므로 주석 처리
    // 대신 orders 채널의 filled 상태 주문들을 체결로 간주
  }

  // 하트비트 시작
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isWebSocketReady()) {
        this.safeSend({ op: 'ping' });
      }
    }, 30000); // 30초마다 핑 (15초에서 30초로 증가)
  }

  // 하트비트 중지
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // WebSocket 준비 상태 확인
  isWebSocketReady() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // 재연결 시도
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // 연결 상태 반환
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default OKXWebSocket; 