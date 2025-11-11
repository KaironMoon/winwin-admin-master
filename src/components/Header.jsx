import React from 'react';
import { Sun, Moon, LogIn, LogOut, User } from 'lucide-react';

/**
 * 애플리케이션 헤더 컴포넌트
 *
 * 로고, 사용자 정보, 로그인/로그아웃, 테마 전환 등을 담당합니다.
 */
function Header({
  user,
  isDarkMode,
  onToggleTheme,
  onShowAuthModal,
  onShowMetaProphetModal,
  onLogout
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-black">
      <div className="px-2 sm:px-3 py-1.5 sm:py-2">
        {/* 메인 헤더 라인 */}
        <div className="flex items-center justify-between">
          {/* 로고 영역 */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={() => window.location.href = user ? '/admin' : '/'}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div>
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white">
                  <span className="font-sacheon">MegaBit</span>{' '}
                  <span className="hidden md:inline-block text-xs sm:text-sm text-gray-400">
                    AI Trader
                  </span>
                </h1>
              </div>
            </button>
          </div>

          {/* 우측 액션 영역 */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* META Prophet 버튼 - 모든 사용자에게 표시 */}
            <button
              onClick={onShowMetaProphetModal}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>powered by META Prophet</span>
            </button>

            {/* 사용자 정보 또는 로그인 버튼 */}
            {user ? (
              <>
                {/* 데스크톱에서만 표시 - 한 줄에 모든 요소 */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-white text-sm font-medium">{user.email}</span>
                    <span className="text-xs bg-gray-800 text-gray-300 border border-gray-700 rounded px-2 py-1">
                      관리자
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut size={16} />
                  </button>
                </div>

                {/* 모바일에서만 표시 - 간소화된 버튼 */}
                <div className="flex sm:hidden items-center space-x-1">
                  <button
                    onClick={onLogout}
                    className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-gray-800 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onShowAuthModal}
                className="btn-primary flex items-center px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md sm:rounded-lg"
              >
                <LogIn className="w-4 h-4" />
                <span className="ml-1">로그인</span>
              </button>
            )}

            {/* 테마 전환 버튼 */}
            <button
              onClick={onToggleTheme}
              className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors hidden md:block"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
