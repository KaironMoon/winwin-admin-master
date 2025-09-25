import OKXApi from './okxApi.js';
import OKXWebSocket from './okxWebSocket.js';

class OKXService {
  constructor() {
    this.api = null;
    this.websocket = null;
    this.isTestMode = false;
    this.balanceUpdateHandler = null;
    this.connectionChangeHandler = null;
    this.positionUpdateHandler = null; // 포지션 업데이트 핸들러 추가
    this.orderUpdateHandler = null; // 주문 업데이트 핸들러 추가
    // fillUpdateHandler 제거됨 (VIP5 이상 필요)
    this.balanceUpdateInterval = null; // REST API 잔액 업데이트용
    this.testBalance = {
      data: [{
        details: [{
          ccy: 'USDT',
          availBal: '1000.00'
        }]
      }]
    };
  }

  setIsSandbox(isSandbox, apiKey, apiSecret, passphrase) {
    // API가 초기화되지 않았으면 초기화를 먼저 수행
    if (!this.api || !this.websocket) {
      this.initialize(apiKey, apiSecret, passphrase, isSandbox);
      return;
    }

    // 이미 초기화된 경우 설정값만 업데이트
    if (this.api) {
      this.api.isSandbox = isSandbox;
      this.api.apiKey = apiKey;
      this.api.apiSecret = apiSecret;
      this.api.passphrase = passphrase;
    }
    if (this.websocket) {
      this.websocket.isSandbox = isSandbox;
      this.websocket.apiKey = apiKey;
      this.websocket.apiSecret = apiSecret;
      this.websocket.passphrase = passphrase;
    }
  }

  // OKX 연결 초기화
  initialize(apiKey, apiSecret, passphrase, isSandbox = false) {
    if (!apiKey || !apiSecret || !passphrase) {
      return false;
    }

    console.log("!!!!!!!isSandbox!!!!!!!!", isSandbox);
    console.log("!!!!!!!apiKey!!!!!!!!", apiKey);
    console.log("!!!!!!!apiSecret!!!!!!!!", apiSecret);
    console.log("!!!!!!!passphrase!!!!!!!!", passphrase);

    try {
      // REST API 클라이언트 초기화
      this.api = new OKXApi(apiKey, apiSecret, passphrase, isSandbox);
      
      // WebSocket 클라이언트 초기화
      this.websocket = new OKXWebSocket(apiKey, apiSecret, passphrase, isSandbox);
      
      // WebSocket 이벤트 핸들러 설정
      this.websocket.onBalanceUpdate = (data) => {
        this.handleBalanceUpdate(data);
      };
      
      this.websocket.onConnectionChange = (connected) => {
        this.handleConnectionChange(connected);
      };

      this.websocket.onPositionUpdate = (data) => {
        //console.log("!!!!!!!onPositionUpdate websocket!!!!!!!!", data);
        this.handlePositionUpdate(data);
      };

      this.websocket.onOrderUpdate = (data) => {
        this.handleOrderUpdate(data);
      };

      this.websocket.onFillUpdate = (data) => {
        this.handleFillUpdate(data);
      };

      return true;
    } catch (error) {
      return false;
    }
  }

  // 테스트 모드 초기화
  initializeTestMode() {
    this.isTestMode = true;
    this.api = null;
    this.websocket = null;
    
    // 테스트 모드에서는 즉시 연결 상태로 설정
    setTimeout(() => {
      this.handleConnectionChange(true);
      this.handleBalanceUpdate(this.testBalance);
    }, 1000);
  }

  // 잔액 업데이트 핸들러 설정
  setBalanceUpdateHandler(handler) {
    this.balanceUpdateHandler = handler;
  }

  // 연결 상태 변경 핸들러 설정
  setConnectionChangeHandler(handler) {
    this.connectionChangeHandler = handler;
  }

  // 포지션 업데이트 핸들러 설정
  setPositionUpdateHandler(handler) {
    this.positionUpdateHandler = handler;
  }

  // 주문 업데이트 핸들러 설정
  setOrderUpdateHandler(handler) {
    this.orderUpdateHandler = handler;
  }

  // fillUpdateHandler 제거됨 (VIP5 이상 필요)

  // 잔액 업데이트 처리
  handleBalanceUpdate(data) {
    if (this.balanceUpdateHandler) {
      // 데이터 구조 검증
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const accountData = data.data[0];
        
        // details 배열이 있고 유효한 잔액이 있는지 확인
        if (accountData.details && Array.isArray(accountData.details)) {
          const hasValidData = accountData.details.some(detail => 
            detail.availBal && parseFloat(detail.availBal) > 0
          );
          
          if (hasValidData) {
            this.balanceUpdateHandler(data);
          } else {
          }
        } else {
        }
      } else {
      }
    }
  }

  // 연결 상태 변경 처리
  handleConnectionChange(connected) {
    if (this.connectionChangeHandler) {
      this.connectionChangeHandler(connected);
    }
  }

  // 포지션 업데이트 처리
  handlePositionUpdate(data) {
    
    
    if (this.positionUpdateHandler) {
      // data가 이미 배열이면 그대로, 아니면 data.data 사용
      const positionData = Array.isArray(data) ? data : (data.data || data);
      this.positionUpdateHandler(positionData);
    }
  }

  // 주문 업데이트 처리
  handleOrderUpdate(data) {
    
    
    if (this.orderUpdateHandler) {
      // data가 이미 배열이면 그대로, 아니면 data.data 사용
      const orderData = Array.isArray(data) ? data : (data.data || data);
      this.orderUpdateHandler(orderData);
    }
  }

  // handleFillUpdate 제거됨 (VIP5 이상 필요)

  // 초기 잔액 조회
  async fetchInitialBalance() {
    if (this.isTestMode) {
      this.handleBalanceUpdate(this.testBalance);
      return;
    }

    if (!this.api) {
      return;
    }

    try {
      const balance = await this.api.getBalance();
      this.handleBalanceUpdate(balance);
    } catch (error) {
      // 에러 처리
    }
  }

  // 연결 시작
  async connect() {
    if (this.isTestMode) {
      return true;
    }

    if (!this.api || !this.websocket) {
      console.error('API 또는 WebSocket이 초기화되지 않음');
      return false;
    }

    if (this.api === null || this.websocket === null) {
      console.error('API 또는 WebSocket이 초기화되지 않음');
      return false;
    }

    
    try {
      // 초기 잔액 조회
      await this.fetchInitialBalance();
      
      // WebSocket 연결
      this.websocket.connect();
      
      // WebSocket 연결 후 초기 데이터 조회 (1초 후)
      setTimeout(async () => {
        if (this.websocket.isConnected) {
    
          
          try {
            // 초기 포지션 조회
            const positions = await this.getPositions();
            if (positions && positions.data) {

              this.handlePositionUpdate(positions.data);
            }
            
            // 초기 주문 조회
            
            const orders = await this.getOrders();
            if (orders && orders.data) {

              this.handleOrderUpdate(orders.data);
            } else {

            }
          } catch (error) {
            console.error('❌ 초기 데이터 조회 실패:', error);
          }
        }
      }, 1000);
      
      // WebSocket 연결 상태 확인 (3초 후)
      setTimeout(() => {
        if (!this.websocket.isConnected) {
          // WebSocket 연결이 실패해도 REST API는 사용 가능
          this.handleConnectionChange(true);
          // REST API로 주기적 잔액 업데이트 시작
          this.startBalanceUpdate();
        } else {
          this.handleConnectionChange(true);
        }
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('OKX 연결 실패:', error);
      this.handleConnectionChange(false);
      return false;
    }
  }

  // 연결 해제
  disconnect() {
    if (this.websocket) {
      this.websocket.disconnect();
    }
    
    this.stopBalanceUpdate();
    this.isTestMode = false;
    this.handleConnectionChange(false);
  }

  // 잔액 조회
  async getBalance() {
    if (this.isTestMode) {
      return this.testBalance;
    }

    if (!this.api) {
      return null;
    }

    try {
      return await this.api.getBalance();
    } catch (error) {
      return null;
    }
  }


  // 포지션 조회
  async getPositions() {
    if (this.isTestMode) {
      return [];
    }

    if (!this.api) {
      return null;
    }

    try {
      return await this.api.getPositions();
    } catch (error) {
      return null;
    }
  }

  // 주문 조회
  async getOrders() {
    if (this.isTestMode) {

      return [];
    }

    if (!this.api) {

      return null;
    }

    try {

      const result = await this.api.getOrders();
      
      return result;
    } catch (error) {
      console.error('❌ REST API 주문 조회 실패:', error.message);
      return null;
    }
  }

  // REST API 잔액 업데이트 시작
  startBalanceUpdate() {
    this.stopBalanceUpdate();
    
    this.balanceUpdateInterval = setInterval(async () => {
      if (!this.isTestMode && this.api) {
        try {
          const balance = await this.api.getBalance();
          this.handleBalanceUpdate(balance);
        } catch (error) {
          console.error('잔액 업데이트 실패:', error);
        }
      }
    }, 30000); // 30초마다 업데이트
  }

  // REST API 잔액 업데이트 중지
  stopBalanceUpdate() {
    if (this.balanceUpdateInterval) {
      clearInterval(this.balanceUpdateInterval);
      this.balanceUpdateInterval = null;
    }
  }
}

const okxService = new OKXService();
export default okxService; 