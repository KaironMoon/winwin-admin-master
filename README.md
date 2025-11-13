# WinWin Admin - MegaBit AI 트레이딩 플랫폼

MegaBit AI 트레이딩 봇 관리 플랫폼의 관리자 및 사용자 대시보드입니다. OKX 거래소 API를 통한 자동 거래 봇 생성, 관리 및 모니터링 기능을 제공합니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [개발 가이드](#개발-가이드)
- [문서](#문서)
- [배포](#배포)

## ✨ 주요 기능

### 트레이딩 봇 관리
- **봇 생성**: DCA(Dollar Cost Averaging) + Martingale 전략 기반 봇 생성
- **AI 진입 타이밍**: 메타 프로핏 AI를 활용한 최적 진입 타이밍 분석
- **실시간 모니터링**: TradingView 차트 통합 및 실시간 시장 데이터
- **포지션 관리**: 자동 포지션 관리 및 리스크 제어

### OKX 거래소 연동
- **API 통합**: OKX REST API 및 WebSocket 실시간 데이터
- **Demo/Production 모드**: 샌드박스 환경에서 안전한 테스트
- **자동 인증**: JWT 기반 토큰 자동 갱신
- **보안**: API 키 암호화 및 서명 생성

### 관리자 기능
- **사용자 관리**: 회원 목록 및 권한 관리
- **제휴 네트워크**: 추천인 계층 구조 시각화
- **수익 통계**: 제휴 수익 및 거래 통계 대시보드
- **거래 내역**: 전체 거래 내역 및 필터링

### 사용자 경험
- **반응형 디자인**: 모바일 최적화 UI
- **다크/라이트 테마**: 사용자 선호 테마 지원
- **한글 지원**: 국내 사용자 맞춤 인터페이스
- **실시간 알림**: 플래시 메시지 및 상태 알림

## 🛠 기술 스택

### Frontend
- **React 18**: 최신 React 기능 활용
- **React Router v7**: SPA 라우팅
- **Jotai**: 경량 상태 관리 라이브러리
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Radix UI**: 접근성 높은 UI 컴포넌트
- **Framer Motion**: 부드러운 애니메이션

### Chart & Visualization
- **TradingView Widget**: 프로페셔널 차트 라이브러리
- **Lightweight Charts**: 경량 차트 솔루션
- **D3.js**: 데이터 시각화
- **Recharts**: React 차트 컴포넌트

### API & Integration
- **Axios**: HTTP 클라이언트
- **CryptoJS**: API 서명 및 암호화
- **WebSocket**: 실시간 데이터 스트리밍

### Development
- **Create React App**: 프로젝트 scaffolding
- **PostCSS**: CSS 전처리
- **Autoprefixer**: 크로스 브라우저 지원

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- npm 또는 yarn
- Git

### 설치

```bash
# 저장소 클론
git clone https://github.com/soonseek/winwin-admin.git
cd winwin-admin

# 의존성 설치
npm install
```

### 환경 설정

프로젝트는 환경 변수를 사용하지 않고, 코드 내에서 demo/production 모드를 전환합니다.

### 개발 서버 실행

```bash
npm start
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

최적화된 빌드가 `build` 폴더에 생성됩니다.

### 테스트 실행

```bash
npm test
```

Jest 테스트 러너가 watch 모드로 실행됩니다.

## 📁 프로젝트 구조

```
winwin-admin/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── BotPanel/      # 봇 생성 관련 컴포넌트
│   │   ├── AuthModal.jsx  # 인증 모달
│   │   ├── Chart.jsx      # TradingView 차트
│   │   ├── Header.jsx     # 헤더 컴포넌트
│   │   └── ...
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── MainPage.jsx   # 메인 페이지 (라우팅, 인증)
│   │   ├── LandingPage.jsx # 랜딩 페이지
│   │   ├── BotManagementPage.jsx # 봇 관리
│   │   ├── AdminPage.jsx  # 관리자 대시보드
│   │   └── ...
│   ├── lib/               # 유틸리티 및 API
│   │   ├── okxApi.js      # OKX API 클라이언트
│   │   ├── okxService.js  # OKX WebSocket 서비스
│   │   ├── okxApiTest.js  # API 테스트 도구
│   │   ├── authUtils.js   # 인증 유틸리티
│   │   └── ...
│   ├── services/          # 비즈니스 로직
│   │   └── userServices.js # 사용자 서비스
│   ├── stores/            # Jotai 상태 관리
│   │   ├── isDemoStore.js # Demo/Production 모드
│   │   └── userAuthStore.js # 사용자 인증 상태
│   ├── router/            # 라우팅 설정
│   │   └── AppRouter.jsx  # React Router 설정
│   ├── layouts/           # 레이아웃 컴포넌트
│   │   └── MainLayout.jsx # 메인 레이아웃
│   ├── App.jsx            # 앱 진입점
│   └── index.js           # ReactDOM 렌더링
├── claudedocs/            # 프로젝트 문서
│   ├── hierarchy_api_client_guide.md
│   ├── OKX_API.md
│   └── ARCHITECTURE.md
├── CLAUDE.md              # Claude Code 가이드
├── package.json
└── tailwind.config.js     # Tailwind 설정
```

## 💻 개발 가이드

### 코드 스타일

- **컴포넌트**: PascalCase (예: `MainPage.jsx`, `AuthModal.jsx`)
- **유틸리티**: camelCase (예: `okxApi.js`, `authUtils.js`)
- **스토어**: camelCase with Store suffix (예: `isDemoStore.js`)

### 상태 관리

Jotai를 사용한 원자적 상태 관리:

```javascript
// stores/isDemoStore.js
import { atom } from 'jotai';

export const isDemoAtom = atom(true);

// 컴포넌트에서 사용
import { useAtom, useAtomValue } from 'jotai';
import { isDemoAtom } from '../stores/isDemoStore';

function MyComponent() {
  const [isDemo, setIsDemo] = useAtom(isDemoAtom);
  // 또는 읽기 전용
  const isDemo = useAtomValue(isDemoAtom);
}
```

### 인증 흐름

1. **로그인**: JWT 토큰을 localStorage에 저장
2. **자동 갱신**: 20분마다 토큰 만료 여부 확인 및 갱신
3. **보안**: 만료 시 자동 로그아웃
4. **OKX API**: 사용자별 API 키 암호화 저장

```javascript
import { getToken, isTokenExpired, refreshToken } from '../lib/authUtils';

// 토큰 확인
const token = getToken();
if (!token || isTokenExpired(token)) {
  // 로그인 필요
}

// 토큰 갱신
const newToken = await refreshToken();
```

### OKX API 사용

```javascript
import OKXApi from '../lib/okxApi';

// API 인스턴스 생성
const okxApi = new OKXApi(apiKey, apiSecret, passphrase, isSandbox);

// 시간 동기화 (필수)
await okxApi.syncTime();

// 계좌 잔고 조회
const balance = await okxApi.getAccountBalance();

// 주문 생성
const order = await okxApi.placeOrder({
  instId: 'BTC-USDT',
  tdMode: 'cash',
  side: 'buy',
  ordType: 'limit',
  sz: '0.01',
  px: '50000'
});
```

자세한 내용은 [OKX API 문서](./claudedocs/OKX_API.md)를 참조하세요.

### 컴포넌트 개발

```jsx
/**
 * 봇 생성 패널 컴포넌트
 *
 * @description DCA + Martingale 전략 봇 생성 UI
 * @param {Object} props
 * @param {Function} props.onBotCreate - 봇 생성 완료 콜백
 */
function BotPanel({ onBotCreate }) {
  // 구현...
}
```

### 테스트

OKX API 테스트 패널: http://localhost:3000/test

```javascript
// src/lib/okxApiTest.js 사용
import OKXApiTester from '../lib/okxApiTest';

const tester = new OKXApiTester(apiKey, apiSecret, passphrase, isSandbox);
await tester.runAllTests();
```

## 📚 문서

- **[아키텍처 가이드](./claudedocs/ARCHITECTURE.md)**: 시스템 아키텍처 및 설계
- **[OKX API 가이드](./claudedocs/OKX_API.md)**: OKX 거래소 API 통합
- **[Hierarchy API 가이드](./claudedocs/hierarchy_api_client_guide.md)**: 제휴 계층 API
- **[CLAUDE.md](./CLAUDE.md)**: Claude Code AI 어시스턴트 가이드

## 🚢 배포

### AWS EC2 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

**Quick Start:**

```bash
# 빌드
npm run build

# PM2로 서빙
npm install -g serve
pm2 start "serve -s build -l 3000" --name react-app
pm2 save

# Nginx 리버스 프록시 설정
sudo nano /etc/nginx/sites-available/react-app

# SSL 인증서 (Let's Encrypt)
sudo certbot --nginx -d megabit-td.com
```

### 배포 업데이트

```bash
cd /var/www/react-app
git pull origin master
npm install
npm run build
pm2 restart react-app
```

## 🤝 기여

프로젝트에 기여하시려면:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 라이선스

This project is private and proprietary.

## 👥 팀

- **개발**: MegaBit Development Team
- **디자인**: MegaBit Design Team
- **PM**: MegaBit Product Team

## 📧 연락처

문의사항이 있으시면 support@megabit-td.com으로 연락 주세요.

---

**Built with ❤️ by MegaBit Team**
