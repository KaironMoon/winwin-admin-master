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
  TrendingDown
} from 'lucide-react';
import AdminTabNav from '../components/AdminTabNav';

/**
 * 거래정보 페이지
 *
 * 사용자들의 거래 내역을 조회하고 관리합니다.
 */
function TransactionListPage({ isDarkMode, user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 검색 상태
  const [searchType, setSearchType] = useState('user_id');
  const [searchText, setSearchText] = useState('');

  // 거래 목록 조회 (현재는 Mock 데이터)
  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: 실제 API 연동 필요
      // const response = await TransactionServices.getListByPage(...)

      // Mock 데이터
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션

      const mockData = [
        {
          id: 1,
          user_id: '73319188496085',
          symbol: 'BTC-USDT',
          type: 'BUY',
          amount: 0.5,
          price: 45000,
          total: 22500,
          fee: 11.25,
          status: 'completed',
          created_at: '2025-07-21T10:30:00'
        },
        {
          id: 2,
          user_id: '73313373309171',
          symbol: 'ETH-USDT',
          type: 'SELL',
          amount: 2.0,
          price: 3200,
          total: 6400,
          fee: 3.2,
          status: 'completed',
          created_at: '2025-07-21T11:45:00'
        },
        // 더 많은 Mock 데이터...
      ];

      setTransactions(mockData);
      setTotalCount(mockData.length);
      setTotalPages(Math.ceil(mockData.length / pageSize));
    } catch (err) {
      console.error('거래 목록 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTransactions();
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 컴포넌트 마운트 시 거래 목록 조회
  useEffect(() => {
    loadTransactions();
  }, [currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/admin'}
                className="btn-ghost p-2 rounded-md hover:bg-accent"
                title="관리자 페이지로 돌아가기"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">거래 관리</h1>
                <p className="text-muted-foreground text-sm">거래 정보 및 내역 관리</p>
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
        {/* 거래 목록 */}
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
                  <h3 className="text-lg font-semibold text-foreground">거래 목록</h3>
                  <p className="text-muted-foreground text-sm">사용자들의 거래 내역을 조회합니다</p>
                </div>

                {/* 검색 폼 */}
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-3 py-1.5 border border-input rounded-md bg-background text-foreground text-sm"
                  >
                    <option value="user_id">사용자 ID</option>
                    <option value="symbol">심볼</option>
                    <option value="type">거래유형</option>
                  </select>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="검색어 입력"
                    className="px-3 py-1.5 border border-input rounded-md bg-background text-foreground text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </form>
              </div>
              {/* 관리자 페이지 탭 네비게이션 (전체/사용자정보/거래정보) */}
              <AdminTabNav />
            </div>

            {/* 거래 목록 테이블 */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground">
                  로딩 중...
                </div>
              ) : error ? (
                <div className="p-12 text-center text-red-500">
                  {error}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">거래 ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">사용자 ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">심볼</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">거래유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">수량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">가격</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">총액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">수수료</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">거래일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/50">
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-foreground">{tx.id}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-foreground">{tx.user_id}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-foreground">{tx.symbol}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-1">
                            {tx.type === 'BUY' ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">매수</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">매도</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-foreground">{tx.amount}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-foreground">${tx.price.toLocaleString()}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-foreground">${tx.total.toLocaleString()}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-muted-foreground">${tx.fee.toFixed(2)}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {tx.status === 'completed' ? '완료' : '대기'}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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
                총 {totalCount}건 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}건 표시
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
                      const page = i + 1;
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

export default TransactionListPage;
