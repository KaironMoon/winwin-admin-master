import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  User,
  LogOut,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  Shield,
  Database,
  Server,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import UserServices from '../services/userServices';

function AdminPage({ isDarkMode, user, onShowOKXModal, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // 기본값을 20으로 변경
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 검색 상태
  const [searchType, setSearchType] = useState('email');
  const [searchText, setSearchText] = useState('');

  // 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const tabs = [
    { id: 'users', name: '사용자 관리', icon: Users },
    { id: 'system', name: '시스템 상태', icon: Server },
    { id: 'logs', name: '로그', icon: Database },
    { id: 'security', name: '보안', icon: Shield }
  ];

  // 사용자 목록 조회
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserServices.getListByPage(
        searchType,
        searchText,
        currentPage,
        pageSize
      );

      if (response.ok) {
        const data = await response.json();
        console.log('API 응답 데이터:', data);

        // users와 count를 포함한 객체로 오는 경우 처리
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          setTotalCount(data.count || data.users.length);
          setTotalPages(Math.ceil((data.count || data.users.length) / pageSize));
        }
        // 배열로 직접 오는 경우 처리 (이전 버전 호환)
        else if (Array.isArray(data)) {
          setUsers(data);
          setTotalCount(data.length);
          setTotalPages(Math.ceil(data.length / pageSize));
        } else {
          // 다른 형식의 객체로 오는 경우
          setUsers(data.data || []);
          setTotalCount(data.totalCount || data.total || 0);
          setTotalPages(Math.ceil((data.totalCount || data.total || 0) / pageSize));
        }
      } else {
        throw new Error('사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('사용자 목록 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 수정
  const handleEditUser = async (userData) => {
    try {
      const response = await UserServices.putUser(selectedUser.id, userData);
      if (response.ok) {
        alert('사용자 정보가 수정되었습니다.');
        setEditModalOpen(false);
        loadUsers(); // 목록 새로고침
      } else {
        throw new Error('사용자 정보 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('사용자 수정 실패:', err);
      alert(err.message);
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async () => {
    try {
      const response = await UserServices.deleteUser(selectedUser.id);
      if (response.ok) {
        alert('사용자가 삭제되었습니다.');
        setDeleteModalOpen(false);
        loadUsers(); // 목록 새로고침
      } else {
        throw new Error('사용자 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('사용자 삭제 실패:', err);
      alert(err.message);
    }
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // 검색 시 첫 페이지로
    loadUsers();
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 컴포넌트 마운트 시 사용자 목록 조회
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [currentPage, pageSize, activeTab]);

  // Mock 데이터 (시스템 상태, 로그 등)
  const mockSystemStatus = [
    { name: '데이터베이스', status: 'healthy', uptime: '99.9%', response: '15ms' },
    { name: 'API 서버', status: 'healthy', uptime: '99.8%', response: '45ms' },
    { name: 'Redis 캐시', status: 'warning', uptime: '95.2%', response: '120ms' },
    { name: 'OKX API', status: 'healthy', uptime: '99.5%', response: '200ms' },
  ];

  const mockLogs = [
    { id: 1, level: 'INFO', message: '사용자 로그인 성공', timestamp: '2024-01-15 14:30:00', user: 'admin@example.com' },
    { id: 2, level: 'WARNING', message: 'API 응답 시간 지연', timestamp: '2024-01-15 14:25:00', user: 'system' },
    { id: 3, level: 'ERROR', message: '데이터베이스 연결 실패', timestamp: '2024-01-15 14:20:00', user: 'system' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/'}
                className="btn-ghost p-2 rounded-md hover:bg-accent"
                title="대시보드로 돌아가기"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">관리자 페이지</h1>
                <p className="text-muted-foreground text-sm">시스템 관리 및 모니터링</p>
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
        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* 탭 컨텐츠 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'users' && (
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">사용자 관리</h3>
                    <p className="text-muted-foreground text-sm">시스템 사용자 목록 및 관리</p>
                  </div>

                  {/* 검색 폼 */}
                  <form onSubmit={handleSearch} className="flex space-x-2">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="px-3 py-1.5 border border-input rounded-md bg-background text-foreground text-sm"
                    >
                      <option value="email">이메일</option>
                      <option value="name">이름</option>
                      <option value="level">레벨</option>
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
              </div>

              {/* 사용자 목록 테이블 */}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">이름</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">이메일</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">레벨</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">마지막 로그인</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{user.name || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.level === 'admin'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {user.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {user.is_active ? '활성' : '비활성'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {user.last_logged_at ? new Date(user.last_logged_at).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setEditModalOpen(true);
                              }}
                              className="text-primary hover:text-primary/80 mr-3"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
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
                        setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로 이동
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
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSystemStatus.map((service, index) => (
                <div key={index} className="bg-card rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'healthy' ? 'bg-green-500' :
                      service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      <span className={`text-sm font-medium ${
                        service.status === 'healthy' ? 'text-green-600' :
                        service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {service.status === 'healthy' ? '정상' :
                         service.status === 'warning' ? '경고' : '오류'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">가동률:</span>
                      <span className="text-sm font-medium text-foreground">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">응답시간:</span>
                      <span className="text-sm font-medium text-foreground">{service.response}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-foreground">시스템 로그</h3>
                <p className="text-muted-foreground text-sm">최근 시스템 로그를 확인하세요</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">레벨</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">메시지</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">사용자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{log.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.level === 'ERROR' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{log.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{log.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold text-foreground mb-4">보안 설정</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">2단계 인증</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">IP 화이트리스트</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">세션 타임아웃</span>
                    <select className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm">
                      <option>30분</option>
                      <option>1시간</option>
                      <option>24시간</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold text-foreground mb-4">보안 이벤트</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <CheckCircle size={16} className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">보안 업데이트 완료</p>
                      <p className="text-xs text-muted-foreground">2024-01-15 12:30:00 - 시스템</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* 사용자 수정 모달 */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">사용자 정보 수정</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                level: formData.get('level'),
                is_active: formData.get('is_active') === 'true'
              };
              // 비밀번호가 입력된 경우에만 포함
              const password = formData.get('password');
              if (password) {
                userData.password = password;
              }
              handleEditUser(userData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">이름</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedUser.name}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">이메일</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    새 비밀번호
                    <span className="text-xs text-muted-foreground ml-2">(변경 시에만 입력)</span>
                  </label>
                  <input
                    type="text"
                    name="password"
                    placeholder="비밀번호를 변경하려면 입력하세요"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">레벨</label>
                  <select
                    name="level"
                    defaultValue={selectedUser.level}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="user">일반 사용자</option>
                    <option value="broker">브로커</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">상태</label>
                  <select
                    name="is_active"
                    defaultValue={selectedUser.is_active ? 'true' : 'false'}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="true">활성</option>
                    <option value="false">비활성</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-input rounded-md hover:bg-accent"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 사용자 삭제 확인 모달 */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">사용자 삭제 확인</h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-foreground mb-6">
              정말로 <strong>{selectedUser.email}</strong> 사용자를 삭제하시겠습니까?
              <br />
              <span className="text-sm text-muted-foreground">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-input rounded-md hover:bg-accent"
              >
                취소
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;