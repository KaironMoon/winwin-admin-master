# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Start Development Server
```bash
npm start
```
Runs the React app in development mode on http://localhost:3000

### Build for Production
```bash
npm run build
```
Creates production-ready build in the `build` folder

### Run Tests
```bash
npm test
```
Launches Jest test runner in interactive watch mode

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with React Router v7 for SPA routing
- **State Management**: Jotai for atomic state management (see `src/store/`)
- **UI Framework**: Tailwind CSS + Radix UI components for design system
- **Animation**: Framer Motion for smooth animations and transitions
- **Charts**: TradingView widget integration (see `src/components/Chart.jsx`)
- **API Integration**: OKX exchange API for real-time trading data

### Core Application Structure

**Entry Point**: `src/App.jsx` → `src/pages/MainPage.jsx`
- MainPage handles routing, authentication, and global state
- Supports demo/production mode switching via `isDemoAtom`

**Key Pages**:
- `/` - LandingPage: Marketing site with Korean content for MegaBit AI trading platform
- `/create` - Dashboard: Main trading interface with chart and bot creation
- `/bots` - BotManagementPage: Bot monitoring and management
- `/test` - OKXTestPanel: API testing and debugging interface

**OKX Integration Architecture**:
- `src/lib/okxApi.js` - Core API client with authentication and signature generation
- `src/lib/okxService.js` - WebSocket service for real-time data
- `src/lib/okxApiTest.js` - Testing framework for API functionality
- `src/components/OKXTestPanel.jsx` - UI for API testing and verification

### State Management Pattern
Uses Jotai atoms for reactive state:
- `isDemoStore.js` - Demo mode toggle (affects API endpoints)
- `userAuthStore.js` - User authentication state
- JWT token management with auto-refresh every 20 minutes

### Authentication Flow
1. JWT tokens stored in localStorage with expiration tracking
2. Auto-refresh mechanism prevents session timeouts
3. OKX API credentials stored securely and managed per user
4. Demo/sandbox mode for testing without real funds

### Component Organization
- `src/components/BotPanel/` - Modular bot creation interface components
- `src/components/` - Shared UI components (modals, forms, etc.)
- Component naming follows PascalCase with descriptive suffixes (Modal, Panel, Section)

### Trading Features
- **Chart Integration**: TradingView widgets with OKX data feed
- **Bot Creation**: DCA (Dollar Cost Averaging) + Martingale strategy bots
- **Risk Management**: AI-based entry timing and position sizing
- **Real-time Data**: WebSocket connections for live market data

### Korean Localization
- UI text primarily in Korean for domestic market
- Custom Korean font (SacheonHangGong) defined in Tailwind config
- Responsive design optimized for mobile-first Korean users

### Development Notes
- Uses Create React App (CRA) scaffolding - avoid ejecting
- Tailwind configured with CSS variables for theme switching
- All OKX API calls require proper signature generation and time synchronization
- Demo mode uses sandbox endpoints to prevent real trading

### File Naming Conventions
- React components: PascalCase (e.g., `MainPage.jsx`, `OKXTestPanel.jsx`)
- Utilities/services: camelCase (e.g., `okxApi.js`, `userServices.js`)
- Store files: camelCase with Store suffix (e.g., `isDemoStore.js`)

### Important Implementation Details
- Chart component (Chart.jsx) uses TradingView widgets, requires internet connection
- OKX API signature generation includes timestamp synchronization to prevent auth failures
- Bot creation flow involves multiple stepped components in BotPanel directory
- Authentication state persists across page refreshes using localStorage JWT tokens