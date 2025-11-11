import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from '../pages/LandingPage';
import BotManagementPage from '../pages/BotManagementPage';
import BrokerRevenuePage from '../pages/BrokerRevenuePage';
import BrokerNetworkPage from '../pages/BrokerNetworkPage';
import BrokerNetworkTreeView from '../pages/BrokerNetworkTreeView';
import AdminPage from '../pages/AdminPage';
import UserListPage from '../pages/UserListPage';
import TransactionListPage from '../pages/TransactionListPage';
import ReferralTreePage from '../pages/ReferralTreePage';
import OKXTestPanel from '../components/OKXTestPanel';

/**
 * 애플리케이션 라우터
 *
 * 모든 라우트 설정을 한 곳에서 관리합니다.
 */
function AppRouter({
  user,
  isDarkMode,
  onShowOKXModal,
  onLogout,
  onShowLoginModal
}) {
  return (
    <Routes>
      {/* 랜딩 페이지 */}
      <Route
        path="/"
        element={<LandingPage onShowLoginModal={onShowLoginModal} />}
      />

      {/* 봇 관리 페이지 */}
      <Route
        path="/bots"
        element={
          <BotManagementPage
            isDarkMode={isDarkMode}
            user={user}
            onShowOKXModal={onShowOKXModal}
            onLogout={onLogout}
            onShowLoginModal={onShowLoginModal}
          />
        }
      />

      {/* OKX 테스트 패널 */}
      <Route
        path="/test"
        element={
          <div className="container mx-auto py-6">
            <OKXTestPanel />
          </div>
        }
      />

      {/* 브로커 - 나의 수익 */}
      <Route
        path="/broker/revenue"
        element={<BrokerRevenuePage />}
      />

      {/* 브로커 - 하위 브로커 정산 (트리뷰) */}
      <Route
        path="/broker/network"
        element={<BrokerNetworkTreeView />}
      />

      {/* 브로커 - 하위 브로커 정산 (v1) */}
      <Route
        path="/broker/network-v1"
        element={<BrokerNetworkPage />}
      />

      {/* 관리자 페이지 */}
      <Route
        path="/admin"
        element={<AdminPage />}
      />

      {/* 사용자 목록 페이지 */}
      <Route
        path="/user-list"
        element={
          <UserListPage
            isDarkMode={isDarkMode}
            user={user}
            onShowOKXModal={onShowOKXModal}
            onLogout={onLogout}
          />
        }
      />

      {/* 거래 목록 페이지 */}
      <Route
        path="/transaction-list"
        element={
          <TransactionListPage
            isDarkMode={isDarkMode}
            user={user}
            onLogout={onLogout}
          />
        }
      />

      {/* 제휴 트리 페이지 */}
      <Route
        path="/referral-tree"
        element={<ReferralTreePage />}
      />
    </Routes>
  );
}

export default AppRouter;
