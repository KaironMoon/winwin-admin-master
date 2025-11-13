# 시스템 아키텍처 가이드

WinWin Admin 플랫폼의 전체 시스템 아키텍처, 설계 패턴 및 기술적 결정사항에 대한 상세 문서입니다.

## 📋 목차

- [시스템 개요](#시스템-개요)
- [아키텍처 다이어그램](#아키텍처-다이어그램)
- [기술 스택](#기술-스택)
- [프론트엔드 아키텍처](#프론트엔드-아키텍처)
- [상태 관리](#상태-관리)
- [인증 및 보안](#인증-및-보안)
- [데이터 플로우](#데이터-플로우)
- [컴포넌트 구조](#컴포넌트-구조)
- [라우팅 전략](#라우팅-전략)
- [API 통합](#api-통합)
- [성능 최적화](#성능-최적화)
- [확장성 고려사항](#확장성-고려사항)

## 🎯 시스템 개요

### 프로젝트 목적

MegaBit AI 트레이딩 봇 관리 플랫폼은 다음을 제공합니다:

1. **자동 거래 봇 관리**: DCA + Martingale 전략 기반 봇 생성 및 모니터링
2. **실시간 시장 분석**: TradingView 차트 및 OKX 시장 데이터 통합
3. **관리자 대시보드**: 사용자 관리, 제휴 네트워크, 수익 통계
4. **안전한 거래**: Demo/Production 모드, API 키 암호화, 리스크 관리

### 핵심 기능 영역

```
┌─────────────────────────────────────────────────┐
│           WinWin Admin Platform                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ 봇 생성/관리  │  │ 실시간 차트   │            │
│  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ 사용자 관리   │  │ 제휴 네트워크 │            │
│  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ OKX API 통합 │  │ 인증/보안     │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 📊 아키텍처 다이어그램

### 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Application (SPA)                     │   │
│  │                                                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  Pages     │  │ Components │  │  Stores    │        │   │
│  │  │  (Router)  │  │  (UI)      │  │  (Jotai)   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │         │              │                │               │   │
│  │         └──────────────┴────────────────┘               │   │
│  │                        │                                │   │
│  │  ┌────────────────────┴─────────────────────┐          │   │
│  │  │        Services & Libraries               │          │   │
│  │  │  - OKX API Client                         │          │   │
│  │  │  - Auth Utils                             │          │   │
│  │  │  - User Services                          │          │   │
│  │  └───────────────────────────────────────────┘          │   │
│  │         │                    │                           │   │
│  └─────────┼────────────────────┼───────────────────────────┘   │
│            │                    │                               │
└────────────┼────────────────────┼───────────────────────────────┘
             │                    │
             ▼                    ▼
    ┌────────────────┐   ┌────────────────┐
    │  Backend API   │   │   OKX API      │
    │  (FastAPI)     │   │  (REST/WSS)    │
    └────────────────┘   └────────────────┘
             │                    │
             ▼                    │
    ┌────────────────┐            │
    │   Database     │            │
    │  (PostgreSQL)  │            │
    └────────────────┘            │
                                  ▼
                         ┌────────────────┐
                         │ OKX Exchange   │
                         │  (Trading)     │
                         └────────────────┘
```

### 프론트엔드 계층 구조

```
┌──────────────────────────────────────────────────────┐
│                    Presentation Layer                │
│  Pages, Components, Layouts                          │
├──────────────────────────────────────────────────────┤
│                    Business Logic Layer              │
│  Services, Utilities, Custom Hooks                   │
├──────────────────────────────────────────────────────┤
│                    State Management Layer            │
│  Jotai Atoms, Context Providers                      │
├──────────────────────────────────────────────────────┤
│                    API Integration Layer             │
│  OKX API Client, Backend API Client                 │
├──────────────────────────────────────────────────────┤
│                    Infrastructure Layer              │
│  React Router, Axios, WebSocket, CryptoJS            │
└──────────────────────────────────────────────────────┘
```

## 🛠 기술 스택

### Frontend

| 카테고리 | 기술 | 목적 | 버전 |
|---------|------|------|------|
| **Core** | React | UI 프레임워크 | 18.2.0 |
| | React Router | SPA 라우팅 | 7.6.3 |
| **상태 관리** | Jotai | 경량 원자적 상태 관리 | 2.13.1 |
| **스타일링** | Tailwind CSS | 유틸리티 CSS 프레임워크 | 3.3.6 |
| | Radix UI | 접근성 높은 컴포넌트 | - |
| | Framer Motion | 애니메이션 라이브러리 | 10.16.5 |
| **차트** | TradingView Widget | 프로페셔널 차트 | - |
| | Lightweight Charts | 경량 차트 | 5.0.8 |
| | Recharts | React 차트 | 2.8.0 |
| | D3.js | 데이터 시각화 | 7.9.0 |
| **API** | Axios | HTTP 클라이언트 | 1.10.0 |
| | CryptoJS | 암호화 및 서명 | 4.2.0 |
| **Build** | Create React App | 빌드 도구 | 5.0.1 |

### 기술 선택 이유

#### React 18
- **장점**: 최신 기능 (Concurrent Mode, Suspense), 성숙한 생태계
- **용도**: 복잡한 UI 상태 관리, 컴포넌트 재사용성

#### Jotai vs Redux
```javascript
// Redux (선택 안 함)
// - Boilerplate 많음
// - 학습 곡선 높음
// - 큰 프로젝트에 적합

// Jotai (선택)
// - 최소한의 코드
// - 원자적 업데이트
// - TypeScript 친화적
import { atom, useAtom } from 'jotai';

const userAtom = atom(null);
const [user, setUser] = useAtom(userAtom);
```

#### Tailwind CSS vs CSS Modules
```css
/* CSS Modules (선택 안 함) */
.button { ... }
.button-primary { ... }

/* Tailwind CSS (선택) */
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
```
- **장점**: 빠른 개발, 일관된 디자인, 번들 크기 최소화

## 🏗 프론트엔드 아키텍처

### 디렉토리 구조 및 책임

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── BotPanel/       # 봇 생성 관련 컴포넌트
│   ├── AuthModal.jsx   # 인증 모달
│   ├── Chart.jsx       # TradingView 차트 wrapper
│   ├── Header.jsx      # 공통 헤더
│   └── ...
│
├── pages/              # 페이지 수준 컴포넌트 (라우트)
│   ├── MainPage.jsx    # 앱 진입점, 라우팅 관리
│   ├── LandingPage.jsx # 랜딩 페이지
│   ├── AdminPage.jsx   # 관리자 대시보드
│   └── ...
│
├── stores/             # Jotai 상태 관리
│   ├── isDemoStore.js  # Demo/Production 모드
│   └── userAuthStore.js # 사용자 인증 상태
│
├── services/           # 비즈니스 로직
│   └── userServices.js # 사용자 관련 API 호출
│
├── lib/                # 유틸리티 및 헬퍼
│   ├── okxApi.js       # OKX API 클라이언트
│   ├── okxService.js   # OKX WebSocket 서비스
│   ├── authUtils.js    # 인증 유틸리티
│   └── ...
│
├── router/             # 라우팅 설정
│   └── AppRouter.jsx   # React Router 설정
│
├── layouts/            # 레이아웃 컴포넌트
│   └── MainLayout.jsx  # 메인 레이아웃 (헤더, 푸터)
│
├── App.jsx             # 루트 컴포넌트
└── index.js            # ReactDOM 진입점
```

### 컴포넌트 계층 구조

```
MainPage (라우팅, 인증, 전역 상태)
  │
  ├── MainLayout (레이아웃)
  │     │
  │     ├── Header (헤더)
  │     │     ├── Navigation (네비게이션)
  │     │     └── UserProfile (사용자 프로필)
  │     │
  │     └── AppRouter (라우팅)
  │           │
  │           ├── / → LandingPage (랜딩)
  │           ├── /create → Dashboard (봇 생성)
  │           │              ├── Chart (차트)
  │           │              └── BotPanel (봇 설정)
  │           │                    ├── StrategySection
  │           │                    ├── RiskSection
  │           │                    └── ConfirmSection
  │           │
  │           ├── /bots → BotManagementPage (봇 관리)
  │           ├── /admin → AdminPage (관리자)
  │           │              ├── UserListPage
  │           │              ├── BrokerNetworkPage
  │           │              └── TransactionListPage
  │           │
  │           └── /test → OKXTestPanel (API 테스트)
  │
  ├── AuthModal (로그인/회원가입)
  ├── OKXConnectModal (OKX API 연결)
  └── MetaProphetModal (AI 진입 타이밍)
```

## 🔄 상태 관리

### Jotai 아키텍처

#### 전역 상태 Atoms

```javascript
// stores/isDemoStore.js
import { atom } from 'jotai';

// Demo/Production 모드
export const isDemoAtom = atom(true);

// 파생 atom (derived atom)
export const apiModeAtom = atom(
  (get) => get(isDemoAtom) ? 'sandbox' : 'production'
);
```

```javascript
// stores/userAuthStore.js
import { atom } from 'jotai';

// 사용자 정보
export const userAtom = atom(null);

// 인증 상태
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
);

// OKX 연결 상태
export const okxConnectedAtom = atom(false);
```

#### 컴포넌트에서 사용

```javascript
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isDemoAtom, userAtom } from '../stores';

function MyComponent() {
  // 읽기 + 쓰기
  const [isDemo, setIsDemo] = useAtom(isDemoAtom);

  // 읽기 전용
  const user = useAtomValue(userAtom);

  // 쓰기 전용
  const setUser = useSetAtom(userAtom);

  return (
    <div>
      <p>Mode: {isDemo ? 'Demo' : 'Production'}</p>
      <button onClick={() => setIsDemo(!isDemo)}>
        Toggle Mode
      </button>
    </div>
  );
}
```

### 상태 관리 패턴

```
┌────────────────────────────────────────────────┐
│              Component Tree                    │
├────────────────────────────────────────────────┤
│                                                │
│   Component A (useAtom)                        │
│        │                                       │
│        ├──> Jotai Atom ◄────┐                 │
│        │                    │                 │
│   Component B (useAtomValue)│                 │
│                             │                 │
│   Component C (useSetAtom)──┘                 │
│                                                │
└────────────────────────────────────────────────┘

특징:
- 자동 리렌더링 최적화
- 컴포넌트 간 상태 공유
- 최소한의 리렌더링 (atom 단위)
```

## 🔐 인증 및 보안

### JWT 인증 플로우

```
┌─────────────────────────────────────────────────┐
│            Authentication Flow                  │
└─────────────────────────────────────────────────┘

1. Login Request
   User → Frontend → Backend API
           POST /api/auth/login
           { email, password }

2. JWT Token Response
   Backend → Frontend
           { access_token, refresh_token, expires_in }

3. Store Token
   Frontend → localStorage
           setItem('access_token', token)
           setItem('token_expiry', expiry)

4. Authenticated Requests
   Frontend → Backend/OKX API
           Headers: { Authorization: "Bearer {token}" }

5. Token Validation
   - Check expiry before each request
   - Auto-refresh if expiring soon (20 min interval)

6. Token Refresh
   Frontend → Backend
           POST /api/auth/refresh
           Headers: { Authorization: "Bearer {refresh_token}" }

7. Logout
   Frontend → localStorage.clear()
```

### 인증 유틸리티 (authUtils.js)

```javascript
// 토큰 가져오기
export function getToken() {
  return localStorage.getItem('access_token');
}

// 토큰 만료 확인
export function isTokenExpired(token) {
  const expiry = localStorage.getItem('token_expiry');
  return Date.now() > parseInt(expiry);
}

// 토큰 곧 만료 확인
export function isTokenExpiringSoon(token) {
  const expiry = localStorage.getItem('token_expiry');
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() > (parseInt(expiry) - fiveMinutes);
}

// 토큰 갱신
export async function refreshToken() {
  const response = await axios.post('/api/auth/refresh', {}, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('token_expiry', Date.now() + response.data.expires_in * 1000);

  return response.data.access_token;
}

// 로그아웃
export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  window.location.href = '/';
}
```

### 자동 토큰 갱신 (MainPage.jsx)

```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const token = getToken();

    if (token && isTokenExpiringSoon(token)) {
      try {
        await refreshToken();
        console.log('✅ Token refreshed');
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        logout();
      }
    }
  }, 20 * 60 * 1000); // 20분마다 확인

  return () => clearInterval(interval);
}, []);
```

### OKX API 키 보안

```
┌─────────────────────────────────────────────────┐
│          OKX API Key Security                   │
└─────────────────────────────────────────────────┘

1. Storage
   - ❌ localStorage (클라이언트 측 저장 금지)
   - ✅ Backend DB (암호화하여 저장)

2. Encryption
   Backend: AES-256 암호화
   - API Key → Encrypted
   - API Secret → Encrypted
   - Passphrase → Encrypted

3. Usage
   Frontend → Backend: "Use my OKX credentials"
   Backend → Decrypt → OKX API call
   OKX → Response → Backend → Frontend

4. Session
   - 세션 중 메모리에만 보관
   - 페이지 새로고침 시 재요청
   - 로그아웃 시 메모리 삭제
```

## 📈 데이터 플로우

### 봇 생성 플로우

```
User Action                     Frontend                    Backend                    OKX API
─────────────────────────────────────────────────────────────────────────────────────────────

1. 봇 설정 입력
   [BotPanel]
      │
      ├─ Strategy: DCA + Martingale
      ├─ Symbol: BTC-USDT-SWAP
      ├─ Entry: $50,000
      ├─ Grid: 10 levels
      └─ Risk: 2%
      │
      ▼
2. AI 진입 타이밍 분석
   [MetaProphetModal]
      │
      ├─ Fetch candle data ────────────────────────────► /market/candles
      │                                                          │
      ◄─────────────────────────────────────────────────────────┘
      │                                                   Candle data
      ├─ AI analysis (local)
      └─ Optimal entry: $49,800
      │
      ▼
3. 봇 생성 요청
   [BotPanel]
      │
      └─> POST /api/bots/create ───────────────────────►
           { strategy, symbol, entry, grid, risk }
                                                              │
                                                              ├─ Validate params
                                                              ├─ Create bot record
                                                              ├─ Get user OKX creds
                                                              │
4. OKX 주문 생성                                              │
                                                              └─> OKX API
                                                                  /trade/batch-orders
                                                                  [ order1, order2, ... ]
                                                                        │
5. 응답                                                              │
   ◄─────────────────────────────────────────────────────────────────┘
   { bot_id, orders, status }                                  Orders created
      │
      ▼
6. UI 업데이트
   [BotManagementPage]
      └─ Refresh bot list
```

### 실시간 데이터 플로우

```
┌─────────────────────────────────────────────────────────────┐
│                WebSocket Data Flow                          │
└─────────────────────────────────────────────────────────────┘

1. WebSocket Connection
   Frontend (okxWebSocket.js)
      │
      └─> ws://www.okx.com/ws/v5/public
           Subscribe: { channel: "tickers", instId: "BTC-USDT-SWAP" }

2. Data Stream
   OKX WebSocket Server
      │
      └──> Stream: { last: 50000.5, vol24h: 1000000, ... }
             │
             ▼
   Frontend (Chart.jsx)
      │
      ├─ Update chart data
      └─ Update price display

3. Heartbeat (30s interval)
   Frontend → OKX: "ping"
   OKX → Frontend: "pong"
```

## 🧩 컴포넌트 구조

### 페이지 컴포넌트 (Pages)

#### MainPage.jsx
**역할**: 애플리케이션 진입점, 전역 상태 및 라우팅 관리

```javascript
function MainPage() {
  // 전역 상태
  const [user, setUser] = useState(null);
  const isDemo = useAtomValue(isDemoAtom);

  // JWT 자동 갱신
  useEffect(() => { /* 20분마다 토큰 갱신 */ }, []);

  // 초기 사용자 정보 로드
  useEffect(() => { /* 로그인 사용자 정보 */ }, []);

  return (
    <MainLayout>
      <AppRouter />
      <AuthModal />
      <OKXConnectModal />
      <MetaProphetModal />
    </MainLayout>
  );
}
```

#### Dashboard (Bot Creation Page)
**역할**: 봇 생성 및 차트 표시

```javascript
function Dashboard() {
  const [symbol, setSymbol] = useState('BTC-USDT-SWAP');
  const [botConfig, setBotConfig] = useState({});

  return (
    <div className="grid grid-cols-2 gap-4">
      <Chart symbol={symbol} />
      <BotPanel onBotCreate={handleBotCreate} />
    </div>
  );
}
```

### UI 컴포넌트 (Components)

#### Chart.jsx
**역할**: TradingView 차트 wrapper

```javascript
function Chart({ symbol, interval = '15' }) {
  const containerRef = useRef();

  useEffect(() => {
    const widget = new TradingView.widget({
      symbol: symbol,
      interval: interval,
      container: containerRef.current,
      // ... 설정
    });

    return () => widget.remove();
  }, [symbol, interval]);

  return <div ref={containerRef} className="h-full" />;
}
```

#### BotPanel (복합 컴포넌트)

```
BotPanel
  │
  ├── SymbolSelector      # 거래 페어 선택
  ├── StrategySection     # 전략 설정 (DCA, Martingale)
  ├── RiskSection         # 리스크 관리 (Stop-loss, Take-profit)
  ├── GridSection         # 그리드 설정 (레벨, 간격)
  ├── PreviewSection      # 설정 미리보기
  └── ConfirmSection      # 봇 생성 버튼
```

## 🚦 라우팅 전략

### React Router v7 설정

```javascript
// router/AppRouter.jsx
import { Routes, Route } from 'react-router-dom';

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected Routes */}
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/bots" element={<BotManagementPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      >
        <Route path="users" element={<UserListPage />} />
        <Route path="broker-network" element={<BrokerNetworkPage />} />
        <Route path="transactions" element={<TransactionListPage />} />
      </Route>

      {/* Dev/Test Routes */}
      <Route path="/test" element={<OKXTestPanel />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### Protected Route

```javascript
function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const user = useAtomValue(userAtom);

  if (!user || user.level !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

## 🔌 API 통합

### Backend API Client

```javascript
// services/userServices.js
import axios from 'axios';
import { getToken } from '../lib/authUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.megabit-td.com';

class UserServices {
  static async getProfile() {
    const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  }

  static async getOKXCredentials(userId) {
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/okx-credentials`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  }

  static async updateOKXCredentials(apiKey, apiSecret, passphrase) {
    const response = await axios.post(`${API_BASE_URL}/api/users/okx-credentials`, {
      api_key: apiKey,
      api_secret: apiSecret,
      passphrase: passphrase
    }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  }
}

export default UserServices;
```

### OKX API Integration

자세한 내용은 [OKX API 가이드](./OKX_API.md)를 참조하세요.

## ⚡ 성능 최적화

### 1. Code Splitting

```javascript
// Lazy loading으로 번들 크기 최소화
import { lazy, Suspense } from 'react';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const BotManagementPage = lazy(() => import('./pages/BotManagementPage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/bots" element={<BotManagementPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Memoization

```javascript
import { useMemo, useCallback } from 'react';

function BotPanel({ bots }) {
  // 비싼 계산 캐싱
  const activeBots = useMemo(() => {
    return bots.filter(bot => bot.status === 'active');
  }, [bots]);

  // 함수 참조 안정성
  const handleBotCreate = useCallback((config) => {
    createBot(config);
  }, []);

  return <BotList bots={activeBots} onCreate={handleBotCreate} />;
}
```

### 3. 가상화 (Long Lists)

```javascript
// react-window로 긴 목록 최적화
import { FixedSizeList } from 'react-window';

function BotList({ bots }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <BotCard bot={bots[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={bots.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 4. 이미지 최적화

```javascript
// Lazy loading images
<img
  src="/images/chart.png"
  loading="lazy"
  alt="Trading Chart"
/>

// WebP with fallback
<picture>
  <source srcSet="/images/chart.webp" type="image/webp" />
  <img src="/images/chart.png" alt="Trading Chart" />
</picture>
```

## 📈 확장성 고려사항

### 1. 마이크로프론트엔드 전환 가능성

```
현재 (Monolith)                   미래 (Micro-frontends)
┌──────────────────┐              ┌────────────────────────┐
│  Single React App│              │   Shell App (Router)   │
│                  │              ├────────────────────────┤
│  - Bot Management│              │ ┌──────────────────┐   │
│  - Admin         │              │ │ Bot Module       │   │
│  - Trading       │   ────────>  │ └──────────────────┘   │
│  - Charts        │              │ ┌──────────────────┐   │
│  ...             │              │ │ Admin Module     │   │
│                  │              │ └──────────────────┘   │
└──────────────────┘              │ ┌──────────────────┐   │
                                   │ │ Trading Module   │   │
                                   │ └──────────────────┘   │
                                   └────────────────────────┘
```

### 2. PWA (Progressive Web App) 지원

```javascript
// public/manifest.json
{
  "short_name": "WinWin",
  "name": "WinWin Trading Platform",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

// Service Worker 등록
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 3. 다국어 지원 (i18n)

```javascript
// 미래 확장: react-i18next
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function BotPanel() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('bot.create.title')}</h1>
      <button>{t('bot.create.submit')}</button>
    </div>
  );
}
```

## 📚 참고 자료

- [README.md](../README.md) - 프로젝트 개요 및 시작 가이드
- [OKX API 가이드](./OKX_API.md) - OKX API 통합 상세 가이드
- [Hierarchy API 가이드](./hierarchy_api_client_guide.md) - 제휴 계층 API
- [DEPLOYMENT.md](../DEPLOYMENT.md) - 배포 및 운영 가이드

---

**마지막 업데이트**: 2025-11-11
**작성자**: MegaBit Development Team
