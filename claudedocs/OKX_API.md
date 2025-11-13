# OKX API 통합 가이드

WinWin Admin 플랫폼에서 OKX 거래소 API를 사용하는 방법에 대한 상세 가이드입니다.

## 📋 목차

- [개요](#개요)
- [API 클라이언트 설정](#api-클라이언트-설정)
- [인증 및 보안](#인증-및-보안)
- [시간 동기화](#시간-동기화)
- [주요 API 메서드](#주요-api-메서드)
- [에러 처리](#에러-처리)
- [Best Practices](#best-practices)
- [테스트](#테스트)

## 🎯 개요

### OKX API 클라이언트 (okxApi.js)

`src/lib/okxApi.js`는 OKX 거래소 REST API와의 통신을 담당하는 핵심 클라이언트입니다.

**주요 기능:**
- ✅ HMAC-SHA256 기반 API 서명 생성
- ✅ 자동 시간 동기화 및 보정
- ✅ Demo/Production 모드 전환
- ✅ 자동 재시도 로직
- ✅ 보안 데이터 마스킹

### API 버전 및 엔드포인트

```javascript
Base URL: https://www.okx.com/api/v5
Sandbox URL: https://www.okx.com/api/v5  // x-simulated-trading 헤더 사용
```

## 🔧 API 클라이언트 설정

### 1. 기본 사용법

```javascript
import OKXApi from '../lib/okxApi';

// API 클라이언트 인스턴스 생성
const okxApi = new OKXApi(
  apiKey,      // OKX API Key
  apiSecret,   // OKX API Secret
  passphrase,  // OKX API Passphrase
  isSandbox    // true: Demo 모드, false: Production 모드
);
```

### 2. 생성자 파라미터

| 파라미터 | 타입 | 설명 | 필수 |
|---------|------|------|------|
| `apiKey` | string | OKX API 키 | ✅ |
| `apiSecret` | string | OKX API 시크릿 | ✅ |
| `passphrase` | string | OKX API 패스프레이즈 | ✅ |
| `isSandbox` | boolean | Demo 모드 여부 (기본값: false) | ❌ |

### 3. 초기화 예시

```javascript
// Production 모드
const prodApi = new OKXApi(
  'your-api-key',
  'your-api-secret',
  'your-passphrase',
  false
);

// Demo/Sandbox 모드
const demoApi = new OKXApi(
  'demo-api-key',
  'demo-api-secret',
  'demo-passphrase',
  true
);

// 시간 동기화 (필수!)
await prodApi.getServerTime(true);
```

## 🔐 인증 및 보안

### 서명 생성 프로세스

OKX API는 HMAC-SHA256 서명을 사용하여 요청을 인증합니다.

#### 서명 생성 과정

```javascript
// 1. 타임스탬프 생성 (ISO 8601 형식)
const timestamp = "2025-11-11T10:30:00.000Z";

// 2. 서명 문자열 구성
const message = timestamp + method + requestPath + body;
// 예: "2025-11-11T10:30:00.000ZGET/api/v5/account/balance"

// 3. HMAC-SHA256 해시 생성 및 Base64 인코딩
const signature = Base64(HmacSHA256(message, apiSecret));

// 4. 헤더에 포함
headers = {
  'OK-ACCESS-KEY': apiKey,
  'OK-ACCESS-SIGN': signature,
  'OK-ACCESS-TIMESTAMP': timestamp,
  'OK-ACCESS-PASSPHRASE': passphrase,
  'Content-Type': 'application/json'
};

// 5. Demo 모드 헤더 추가
if (isSandbox) {
  headers['x-simulated-trading'] = '1';
}
```

#### 자동 서명 생성

```javascript
// 내부적으로 자동 처리됨
const { timestamp, signature } = await okxApi.generateSignature(
  'GET',                    // HTTP 메서드
  '/api/v5/account/balance', // 요청 경로
  ''                        // 요청 바디 (GET은 빈 문자열)
);
```

### 보안 기능

#### 1. 데이터 마스킹

민감한 정보를 로그에 출력할 때 자동으로 마스킹합니다:

```javascript
// API 키: abc123def456ghi789 → abc1***i789
const masked = okxApi.maskString('abc123def456ghi789', 4);
console.log(masked); // "abc1***************i789"

// 전체 객체 마스킹
const sanitized = okxApi.sanitizeData({
  apiKey: 'secret-key',
  apiSecret: 'secret-value',
  data: { price: 50000 }
});
// { apiKey: 'secr****cret-key', apiSecret: 'secr****alue', data: { price: 50000 } }
```

#### 2. API 키 저장

```javascript
// 사용자별 API 키는 암호화하여 서버에 저장
// localStorage에는 저장하지 않음 (보안 위험)

// 서버에서 API 키 가져오기
const userCredentials = await UserServices.getOKXCredentials(userId);
const okxApi = new OKXApi(
  userCredentials.apiKey,
  userCredentials.apiSecret,
  userCredentials.passphrase,
  isDemoMode
);
```

## ⏰ 시간 동기화

### 중요성

OKX API는 **타임스탬프 기반 인증**을 사용하므로, 서버 시간과 로컬 시간의 차이가 30초 이상 나면 인증이 실패합니다.

### 자동 시간 동기화

```javascript
// 1. 초기 시간 동기화 (필수)
await okxApi.getServerTime(true);  // forceSync = true

// 2. 캐시된 시간 사용 (10분 동안 유효)
const serverTime = await okxApi.getServerTime();  // 캐시 사용

// 3. 강제 재동기화
await okxApi.forceTimeSync();
```

### 시간 보정 메커니즘

```javascript
// 내부 동작 방식:
// 1. 서버 시간 요청
const response = await fetch('https://www.okx.com/api/v5/public/time');
const serverMs = parseInt(response.data[0].ts);

// 2. 네트워크 지연 측정
const networkLatency = endTime - startTime;

// 3. 시간 차이 계산
const timeDiff = serverMs - localMs;
const adjustedTimeDiff = timeDiff + (networkLatency / 2);

// 4. 이동 평균으로 부드러운 보정
this.timeOffset = this.timeOffset * 0.7 + adjustedTimeDiff * 0.3;

// 5. 보정된 시간 사용
const adjustedTime = Date.now() + this.timeOffset;
```

### 시간 동기화 상태 확인

```javascript
// 시간 동기화가 유효한지 확인
if (!okxApi.isTimeSyncValid()) {
  console.log('⚠️ 시간 동기화 필요');
  await okxApi.forceTimeSync();
}

// 마지막 동기화 시간 확인
console.log('Last sync:', okxApi.lastServerTime);
console.log('Time offset:', okxApi.timeOffset, 'ms');
```

## 📡 주요 API 메서드

### 1. 계정 관리

#### 잔액 조회

```javascript
/**
 * 계정 잔고 조회
 * @returns {Promise<Object>} 잔액 정보
 */
const balance = await okxApi.getBalance();

// 응답 예시
{
  code: '0',
  data: [{
    totalEq: '10000.5',      // 총 자산 (USDT 기준)
    details: [{
      ccy: 'USDT',           // 통화
      availBal: '9500.5',    // 사용 가능 잔액
      frozenBal: '500',      // 동결 잔액
      eq: '10000.5'          // 총 잔액
    }]
  }]
}
```

#### 포지션 조회

```javascript
/**
 * 현재 포지션 조회
 * @returns {Promise<Object>} 포지션 정보
 */
const positions = await okxApi.getPositions();

// 응답 예시
{
  code: '0',
  data: [{
    instId: 'BTC-USDT-SWAP',  // 거래 페어
    pos: '1.5',                // 포지션 크기
    avgPx: '50000',            // 평균 진입 가격
    upl: '500',                // 미실현 손익
    uplRatio: '0.01',          // 수익률
    lever: '10',               // 레버리지
    mgnMode: 'cross',          // 마진 모드
    posSide: 'long'            // 포지션 방향 (long/short)
  }]
}
```

#### 주문 조회

```javascript
/**
 * 활성 주문 조회 (일반 주문 + 알고리즘 주문)
 * @param {string} instId - 거래 페어 (선택사항)
 * @param {string} state - 주문 상태 (기본값: 'live')
 * @returns {Promise<Object>} 주문 목록
 */
const orders = await okxApi.getOrders('BTC-USDT-SWAP', 'live');

// 조회되는 주문 타입:
// - 일반 대기 주문 (limit, market)
// - Trigger 주문
// - Conditional 주문 (Stop-loss/Take-profit)
// - OCO 주문 (One-Cancels-Other)
// - 모든 알고리즘 주문

// 응답 예시
{
  data: [
    {
      ordId: '12345',
      instId: 'BTC-USDT-SWAP',
      ordType: 'limit',
      px: '50000',        // 주문 가격
      sz: '0.1',          // 주문 수량
      side: 'buy',        // 매수/매도
      state: 'live',      // 주문 상태
      fillSz: '0'         // 체결 수량
    },
    {
      ordId: '67890',
      instId: 'BTC-USDT-SWAP',
      ordType: 'trigger',
      triggerPx: '51000', // 트리거 가격
      sz: '0.2',
      side: 'sell',
      state: 'live'
    }
  ]
}
```

### 2. 시장 데이터

#### 현재 가격 조회

```javascript
/**
 * 특정 심볼의 현재 가격 조회
 * @param {string} instId - 거래 페어 (예: 'BTC-USDT-SWAP')
 * @returns {Promise<number>} 현재 가격
 */
const price = await okxApi.getCurrentPrice('BTC-USDT-SWAP');
console.log('BTC 현재 가격:', price); // 50000.5
```

#### 티커 정보 조회

```javascript
/**
 * 티커 정보 조회 (가격, 거래량 등)
 * @param {string} instId - 거래 페어
 * @returns {Promise<Object>} 티커 정보
 */
const ticker = await okxApi.getTicker('BTC-USDT-SWAP');

// 응답 예시
{
  instId: 'BTC-USDT-SWAP',
  last: '50000.5',        // 최근 거래 가격
  bid: '50000',           // 매수 호가
  ask: '50001',           // 매도 호가
  vol24h: '1000000',      // 24시간 거래량
  volCcy24h: '50000000',  // 24시간 거래대금
  high24h: '51000',       // 24시간 최고가
  low24h: '49000',        // 24시간 최저가
  ts: '1699999999999'     // 타임스탬프
}
```

#### 여러 심볼 티커 조회

```javascript
/**
 * 여러 심볼의 티커 정보를 한 번에 조회
 * @param {string[]} instIds - 거래 페어 배열
 * @returns {Promise<Object[]>} 티커 정보 배열
 */
const tickers = await okxApi.getMultipleTickers([
  'BTC-USDT-SWAP',
  'ETH-USDT-SWAP',
  'SOL-USDT-SWAP'
]);

tickers.forEach(ticker => {
  console.log(`${ticker.instId}: ${ticker.last}`);
});
```

#### 캔들(K-라인) 데이터 조회

```javascript
/**
 * 캔들 데이터 조회
 * @param {string} instId - 거래 페어
 * @param {string} bar - 캔들 간격 (1m, 5m, 15m, 1H, 4H, 1D 등)
 * @param {string} limit - 조회 개수 (최대 300)
 * @returns {Promise<Object>} 캔들 데이터
 */
const candles = await okxApi.getCandles('BTC-USDT-SWAP', '15m', '100');

// 응답 예시
{
  code: '0',
  data: [
    [
      '1699999999999',  // [0] 타임스탬프
      '50000',          // [1] 시가
      '51000',          // [2] 고가
      '49500',          // [3] 저가
      '50500',          // [4] 종가
      '1000',           // [5] 거래량 (CONT)
      '50000000'        // [6] 거래대금 (통화)
    ],
    // ... 더 많은 캔들
  ]
}

// 차트 데이터로 변환
const chartData = candles.data.map(candle => ({
  time: parseInt(candle[0]),
  open: parseFloat(candle[1]),
  high: parseFloat(candle[2]),
  low: parseFloat(candle[3]),
  close: parseFloat(candle[4]),
  volume: parseFloat(candle[5])
}));
```

#### 거래 가능한 심볼 조회

```javascript
/**
 * 선물 거래 가능한 모든 심볼 조회
 * @returns {Promise<Object[]>} 심볼 목록
 */
const symbols = await okxApi.getFuturesSymbols();

// 응답 예시
[
  {
    instId: 'BTC-USDT-SWAP',
    displayName: 'BTC/USDT',
    baseCcy: 'BTC',
    quoteCcy: 'USDT',
    state: 'live'
  },
  {
    instId: 'ETH-USDT-SWAP',
    displayName: 'ETH/USDT',
    baseCcy: 'ETH',
    quoteCcy: 'USDT',
    state: 'live'
  }
  // ... 더 많은 심볼
]

// UI에서 사용
symbols.forEach(symbol => {
  console.log(`${symbol.displayName} (${symbol.instId})`);
});
```

### 3. 공통 API 메서드

#### makeRequest (인증 필요)

```javascript
/**
 * 인증이 필요한 API 요청
 * @param {string} method - HTTP 메서드 (GET, POST, etc.)
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} params - URL 쿼리 파라미터
 * @param {Object} body - 요청 바디
 * @param {number} retryCount - 재시도 횟수
 * @returns {Promise<Object>} API 응답
 */
const response = await okxApi.makeRequest(
  'POST',
  '/trade/order',
  {},  // params
  {    // body
    instId: 'BTC-USDT-SWAP',
    tdMode: 'cross',
    side: 'buy',
    ordType: 'limit',
    px: '50000',
    sz: '0.1'
  }
);
```

#### makePublicRequest (인증 불필요)

```javascript
/**
 * 인증이 필요 없는 공개 API 요청
 * @param {string} method - HTTP 메서드
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} params - URL 쿼리 파라미터
 * @returns {Promise<Object>} API 응답
 */
const instruments = await okxApi.makePublicRequest(
  'GET',
  '/public/instruments',
  { instType: 'SWAP' }
);
```

## ⚠️ 에러 처리

### 일반적인 에러 타입

```javascript
try {
  const balance = await okxApi.getBalance();
} catch (error) {
  if (error.message.includes('API 요청 실패')) {
    // HTTP 에러 (4xx, 5xx)
    console.error('HTTP 에러:', error);
  } else if (error.message.includes('OKX API 오류')) {
    // OKX API 응답 코드 에러
    console.error('OKX 에러:', error);
  } else if (error.message.includes('network') || error.message.includes('timeout')) {
    // 네트워크 에러 (자동 재시도 3회)
    console.error('네트워크 에러:', error);
  } else if (error.message.includes('API Secret')) {
    // 인증 정보 누락
    console.error('인증 에러:', error);
  }
}
```

### OKX API 응답 코드

| 코드 | 의미 | 처리 방법 |
|------|------|----------|
| `0` | 성공 | 정상 처리 |
| `1` | 운영 실패 | 요청 파라미터 확인 |
| `50000` | Body가 비어있음 | POST 요청에 body 추가 |
| `50001` | 서비스 일시 중단 | 잠시 후 재시도 |
| `50002` | JSON 데이터 형식 오류 | 요청 body 형식 확인 |
| `50004` | API 엔드포인트 요청 타임아웃 | 재시도 또는 타임아웃 증가 |
| `50011` | 요청 헤더 'OK-ACCESS-KEY' 누락 | API 키 확인 |
| `50013` | 유효하지 않은 서명 | 서명 생성 로직 확인 |
| `50102` | API 업데이트, 현재 버전 사용 불가 | API 버전 업데이트 |
| `50103` | 요청이 너무 빈번함 (Rate Limit) | 요청 간격 조절 |
| `50111` | 유효하지 않은 API 키 | API 키 재확인 |

### 자동 재시도 로직

```javascript
// makeRequest 내부에 구현됨
// 네트워크 에러 시 최대 3회 자동 재시도
// 재시도 간격: 1초, 2초, 3초 (지수 백오프)

// 재시도 예시
try {
  return await this.makeRequest(method, endpoint, params, body, 0);
} catch (error) {
  if (retryCount < 3 && isNetworkError(error)) {
    await sleep(1000 * (retryCount + 1));
    return this.makeRequest(method, endpoint, params, body, retryCount + 1);
  }
  throw error;
}
```

## 💡 Best Practices

### 1. 초기화 및 시간 동기화

```javascript
// ✅ 올바른 방법
async function initOKXApi() {
  const okxApi = new OKXApi(apiKey, apiSecret, passphrase, isDemoMode);

  // 반드시 시간 동기화 먼저!
  await okxApi.forceTimeSync();

  // 이후 API 호출
  const balance = await okxApi.getBalance();
  return okxApi;
}

// ❌ 잘못된 방법
const okxApi = new OKXApi(apiKey, apiSecret, passphrase);
const balance = await okxApi.getBalance(); // 시간 동기화 없이 바로 호출 → 실패 가능
```

### 2. Demo/Production 모드 관리

```javascript
// 전역 상태로 모드 관리
import { useAtomValue } from 'jotai';
import { isDemoAtom } from '../stores/isDemoStore';

function MyComponent() {
  const isDemo = useAtomValue(isDemoAtom);

  // 모드에 따라 API 인스턴스 생성
  const okxApi = useMemo(() => {
    const credentials = isDemo ? demoCredentials : prodCredentials;
    return new OKXApi(
      credentials.apiKey,
      credentials.apiSecret,
      credentials.passphrase,
      isDemo
    );
  }, [isDemo]);

  // 모드 전환 시 재초기화
  useEffect(() => {
    okxApi.setSandboxMode(isDemo);
    okxApi.forceTimeSync();
  }, [isDemo, okxApi]);
}
```

### 3. 에러 처리 및 사용자 피드백

```javascript
async function fetchBalance() {
  try {
    setLoading(true);

    // 시간 동기화 확인
    if (!okxApi.isTimeSyncValid()) {
      setMessage('시간 동기화 중...');
      await okxApi.forceTimeSync();
    }

    const balance = await okxApi.getBalance();
    setBalance(balance.data);
    setMessage('잔액 조회 성공');

  } catch (error) {
    // 사용자에게 명확한 에러 메시지
    if (error.message.includes('50111')) {
      setError('API 키가 유효하지 않습니다. 설정을 확인해주세요.');
    } else if (error.message.includes('50103')) {
      setError('요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message.includes('50013')) {
      setError('서명 오류입니다. 시간 동기화를 다시 시도합니다.');
      await okxApi.forceTimeSync();
    } else {
      setError('잔액 조회 실패: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
}
```

### 4. Rate Limiting 관리

```javascript
// 요청 간격 조절
class RateLimiter {
  constructor(maxRequests = 20, perSeconds = 2) {
    this.maxRequests = maxRequests;
    this.perSeconds = perSeconds;
    this.requests = [];
  }

  async waitIfNeeded() {
    const now = Date.now();
    const windowStart = now - (this.perSeconds * 1000);

    // 윈도우 내 요청 필터링
    this.requests = this.requests.filter(time => time > windowStart);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + (this.perSeconds * 1000) - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter(20, 2); // 2초당 20개 요청

async function makeRateLimitedRequest() {
  await rateLimiter.waitIfNeeded();
  return okxApi.getBalance();
}
```

### 5. 보안 권장사항

```javascript
// ✅ 올바른 방법
// 1. API 키는 환경 변수나 암호화된 스토리지에 저장
const credentials = await fetchEncryptedCredentials(userId);

// 2. 로그에 민감한 정보 출력 금지
const sanitized = okxApi.sanitizeData(apiResponse);
console.log('Response:', sanitized);

// 3. localStorage에 API 키 저장 금지
// ❌ localStorage.setItem('okxApiKey', apiKey);
// ✅ 서버에 암호화하여 저장

// 4. Demo 모드에서 테스트 후 Production 전환
if (import.meta.env.MODE === 'development') {
  isSandbox = true;
}
```

## 🧪 테스트

### OKX API 테스트 패널

프로젝트에는 API 테스트를 위한 전용 UI가 포함되어 있습니다:

**접속**: http://localhost:3000/test

```javascript
import OKXApiTester from '../lib/okxApiTest';

// 테스터 인스턴스 생성
const tester = new OKXApiTester(apiKey, apiSecret, passphrase, isSandbox);

// 전체 테스트 실행
await tester.runAllTests();

// 개별 테스트
await tester.testServerTime();      // 서버 시간 조회
await tester.testSignature();       // 서명 생성
await tester.testBalance();         // 잔액 조회
await tester.testPositions();       // 포지션 조회
await tester.testMarketData();      // 시장 데이터
```

### 서명 검증

```javascript
// 서명이 올바른지 검증
const verification = await okxApi.verifySignature(
  'GET',
  '/api/v5/account/balance',
  '',
  expectedSignature,
  originalTimestamp
);

console.log('서명 유효:', verification.isValid);
console.log('계산된 서명:', verification.calculatedSignature);
console.log('예상 서명:', verification.expectedSignature);
```

## 📚 참고 자료

### 공식 문서

- **OKX API 문서**: https://www.okx.com/docs-v5/en/
- **OKX API 엔드포인트**: https://www.okx.com/api/v5
- **API 키 관리**: https://www.okx.com/account/my-api

### 추가 파일

- **okxService.js**: WebSocket 실시간 데이터 스트리밍
- **okxWebSocket.js**: WebSocket 연결 관리
- **okxApiTest.js**: API 테스트 유틸리티

### 관련 문서

- [README.md](../README.md) - 프로젝트 개요
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [DEPLOYMENT.md](../DEPLOYMENT.md) - 배포 가이드

---

**마지막 업데이트**: 2025-11-11
**작성자**: MegaBit Development Team
