import OKXApi from './okxApi.js';

class OKXApiTester {
  constructor(apiKey, apiSecret, passphrase, isSandbox = false) {
    this.api = new OKXApi(apiKey, apiSecret, passphrase, isSandbox);
    this.testResults = [];
  }

  // 테스트 결과 기록
  recordTest(testName, success, details = null) {
    const result = {
      testName,
      success,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.testResults.push(result);
    
    return result;
  }

  // 기본 설정 테스트
  async testBasicSetup() {
    try {
      
      const hasApiKey = !!this.api.apiKey;
      const hasApiSecret = !!this.api.apiSecret;
      const hasPassphrase = !!this.api.passphrase;
      
      if (hasApiKey && hasApiSecret && hasPassphrase) {
        this.recordTest('기본 설정', true, {
          hasApiKey,
          hasApiSecret,
          hasPassphrase,
          baseUrl: this.api.baseUrl,
          isSandbox: this.api.isSandbox
        });
      } else {
        this.recordTest('기본 설정', false, {
          hasApiKey,
          hasApiSecret,
          hasPassphrase,
          error: 'API 키 정보가 누락되었습니다'
        });
      }
    } catch (error) {
      this.recordTest('기본 설정', false, { error: error.message });
    }
  }

  // 서버 시간 동기화 테스트
  async testServerTimeSync() {
    try {
      const serverTime = await this.api.getServerTime();
      const localTime = new Date().toISOString();
      
      const serverDate = new Date(serverTime);
      const localDate = new Date(localTime);
      const timeDiff = Math.abs(serverDate.getTime() - localDate.getTime());
      
      if (timeDiff < 30000) { // 30초 이내
        this.recordTest('서버 시간 동기화', true, {
          serverTime,
          localTime,
          timeDiffMs: timeDiff
        });
      } else {
        this.recordTest('서버 시간 동기화', false, {
          serverTime,
          localTime,
          timeDiffMs: timeDiff,
          error: '서버와 로컬 시간 차이가 30초 이상입니다'
        });
      }
    } catch (error) {
      this.recordTest('서버 시간 동기화', false, { error: error.message });
    }
  }

  // 상세 시간 동기화 테스트
  async testDetailedTimeSync() {
    try {
      const startTime = Date.now();
      const serverTime = await this.api.getServerTime();
      const endTime = Date.now();
      
      const networkLatency = endTime - startTime;
      const serverDate = new Date(serverTime);
      const adjustedLocalTime = new Date(endTime + this.api.timeOffset);
      
      const timeDiff = Math.abs(serverDate.getTime() - adjustedLocalTime.getTime());
      
      this.recordTest('상세 시간 동기화', true, {
        serverTime,
        networkLatency,
        timeOffset: this.api.timeOffset,
        adjustedLocalTime: adjustedLocalTime.toISOString(),
        timeDiffMs: timeDiff,
        isTimeSyncValid: this.api.isTimeSyncValid()
      });
    } catch (error) {
      this.recordTest('상세 시간 동기화', false, { error: error.message });
    }
  }

  // 서명 생성 테스트
  async testSignatureGeneration() {
    try {
      const method = 'GET';
      const requestPath = '/account/balance';
      const body = '';
      
      const { timestamp, signature } = await this.api.generateSignature(method, requestPath, body);
      
      if (timestamp && signature) {
        this.recordTest('서명 생성', true, {
          method,
          requestPath,
          timestamp,
          signature: this.api.maskString(signature, 10)
        });
      } else {
        this.recordTest('서명 생성', false, {
          error: '서명 생성 실패'
        });
      }
    } catch (error) {
      this.recordTest('서명 생성', false, { error: error.message });
    }
  }

  // 헤더 생성 테스트
  async testHeaderGeneration() {
    try {
      const method = 'GET';
      const requestPath = '/account/balance';
      const body = '';
      
      const headers = await this.api.getHeaders(method, requestPath, body);
      
      const requiredHeaders = [
        'OK-ACCESS-KEY',
        'OK-ACCESS-SIGN',
        'OK-ACCESS-TIMESTAMP',
        'OK-ACCESS-PASSPHRASE',
        'Content-Type'
      ];
      
      const missingHeaders = requiredHeaders.filter(header => !headers[header]);
      
      if (missingHeaders.length === 0) {
        this.recordTest('헤더 생성', true, {
          headers: this.api.sanitizeData(headers)
        });
      } else {
        this.recordTest('헤더 생성', false, {
          missingHeaders,
          error: '필수 헤더가 누락되었습니다'
        });
      }
    } catch (error) {
      this.recordTest('헤더 생성', false, { error: error.message });
    }
  }

  // 공개 API 테스트
  async testPublicAPI() {
    try {
      const response = await fetch(`${this.api.baseUrl}/public/time`);
      const data = await response.json();
      
      if (data.code === '0' && data.data) {
        this.recordTest('공개 API', true, {
          serverTime: data.data[0].ts
        });
      } else {
        this.recordTest('공개 API', false, {
          error: data.msg || '공개 API 호출 실패'
        });
      }
    } catch (error) {
      this.recordTest('공개 API', false, { error: error.message });
    }
  }

  // 인증 API 테스트
  async testAuthenticatedAPI() {
    try {
      const accountInfo = await this.api.getBalance();
      
      if (accountInfo && accountInfo.data) {
        this.recordTest('인증 API', true, {
          accountInfo: '계정 정보 조회 성공'
        });
      } else {
        this.recordTest('인증 API', false, {
          error: '계정 정보 조회 실패'
        });
      }
    } catch (error) {
      this.recordTest('인증 API', false, { error: error.message });
    }
  }

  // 잔액 조회 테스트
  async testBalanceQuery() {
    try {
      const balance = await this.api.getBalance();
      
      if (balance && balance.data) {
        this.recordTest('잔액 조회', true, {
          balance: '잔액 정보 조회 성공',
          dataLength: balance.data.length
        });
      } else {
        this.recordTest('잔액 조회', false, {
          error: '잔액 정보 조회 실패'
        });
      }
    } catch (error) {
      this.recordTest('잔액 조회', false, { error: error.message });
    }
  }

  // 포지션 조회 테스트
  async testPositionQuery() {
    try {
      const positions = await this.api.getPositions();
      
      if (positions && positions.data) {
        this.recordTest('포지션 조회', true, {
          positions: '포지션 정보 조회 성공',
          dataLength: positions.data.length
        });
      } else {
        this.recordTest('포지션 조회', false, {
          error: '포지션 정보 조회 실패'
        });
      }
    } catch (error) {
      this.recordTest('포지션 조회', false, { error: error.message });
    }
  }

  // 전체 테스트 실행
  async runAllTests() {
    await this.testBasicSetup();
    await this.testServerTimeSync();
    await this.testDetailedTimeSync();
    await this.testSignatureGeneration();
    await this.testHeaderGeneration();
    await this.testPublicAPI();
    await this.testAuthenticatedAPI();
    await this.testBalanceQuery();
    await this.testPositionQuery();
  }

  // 테스트 결과 요약 출력
  printSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    if (failedTests > 0) {
      // 실패한 테스트들
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          // 실패한 테스트 정보
        });
    }
  }

  // 특정 테스트만 실행
  async runSpecificTest(testName) {
    const testMap = {
      'setup': this.testBasicSetup.bind(this),
      'time': this.testServerTimeSync.bind(this),
      'detailedTime': this.testDetailedTimeSync.bind(this),
      'signature': this.testSignatureGeneration.bind(this),
      'headers': this.testHeaderGeneration.bind(this),
      'public': this.testPublicAPI.bind(this),
      'auth': this.testAuthenticatedAPI.bind(this),
      'balance': this.testBalanceQuery.bind(this),
      'positions': this.testPositionQuery.bind(this)
    };
    
    const test = testMap[testName];
    if (!test) {
      return;
    }
    
    await test();
  }
}

export default OKXApiTester; 