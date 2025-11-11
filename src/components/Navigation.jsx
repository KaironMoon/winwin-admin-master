import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 네비게이션 링크 컴포넌트 (데스크톱)
 */
function NavigationLink({ to, children, user, onShowLoginModal }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // '활성화된 봇' 페이지는 로그인 필요
    if (to === '/bots' && !user) {
      if (onShowLoginModal) {
        onShowLoginModal();
      } else {
        alert('로그인이 필요합니다.');
      }
      return;
    }

    navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * 모바일 네비게이션 링크 컴포넌트
 */
function MobileNavLink({ to, children, user, onShowLoginModal, colorTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    // '활성화된 봇' 페이지는 로그인 필요
    if (to === '/bots' && !user) {
      if (onShowLoginModal) {
        onShowLoginModal();
      } else {
        alert('로그인이 필요합니다.');
      }
      return;
    }

    navigate(to);
  };

  // 색상 테마별 스타일 정의
  const getThemeStyles = () => {
    if (colorTheme === 'broker') {
      return isActive
        ? 'bg-purple-600 text-white'
        : 'text-purple-300 hover:bg-purple-950/30 hover:text-purple-200';
    } else if (colorTheme === 'admin') {
      return isActive
        ? 'bg-red-600 text-white'
        : 'text-red-300 hover:bg-red-950/30 hover:text-red-200';
    } else {
      return isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-gray-300 hover:text-white hover:bg-gray-800';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
        ${getThemeStyles()}
      `}
    >
      {children}
    </button>
  );
}

/**
 * 애플리케이션 네비게이션 컴포넌트
 *
 * 데스크톱과 모바일 네비게이션을 담당합니다.
 */
function Navigation({ user, onShowLoginModal }) {
  return (
    <>
      {/* 데스크톱 네비게이션 */}
      <nav className="fixed top-[51px] left-0 right-0 z-40 hidden md:block bg-black border-b border-gray-800">
        <div className="px-3 py-2">
          <div className="flex space-x-6">
            {/* 브로커 메뉴 */}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/40 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-purple-300 font-semibold">브로커 전용</span>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <NavigationLink to="/broker/revenue" user={user} onShowLoginModal={onShowLoginModal}>
              나의 수익
            </NavigationLink>
            <NavigationLink to="/broker/network" user={user} onShowLoginModal={onShowLoginModal}>
              하위 브로커 정산
            </NavigationLink>

            <div className="h-6 w-px bg-gray-800 mx-2"></div>

            {/* 관리자 메뉴 */}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/40 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-red-300 font-semibold">관리자 전용</span>
              <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
            </div>
            <NavigationLink to="/admin" user={user} onShowLoginModal={onShowLoginModal}>
              시스템 관리
            </NavigationLink>
          </div>
        </div>
      </nav>

      {/* 모바일 네비게이션 */}
      <nav className="fixed top-[90px] sm:top-[88px] left-0 right-0 z-40 md:hidden bg-black border-b border-gray-800">
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-start space-x-2 overflow-x-auto scrollbar-hide">
            {/* 브로커 메뉴 */}
            <MobileNavLink
              to="/broker/revenue"
              user={user}
              onShowLoginModal={onShowLoginModal}
              colorTheme="broker"
            >
              나의 수익
            </MobileNavLink>
            <MobileNavLink
              to="/broker/network"
              user={user}
              onShowLoginModal={onShowLoginModal}
              colorTheme="broker"
            >
              하위브로커 정산
            </MobileNavLink>

            <div className="h-4 w-px bg-gray-800 mx-1"></div>

            {/* 관리자 메뉴 */}
            <MobileNavLink
              to="/admin"
              user={user}
              onShowLoginModal={onShowLoginModal}
              colorTheme="admin"
            >
              시스템 관리
            </MobileNavLink>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
