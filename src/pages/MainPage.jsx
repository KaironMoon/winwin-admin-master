import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';

// Stores
import { isDemoAtom } from '../stores/isDemoStore';

// Services
import UserServices from '../services/userServices';
import { getToken, isTokenExpired, isTokenExpiringSoon, refreshToken, logout } from '../lib/authUtils';

// Layout & Router
import MainLayout from '../layouts/MainLayout';
import AppRouter from '../router/AppRouter';

// Modals
import AuthModal from '../components/AuthModal';
import OKXOAuthModal from '../components/OKXOAuthModal';
import OKXConnectModal from '../components/OKXConnectModal';
import MetaProphetModal from '../components/MetaProphetModal';

/**
 * 메인 페이지 컴포넌트
 *
 * 애플리케이션의 최상위 컨테이너로서, 다음을 담당합니다:
 * - 사용자 인증 상태 관리
 * - JWT 토큰 자동 갱신
 * - 전역 모달 관리
 * - 테마 설정
 */
function MainPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOKXModal, setShowOKXModal] = useState(false);
  const [showOKXConnectModal, setShowOKXConnectModal] = useState(false);
  const [showMetaProphetModal, setShowMetaProphetModal] = useState(false);
  const [user, setUser] = useState(null);
  const isDemo = useAtomValue(isDemoAtom);

  /**
   * JWT 토큰 자동 갱신
   * 20분마다 토큰 만료 여부를 확인하고 갱신 시도
   */
  useEffect(() => {
    let interval = null;

    const startTokenRefresh = () => {
      // 기존 인터벌이 있으면 제거
      if (interval) {
        clearInterval(interval);
      }

      // 20분마다 토큰 갱신 시도 (30분 만료 전에 갱신)
      interval = setInterval(async () => {
        const token = getToken();
        if (token) {
          // 토큰이 곧 만료될 예정이거나 이미 만료된 경우 갱신 시도
          if (isTokenExpiringSoon() || isTokenExpired()) {
            try {
              await refreshToken();
              // 토큰 갱신 후 권한 재검증
              const userInfo = await UserServices.getUserMe(isDemo);
              if (userInfo) {
                setUser(userInfo);
              }
            } catch (error) {
              console.error('자동 토큰 갱신 실패:', error);
              // 갱신 실패 시 로그아웃 처리
              handleLogout();
            }
          }
        }
      }, 20 * 60 * 1000); // 20분
    };

    // 사용자가 로그인되어 있으면 토큰 갱신 시작
    if (user) {
      startTokenRefresh();
    }

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user, isDemo]);

  /**
   * 로그인 상태 확인 및 복원
   * 페이지 로드 시 localStorage의 토큰을 확인하여 사용자 정보를 가져옴
   */
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = getToken();
        if (token) {
          // 토큰이 곧 만료될 예정이면 갱신 시도
          if (isTokenExpiringSoon()) {
            try {
              await refreshToken();
            } catch (error) {
              console.error('초기 토큰 갱신 실패:', error);
              logout();
              return;
            }
          }

          const userInfo = await UserServices.getUserMe(isDemo);

          if (userInfo !== null) {
            setUser(userInfo);
          } else {
            // 토큰이 유효하지 않으면 제거
            logout();
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        logout();
      }
    };

    fetchUserInfo();
  }, [isDemo]);

  /**
   * 테마 전환 핸들러
   */
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  /**
   * 초기 테마 설정
   */
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * 로그인 성공 핸들러
   */
  const handleLogin = async (userData) => {
    try {
      // 로그인 후 사용자 정보를 API에서 다시 가져오기
      const token = getToken();
      if (token) {
        const userInfo = await UserServices.getUserMe(isDemo);

        if (userInfo !== null) {
          setUser(userInfo);
          // 로그인 후 /admin 페이지로 리디렉션
          window.location.href = '/admin';
        } else {
          setUser(userData); // 기본 사용자 정보라도 설정
        }
      } else {
        setUser(userData); // 기본 사용자 정보라도 설정
      }
    } catch (error) {
      if (error.message === 'UNAUTHORIZED_ACCESS') {
        alert('관리자 권한이 필요합니다.\n관리자 계정으로 다시 로그인해주세요.');
        logout();
        setUser(null);
      }
      console.error('로그인 실패:', error);
      // 로그아웃 처리
      logout();
      setUser(null);
    }
  };

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/';
  };

  /**
   * OKX 연동 성공 핸들러
   */
  const handleOKXSuccess = async (okxAccount) => {
    try {
      // OKX 연동 후 사용자 정보를 API에서 다시 가져오기
      const token = getToken();
      if (token) {
        const userInfo = await UserServices.getUserMe(isDemo);

        if (userInfo !== null) {
          setUser(userInfo);
        }
      }
    } catch (error) {
      console.error('OKX 연동 후 사용자 정보 갱신 실패:', error);
    }
  };

  return (
    <>
      {/* 메인 레이아웃 */}
      <MainLayout
        user={user}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onShowAuthModal={() => setShowAuthModal(true)}
        onShowMetaProphetModal={() => setShowMetaProphetModal(true)}
        onLogout={handleLogout}
      >
        {/* 라우터 */}
        <AppRouter
          user={user}
          isDarkMode={isDarkMode}
          onShowOKXModal={() => setShowOKXModal(true)}
          onLogout={handleLogout}
          onShowLoginModal={() => setShowAuthModal(true)}
        />
      </MainLayout>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      {/* OKX OAuth 연동 모달 */}
      <OKXOAuthModal
        isOpen={showOKXModal}
        onClose={() => setShowOKXModal(false)}
        onSuccess={handleOKXSuccess}
      />

      {/* OKX Connect 모달 */}
      <OKXConnectModal
        isOpen={showOKXConnectModal}
        onClose={() => setShowOKXConnectModal(false)}
        onSuccess={handleOKXSuccess}
      />

      {/* MetaProphet 모달 */}
      <MetaProphetModal
        isOpen={showMetaProphetModal}
        onClose={() => setShowMetaProphetModal(false)}
      />
    </>
  );
}

export default MainPage;

