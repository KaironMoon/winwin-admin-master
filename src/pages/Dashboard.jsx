import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Chart from '../components/Chart';
import OKXChart from '../components/OKXChart';
import BotPanel from '../components/BotPanel';
import { useAtomValue } from 'jotai';
import { chartTypeAtom } from '../store/chartTypeStore';

function Dashboard({ isDarkMode, user, onShowOKXModal, onLogout, okxConnected, balance, positions = [], orders = [] }) {
  const [currentSymbol, setCurrentSymbol] = useState('BTC/USDT'); // 표시 형식으로 유지
  const chartType = useAtomValue(chartTypeAtom);

  // 데모 모드 여부 확인 (로그인하지 않은 사용자)
  const isDemoMode = !user;

  // 심볼 변경 핸들러
  const handleSymbolChange = (newSymbol) => {
    setCurrentSymbol(newSymbol);
  };



  // USDT 잔고 숫자 추출 함수
  const getUsdtBalance = (balanceData) => {
    // 데모 모드인 경우 가상 잔액 반환
    if (isDemoMode) {
      return 10000;
    }

    if (!balanceData || !balanceData.data || balanceData.data.length === 0) return 0;
    const accountData = balanceData.data[0];
    if (!accountData.details || accountData.details.length === 0) return 0;
    const usdt = accountData.details.find(d => d.ccy === 'USDT');
    if (usdt && usdt.availBal) return parseFloat(usdt.availBal);
    return 0;
  };



  return (
    <div className="min-h-screen bg-background">
      {/* 데모 모드 배너 */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-3 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm font-medium">🎮 데모 모드</span>
            <span className="hidden sm:inline text-xs opacity-90">가상 잔액 $10,000으로 체험해보세요</span>
            <button
                              onClick={() => window.open('https://t.me/megabit-trading', '_blank')}
              className="ml-4 px-3 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-colors flex items-center space-x-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span className="hidden sm:inline">텔레그램으로 얼리버드 문의하기</span>
              <span className="sm:hidden">문의하기</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 메인 컨텐츠 */}
      <main className={`px-3 py-4 ${isDemoMode ? 'pt-12' : ''}`}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* 차트 섹션 - sticky로 변경 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="xl:col-span-2"
          >
            <div className="sticky top-[116px] z-30">
              {chartType === 'okx' ? (
                <OKXChart 
                  symbol={currentSymbol} 
                  isDarkMode={isDarkMode}
                  height="calc(100vh - 228px)"
                  orders={orders}
                  positions={positions}
                />
              ) : (
                <Chart isDarkMode={isDarkMode} symbol={currentSymbol} />
              )}
            </div>
          </motion.div>

          {/* 봇 패널 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="xl:col-span-1"
          >
            <div className="sticky top-[116px] z-30">
              <BotPanel 
                onSymbolChange={handleSymbolChange} 
                balance={getUsdtBalance(balance)} 
                user={user}
                onShowLoginModal={() => window.location.href = '/'}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 