import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  User,
  LogOut,
  ArrowLeft,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import TransactionServices from '../services/transactionServices';
import UserServices from '../services/userServices';

/**
 * 하위 추천인 거래정보 페이지
 *
 * 특정 사용자의 하위 추천인들의 거래 요약 정보를 조회하고 관리합니다.
 */
function ReferralTransactionListPage({ isDarkMode, user, onLogout }) {
  const [userId, setUserId] = useState(null);
  const [usersSummary, setUsersSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 검색 상태
  const [searchText, setSearchText] = useState('');

  // 메모 편집 상태
  const [editingMemo, setEditingMemo] = useState({}); // { userId: memoText }
  const [savingMemo, setSavingMemo] = useState({}); // { userId: boolean }

  // URL에서 user_id 파라미터 추출
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('user_id');
    if (id) {
      setUserId(parseInt(id));
    } else {
      setError('사용자 ID가 제공되지 않았습니다.');
    }
  }, []);

  // 하위 추천인 거래 요약 목록 조회
  const loadReferralsSummary = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await TransactionServices.getReferralsTradingSummary(
        userId,
        searchText,
        currentPage,
        pageSize
      );

      setUsersSummary(response.items || []);
      setTotalCount(response.total || 0);
      setTotalPages(response.total_pages || 0);
    } catch (err) {
      console.error('하위 추천인 거래 요약 조회 실패:', err);
      setError(err.response?.data?.detail || err.message || '데이터 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadReferralsSummary();
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // userId가 설정되면 데이터 조회
  useEffect(() => {
    if (userId) {
      loadReferralsSummary();
    }
  }, [userId, currentPage, pageSize]);

  // ROE 색상 결정
  const getRoeColor = (roe) => {
    const roeNum = parseFloat(roe);
    if (roeNum > 0) return 'text-green-600 dark:text-green-400';
    if (roeNum < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  // PnL 색상 결정
  const getPnlColor = (pnl) => {
    const pnlNum = parseFloat(pnl);
    if (pnlNum > 0) return 'text-green-600';
    if (pnlNum < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  // 메모 저장
  const handleSaveMemo = async (userId, memo) => {
    setSavingMemo(prev => ({ ...prev, [userId]: true }));
    try {
      await UserServices.updateAdminMemo(userId, memo);
      // 목록 새로고침
      await loadReferralsSummary();
      // 편집 상태 초기화
      setEditingMemo(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } catch (err) {
      console.error('메모 저장 실패:', err);
      alert('메모 저장에 실패했습니다.');
    } finally {
      setSavingMemo(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.close()}
                className="btn-ghost p-2 rounded-md hover:bg-accent"
                title="닫기"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">하위 추천인 거래 정보</h1>
                <p className="text-muted-foreground text-sm">제휴라인별 거래 정보 및 봇 활동 현황</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Activity size={16} />
                <span className="text-sm">연결됨</span>
              </div>

              {/* 사용자 정보 */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-primary" />
                    <span className="text-foreground text-sm font-medium">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="btn-ghost p-2 rounded-md hover:bg-accent"
                    title="로그아웃"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="px-3 py-4">
        {/* 하위 추천인 거래 요약 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">하위 추천인 거래 요약</h3>
                  <p className="text-muted-foreground text-sm">사용자별 활성 봇 및 수익률 정보</p>
                </div>

                {/* 검색 폼 */}
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="사용자 UID, 닉네임 검색"
                    className="px-3 py-1.5 border border-input rounded-md bg-background text-foreground text-sm min-w-[250px]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </form>
              </div>
            </div>

            {/* 하위 추천인 거래 요약 테이블 */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground">
                  로딩 중...
                </div>
              ) : error ? (
                <div className="p-12 text-center text-red-500">
                  {error}
                </div>
              ) : usersSummary.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  조회된 데이터가 없습니다.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        membrs UID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        nick-name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        trading wallet $
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider" colSpan="5">
                        ai-bot active
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        bot-total
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        ROE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersSummary.map((summary) => (
                      <tr key={summary.user_id} className="hover:bg-muted/50">
                        {/* 사용자 UID + 메모 */}
                        <td className="px-4 py-3 text-sm text-foreground font-mono">
                          <div className="flex flex-col space-y-1">
                            {/* UID */}
                            <div className="whitespace-nowrap">{summary.user_uid}</div>

                            {/* 메모 */}
                            {editingMemo[summary.user_id] !== undefined ? (
                              // 편집 모드
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editingMemo[summary.user_id]}
                                  onChange={(e) => setEditingMemo(prev => ({
                                    ...prev,
                                    [summary.user_id]: e.target.value
                                  }))}
                                  placeholder="메모 입력"
                                  className="px-2 py-1 text-xs border border-input rounded bg-background min-w-[150px]"
                                  disabled={savingMemo[summary.user_id]}
                                />
                                <button
                                  onClick={() => handleSaveMemo(summary.user_id, editingMemo[summary.user_id])}
                                  disabled={savingMemo[summary.user_id]}
                                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                                >
                                  {savingMemo[summary.user_id] ? '저장중...' : '저장'}
                                </button>
                                <button
                                  onClick={() => setEditingMemo(prev => {
                                    const newState = { ...prev };
                                    delete newState[summary.user_id];
                                    return newState;
                                  })}
                                  disabled={savingMemo[summary.user_id]}
                                  className="px-2 py-1 text-xs border border-input rounded hover:bg-accent disabled:opacity-50"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              // 표시 모드
                              <div
                                onClick={() => setEditingMemo(prev => ({
                                  ...prev,
                                  [summary.user_id]: summary.admin_memo || ''
                                }))}
                                className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                              >
                                {summary.admin_memo || '메모추가 (선택사항)'}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 닉네임 */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground font-medium">
                          {summary.nickname}
                        </td>

                        {/* 거래 지갑 잔액 */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                          <div className="flex items-center space-x-1">
                            <DollarSign size={14} className="text-green-600" />
                            <span className="font-semibold">
                              {parseFloat(summary.trading_wallet_balance).toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2
                              })} USDT
                            </span>
                          </div>
                        </td>

                        {/* 활성 봇 정보 (최대 5개 표시) */}
                        {[...Array(5)].map((_, index) => {
                          const bot = summary.active_bots[index];
                          return (
                            <td key={index} className="px-2 py-3 text-center text-xs">
                              {bot ? (
                                <div className="flex flex-col items-center space-y-1">
                                  {/* 심볼/방향 */}
                                  <div className="flex items-center space-x-1">
                                    {bot.direction === 'long' ? (
                                      <TrendingUp size={12} className="text-green-600" />
                                    ) : (
                                      <TrendingDown size={12} className="text-red-600" />
                                    )}
                                    <span className="font-medium">
                                      {bot.symbol}
                                    </span>
                                  </div>
                                  {/* 수익률 */}
                                  <span className={`text-xs font-semibold ${getPnlColor(bot.pnl_percentage)}`}>
                                    {parseFloat(bot.pnl_percentage) >= 0 ? '+' : ''}
                                    {parseFloat(bot.pnl_percentage).toFixed(2)}%
                                  </span>
                                  {/* 전략 */}
                                  <span className="text-[10px] text-muted-foreground">
                                    {bot.strategy}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          );
                        })}

                        {/* 총 봇 개수 */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-primary/10 text-primary font-semibold text-sm">
                            ({summary.total_active_bots})
                          </div>
                        </td>

                        {/* 총 ROE */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className={`text-lg font-bold ${getRoeColor(summary.total_roe)}`}>
                            {parseFloat(summary.total_roe) >= 0 ? '+' : ''}
                            {parseFloat(summary.total_roe).toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 페이지네이션 */}
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                총 {totalCount}명 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}명 표시
              </div>
              <div className="flex items-center space-x-4">
                {/* 페이지 네비게이션 */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-md text-sm ${
                            page === currentPage
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* 페이지당 표시 개수 선택 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">페이지당</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize = parseInt(e.target.value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-input rounded-md bg-background text-foreground text-sm"
                  >
                    <option value="10">10개</option>
                    <option value="20">20개</option>
                    <option value="50">50개</option>
                    <option value="100">100개</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default ReferralTransactionListPage;
