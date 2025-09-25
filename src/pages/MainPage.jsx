import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { 
  Wallet,
  Activity,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Link,
  MessageCircle
} from 'lucide-react';
import Dashboard from './Dashboard';
import BotManagementPage from './BotManagementPage';
import LandingPage from './LandingPage';
import BrokerRevenuePage from './BrokerRevenuePage';
import BrokerNetworkPage from './BrokerNetworkPage';
import BrokerNetworkTreeView from './BrokerNetworkTreeView';
import AdminPage from './AdminPage';
import AuthModal from '../components/AuthModal';
import OKXOAuthModal from '../components/OKXOAuthModal';
import OKXConnectModal from '../components/OKXConnectModal';
import OKXTestPanel from '../components/OKXTestPanel';
import MetaProphetModal from '../components/MetaProphetModal';
import okxService from '../lib/okxService';
import UserServices from '../services/userServices';
import { useAtomValue } from 'jotai';
import { isDemoAtom } from '../store/isDemoStore';
import IsDemoView from './components/IsDemoView';


import { getToken, isTokenExpired, isTokenExpiringSoon, refreshToken, logout } from '../lib/authUtils';

function MainPage() {
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showOKXModal, setShowOKXModal] = useState(false);
    const [showOKXConnectModal, setShowOKXConnectModal] = useState(false);
    const [showMetaProphetModal, setShowMetaProphetModal] = useState(false);
    const [user, setUser] = useState(null);
    const [okxConnected, setOkxConnected] = useState(false);
    const [balance, setBalance] = useState(null);
    const [positions, setPositions] = useState([]);
    const [orders, setOrders] = useState([]);
    // fills는 VIP5 이상 필요하므로 제거, orders의 filled 상태로 대체
    const isDemo = useAtomValue(isDemoAtom);
  
    // 현재 라우트에 따른 헤더 top 값 결정
    const getHeaderTopClass = () => {
      if (location.pathname === '/') {
        return 'top-0'; // 루트 라우트에서는 top-0
      } else {
        return !user ? 'top-12' : 'top-0'; // 다른 라우트에서는 기존 로직 유지
      }
    };
  
    // 토큰 갱신 로직
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
    }, [user]);
  
    // 로그인 상태 확인
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
  
            console.log("!!!!!!!isDemoyyy!!!!!!!!", isDemo);
            const userInfo = await UserServices.getUserMe(isDemo);
  
            if (userInfo !== null) {
              // 임시로 브로커 역할 추가 (실제 환경에서는 서버에서 전달받음)
              setUser(userInfo);
              
              // OKX API 키가 있으면 연결 시도
              if (userInfo.okx_api_key && userInfo.okx_api_secret && userInfo.okx_api_passphrase) {
                console.log("!!!!!!!initializeOKXConnection calls!!!!!!!!", isDemo);
                initializeOKXConnection(userInfo);
              } /*else {
                // 테스트 모드 사용
                okxService.setBalanceUpdateHandler((newBalance) => {
                  setBalance(newBalance);
                });
  
                okxService.setConnectionChangeHandler((connected) => {
                  setOkxConnected(connected);
                });
  
                okxService.initializeTestMode();
              }*/
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
    }, []);

    useEffect(() => {
      const token = getToken();
      if (token === null) {
        return;
      }

      if (okxService !== null) {
        UserServices.getUserMe(isDemo).then((userData) => {
          //console.log("!!!!!!!userData!!!!!!!!", userData);
          if (userData === null) {
            return;
          }
          okxService.disconnect();
          okxService.setIsSandbox(isDemo, userData.okx_api_key, userData.okx_api_secret, userData.okx_api_passphrase);
          okxService.connect();
        });
      }
    }, [isDemo]);
  
    // OKX 연결 초기화
    const initializeOKXConnection = async (userData) => {
      try {
        if (okxService === null) {
          return;
        }
        
        // 실제 API 키가 있으면 실제 연결, 없으면 테스트 모드
        if (userData.okx_api_key && userData.okx_api_secret && userData.okx_api_passphrase) {
          //console.log("!!!!!!!initializeOKXConnection!!!!!!!!", isDemo);
          const initialized = okxService.initialize(
            userData.okx_api_key,
            userData.okx_api_secret,
            userData.okx_api_passphrase,
            isDemo
          );
  
          if (initialized) {
            // 전역 OKX API 인스턴스 설정 (차트에서 사용)
            window.okxApi = okxService.api;
            
            // 초기 데모 모드 설정
            if (window.okxApi && window.okxApi.setSandboxMode) {
              window.okxApi.setSandboxMode(isDemo);
            }
            
            // 이벤트 핸들러 설정
            okxService.setBalanceUpdateHandler((newBalance) => {
              setBalance(newBalance);
            });
  
            okxService.setConnectionChangeHandler((connected) => {
              setOkxConnected(connected);
            });
  
            okxService.setPositionUpdateHandler((newPositions) => {
              setPositions(newPositions);
            });
  
            okxService.setOrderUpdateHandler((newOrders) => {
              setOrders(prevOrders => {
                // 기존 주문 목록에서 업데이트된 주문들을 찾아서 교체
                const updatedOrders = [...prevOrders];
                newOrders.forEach(newOrder => {
                  const existingIndex = updatedOrders.findIndex(order => order.ordId === newOrder.ordId);
                  if (existingIndex >= 0) {
                    updatedOrders[existingIndex] = newOrder;
                  } else {
                    updatedOrders.push(newOrder);
                  }
                });
                return updatedOrders;
              });
            });
  
            // fills는 VIP5 이상 필요하므로 제거됨
  
            // 연결 시작
            await okxService.connect();
          } else {
            setOkxConnected(false);
          }
        } /*else {
          
          // 테스트 모드 사용
          okxService.setBalanceUpdateHandler((newBalance) => {
            setBalance(newBalance);
          });
  
          okxService.setConnectionChangeHandler((connected) => {
            setOkxConnected(connected);
          });
  
          okxService.setPositionUpdateHandler((newPositions) => {
            setPositions(newPositions);
          });
  
          okxService.setOrderUpdateHandler((newOrders) => {
            setOrders([]);
          });
  
          // fills 핸들러 제거됨
  
          okxService.initializeTestMode();
        }*/ 
      } catch (error) {
        setOkxConnected(false);
      }
    };
  
    // 컴포넌트 언마운트 시 연결 해제
    useEffect(() => {
      return () => {
        okxService.disconnect();
      };
    }, []);

    // isDemoAtom 변경 시 okxApi의 sandbox 모드 동기화
    useEffect(() => {
      if (window.okxApi && window.okxApi.setSandboxMode) {
        console.log('isDemoAtom 변경됨:', isDemo, '→ okxApi.isSandbox 업데이트');
        window.okxApi.setSandboxMode(isDemo);
      }
    }, [isDemo]);
  
    const toggleTheme = () => {
      setIsDarkMode(!isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    };
  
    // 초기 테마 설정
    React.useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, [isDarkMode]);
  
    const handleLogin = async (userData) => {
      try {
        // 로그인 후 사용자 정보를 API에서 다시 가져오기
        const token = getToken();
        if (token) {
          console.log("!!!!!!!isDemoxxx!!!!!!!!", isDemo);
          const userInfo = await UserServices.getUserMe(isDemo);
  
          if (userInfo !== null) {
            // 임시로 브로커 역할 추가 (실제 환경에서는 서버에서 전달받음)
            setUser(userInfo);
            
            // OKX API 키가 있으면 실제 연결, 없으면 테스트 모드
            if (userInfo.okx_api_key && userInfo.okx_api_secret && userInfo.okx_api_passphrase) {
              initializeOKXConnection(userInfo);
            } 
            /*
            else {
              // 테스트 모드 사용
              okxService.setBalanceUpdateHandler((newBalance) => {
                setBalance(newBalance);
              });
  
              okxService.setConnectionChangeHandler((connected) => {
                setOkxConnected(connected);
              });
  
              okxService.setPositionUpdateHandler((newPositions) => {
                setPositions(newPositions);
              });
  
              okxService.setOrderUpdateHandler((newOrders) => {
                setOrders([]);
              });
  
              // fills 핸들러 제거됨
  
              okxService.initializeTestMode();
            }
            */
          } else {
            setUser(userData); // 기본 사용자 정보라도 설정
          }
        } else {
          setUser(userData); // 기본 사용자 정보라도 설정
        }
        
        // 로그인 후 /create 페이지로 리디렉션
        window.location.href = '/create';
      } catch (error) {
        setUser(userData); // 기본 사용자 정보라도 설정
        // 로그인 후 /create 페이지로 리디렉션
        window.location.href = '/create';
      }
    };
  
    const handleLogout = () => {
      logout();
      setUser(null);
      setOkxConnected(false);
      setBalance(null);
      okxService.disconnect();
    };
  
    const handleOKXSuccess = async (okxAccount) => {
      try {
        // OKX 연동 후 사용자 정보를 API에서 다시 가져오기
        const token = getToken();
        if (token) {
          console.log("!!!!!!!isDemozzz!!!!!!!!", isDemo);
          const userInfo = await UserServices.getUserMe(isDemo);
  
          if (userInfo !== null) {
            // 임시로 브로커 역할 추가 (실제 환경에서는 서버에서 전달받음)
            setUser(userInfo);
            
            // OKX 연결 초기화
            if (userInfo.okx_api_key && userInfo.okx_api_secret && userInfo.okx_api_passphrase) {
              initializeOKXConnection(userInfo);
            }
          }
        }
      } catch (error) {
        // 에러 처리
      }
    };
  
    // 잔액 표시 포맷팅 - Equity(순자산) 표시
    const formatBalance = (balanceData) => {
      if (!balanceData || !balanceData.data || balanceData.data.length === 0) {
        return '$0.00';
      }
  
      const accountData = balanceData.data[0];
      
      // details가 없으면 기본값 반환
      if (!accountData.details || accountData.details.length === 0) {
        return '$0.00';
      }
  
      // 1. USDT의 eq (순자산) 표시
      const usdtBalance = accountData.details.find(d => d.ccy === 'USDT');
      if (usdtBalance && usdtBalance.eq) {
        const amount = parseFloat(usdtBalance.eq);
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
  
      // 2. 첫 번째 사용 가능한 equity 표시 (다른 통화)
      const firstBalance = accountData.details.find(d => d.eq && parseFloat(d.eq) > 0);
      if (firstBalance) {
        const amount = parseFloat(firstBalance.eq);
        return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${firstBalance.ccy}`;
      }
  
      return '$0.00';
    };
  
    return (
      <div className="min-h-screen bg-background">
          {/* 헤더 - fixed로 변경 */}
          <header className={`fixed left-0 right-0 z-[60] border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 ${getHeaderTopClass()}`}>
            <div className="px-2 sm:px-3 py-1.5 sm:py-2">
              {/* 메인 헤더 라인 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <button 
                    onClick={() => window.location.href = user ? '/create' : '/'}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                                        <div>
                        <h1 className="text-base sm:text-xl md:text-2xl font-bold text-foreground">
                          <span className="font-sacheon">MegaBit</span> <span className="hidden md:inline-block text-xs sm:text-sm text-muted-foreground">AI Trader</span>
                        </h1>
                      </div>
                  </button>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                  {/* META Prophet 버튼 - 모든 사용자에게 표시 */}
                  <button
                    onClick={() => setShowMetaProphetModal(true)}
                    className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm font-medium shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>powered by META Prophet</span>
                  </button>
                  
                  <IsDemoView />
                  
                  {/* 로그인한 사용자에게만 표시되는 요소들 */}
                  {user && (
                    <>
                      <div className={`flex items-center space-x-2 ${okxConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <Activity size={16} />
                        <span className="text-sm">{okxConnected ? 'OKX 연결됨' : 'OKX 연결 안됨'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wallet size={16} className="text-primary" />
                        <span className="text-foreground text-sm font-medium">
                          {balance ? formatBalance(balance) : '$0.00'}
                        </span>
                      </div>
                    </>
                  )}

                  {/* 사용자 정보 또는 로그인 버튼 */}
                  {user ? (
                    <>
                      {/* 데스크톱에서만 표시 - 한 줄에 모든 요소 */}
                      <div className="hidden sm:flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-primary" />
                          <span className="text-foreground text-sm font-medium">{user.email}</span>
                          {/* 임시 역할 변경 드롭다운 */}
                          <select 
                            value={user.role || 'user'} 
                            onChange={(e) => setUser({...user, role: e.target.value})}
                            className="text-xs bg-accent text-foreground border border-border rounded px-2 py-1"
                          >
                            <option value="user">사용자</option>
                            <option value="broker">브로커</option>
                            <option value="admin">관리자</option>
                          </select>
                        </div>
                        
                        <button
                          onClick={() => setShowOKXModal(true)}
                          className="btn-secondary flex items-center space-x-2 px-3 py-2 text-sm"
                          title="OKX 계정 연동"
                        >
                          <Link size={14} />
                          <span>OKX 계정 연동</span>
                        </button>
                        
                        <button
                          onClick={() => setShowOKXConnectModal(true)}
                          className="btn-secondary flex items-center space-x-2 px-3 py-2 text-sm"
                          title="OKX 계정 직접 연결"
                        >
                          <Link size={14} />
                          <span>OKX 계정 직접 연결</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="btn-ghost p-2 rounded-md hover:bg-accent"
                          title="로그아웃"
                        >
                          <LogOut size={16} />
                        </button>
                      </div>
                      
                      {/* 모바일에서만 표시 - 간소화된 버튼 */}
                      <div className="flex sm:hidden items-center space-x-1">
                        <button
                          onClick={handleLogout}
                          className="btn-ghost p-1.5 rounded-md hover:bg-accent"
                          title="로그아웃"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {/* 가입 신청 버튼 */}
                      <button
                        onClick={() => window.open('https://t.me/winwin_bot', '_blank')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium shadow hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center"
                        title="가입 신청"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="ml-1">가입 신청</span>
                      </button>
                      {/* 로그인 버튼 */}
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="btn-primary flex items-center px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md sm:rounded-lg"
                      >
                        <LogIn className="w-4 h-4" />
                        <span className="ml-1">로그인</span>
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={toggleTheme}
                    className="btn-ghost p-2 rounded-md hidden md:block"
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              </div>
              
              {/* 모바일에서 로그인한 사용자를 위한 두 번째 줄 */}
              {user && (
                <div className="sm:hidden flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  {/* 왼쪽: 사용자 정보와 역할 선택 */}
                  <div className="flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs font-medium truncate max-w-[120px]">{user.email}</span>
                    <select 
                      value={user.role || 'user'} 
                      onChange={(e) => setUser({...user, role: e.target.value})}
                      className="text-[11px] bg-accent text-foreground border border-border rounded px-1 py-0.5 font-medium"
                    >
                      <option value="user">사용자</option>
                      <option value="broker">브로커</option>
                      <option value="admin">관리자</option>
                    </select>
                  </div>
                  
                  {/* 오른쪽: OKX 연동 버튼들 */}
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground mr-1">OKX:</span>
                    <button
                      onClick={() => setShowOKXModal(true)}
                      className="btn-secondary flex items-center space-x-1 px-2 py-1 text-xs rounded-md"
                      title="OKX 계정 OAuth 연동"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>OAuth</span>
                    </button>
                    <button
                      onClick={() => setShowOKXConnectModal(true)}
                      className="btn-secondary flex items-center space-x-1 px-2 py-1 text-xs rounded-md"
                      title="OKX API 키 직접 입력"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>API키</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>
  
          {/* 네비게이션 - 로그인한 사용자에게만 표시 (루트 라우트 제외) */}
          {user && location.pathname !== '/' && (
            <>
              {/* 데스크톱 네비게이션 */}
              <nav className="fixed top-[56px] left-0 right-0 z-40 hidden md:block border-b bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/40">
                <div className="px-3 py-2">
                  <div className="flex space-x-6">
                    {/* 기본 메뉴 */}
                    <NavigationLink to="/create" user={user} onShowLoginModal={() => setShowAuthModal(true)}>만들기</NavigationLink>
                    <NavigationLink to="/bots" user={user} onShowLoginModal={() => setShowAuthModal(true)}>목록</NavigationLink>
                    
                    {/* 브로커 전용 메뉴 */}
                    {(user?.role === 'broker' || user?.role === 'admin') && (
                      <>
                        <div className="h-6 w-px bg-border mx-2"></div>
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200/30 rounded-lg px-3 py-1.5">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-purple-700 font-semibold">브로커 전용</span>
                          <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                        <NavigationLink to="/broker/revenue" user={user} onShowLoginModal={() => setShowAuthModal(true)}>나의 수익</NavigationLink>
                        <NavigationLink to="/broker/network" user={user} onShowLoginModal={() => setShowAuthModal(true)}>하위 브로커 정산</NavigationLink>
                      </>
                    )}
                    
                    {/* 관리자 전용 메뉴 */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="h-6 w-px bg-border mx-2"></div>
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200/30 rounded-lg px-3 py-1.5">
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-red-700 font-semibold">관리자 전용</span>
                          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                        <NavigationLink to="/admin" user={user} onShowLoginModal={() => setShowAuthModal(true)}>시스템 관리</NavigationLink>
                      </>
                    )}
                  </div>
                </div>
              </nav>

              {/* 모바일 네비게이션 */}
              <nav className="fixed top-[90px] sm:top-[88px] left-0 right-0 z-40 md:hidden border-b bg-card/95 backdrop-blur">
                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-start space-x-2 overflow-x-auto scrollbar-hide">
                    {/* 기본 메뉴 */}
                    <MobileNavLink to="/create" user={user} onShowLoginModal={() => setShowAuthModal(true)}>만들기</MobileNavLink>
                    <MobileNavLink to="/bots" user={user} onShowLoginModal={() => setShowAuthModal(true)}>목록</MobileNavLink>
                    
                    {/* 브로커 전용 메뉴 */}
                    {(user?.role === 'broker' || user?.role === 'admin') && (
                      <>
                        <div className="h-4 w-px bg-border mx-1"></div>
                        <MobileNavLink to="/broker/revenue" user={user} onShowLoginModal={() => setShowAuthModal(true)} colorTheme="broker">
                          나의 수익
                        </MobileNavLink>
                        <MobileNavLink to="/broker/network" user={user} onShowLoginModal={() => setShowAuthModal(true)} colorTheme="broker">
                          하위브로커 정산
                        </MobileNavLink>
                      </>
                    )}
                    
                    {/* 관리자 전용 메뉴 */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="h-4 w-px bg-border mx-1"></div>
                        <MobileNavLink to="/admin" user={user} onShowLoginModal={() => setShowAuthModal(true)} colorTheme="admin">
                          시스템 관리
                        </MobileNavLink>
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </>
          )}
  
          {/* 메인 콘텐츠 - 라우트와 로그인 상태에 따라 패딩 조정 */}
          <main className={
            location.pathname === '/' 
              ? "pt-0" 
              : (user 
                  ? "pt-[125px] sm:pt-[125px] md:pt-[109px]"  // 모바일: header(90px) + nav(35px), sm: header(88px) + nav(37px), 데스크톱: header(56px) + nav(53px)
                  : "pt-[68px]")
          }>
            {/* 라우트 */}
            <Routes>
              <Route 
                path="/" 
                element={<LandingPage onShowLoginModal={() => setShowAuthModal(true)} />}
              />
              <Route 
                path="/create" 
                element={
                  <Dashboard 
                    isDarkMode={isDarkMode}
                    user={user}
                    onShowOKXModal={() => setShowOKXModal(true)}
                    onLogout={handleLogout}
                    okxConnected={okxConnected}
                    balance={balance}
                    positions={positions}
                    orders={orders}
                  />
                } 
              />
              <Route 
                path="/bots" 
                element={
                  <BotManagementPage
                    isDarkMode={isDarkMode}
                    user={user}
                    onShowOKXModal={() => setShowOKXModal(true)}
                    onLogout={handleLogout}
                    okxConnected={okxConnected}
                    balance={balance}
                    positions={positions}
                    orders={orders}
                    onShowLoginModal={() => setShowAuthModal(true)}
                  />
                } 
              />
              <Route 
                path="/test" 
                element={
                  <div className="container mx-auto py-6">
                    <OKXTestPanel />
                  </div>
                } 
              />
              <Route 
                path="/broker/revenue" 
                element={<BrokerRevenuePage />} 
              />
              <Route
                path="/broker/network"
                element={<BrokerNetworkTreeView />}
              />
              <Route
                path="/broker/network-v1"
                element={<BrokerNetworkPage />}
              />
              <Route 
                path="/admin" 
                element={<AdminPage />} 
              />
            </Routes>
          </main>
  
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
        </div>
    );
  }
  
  // 네비게이션 링크 컴포넌트
  function NavigationLink({ to, children, onClick, user, onShowLoginModal }) {
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
      if (onClick) onClick();
    };
  
    return (
      <button
        onClick={handleClick}
        className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {children}
      </button>
    );
  }

  // 모바일 네비게이션 링크 컴포넌트
  function MobileNavLink({ to, children, onClick, user, onShowLoginModal, colorTheme }) {
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
      if (onClick) onClick();
    };
    
    // 색상 테마별 스타일 정의
    const getThemeStyles = () => {
      if (colorTheme === 'broker') {
        return isActive 
          ? 'bg-purple-600 text-white' 
          : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30';
      } else if (colorTheme === 'admin') {
        return isActive 
          ? 'bg-red-600 text-white' 
          : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30';
      } else {
        return isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent';
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

  export default MainPage;