import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

/**
 * 메인 레이아웃 컴포넌트
 *
 * 헤더, 네비게이션, 그리고 콘텐츠 영역을 포함하는 레이아웃을 제공합니다.
 */
function MainLayout({
  user,
  isDarkMode,
  onToggleTheme,
  onShowAuthModal,
  onShowMetaProphetModal,
  onLogout,
  children
}) {
  const location = useLocation();

  // 헤더/네비게이션을 숨겨야 하는 페이지 확인
  const shouldHideHeader = location.pathname === '/referral-tree';
  const shouldShowNavigation = user && location.pathname !== '/' && location.pathname !== '/referral-tree';

  // 콘텐츠 영역의 패딩 계산
  const getContentPadding = () => {
    if (location.pathname === '/' || location.pathname === '/referral-tree') {
      return 'pt-0';
    } else if (user) {
      return 'pt-[125px] sm:pt-[125px] md:pt-[109px]';
    } else {
      return 'pt-16';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 - 제휴라인 페이지 제외 */}
      {!shouldHideHeader && (
        <Header
          user={user}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          onShowAuthModal={onShowAuthModal}
          onShowMetaProphetModal={onShowMetaProphetModal}
          onLogout={onLogout}
        />
      )}

      {/* 네비게이션 - 로그인한 사용자에게만 표시 (루트 및 제휴라인 페이지 제외) */}
      {shouldShowNavigation && (
        <Navigation
          user={user}
          onShowLoginModal={onShowAuthModal}
        />
      )}

      {/* 메인 콘텐츠 영역 */}
      <main className={getContentPadding()}>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
