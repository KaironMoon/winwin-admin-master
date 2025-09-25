import React, { useState } from 'react';
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
  Server
} from 'lucide-react';

function AdminPage({ isDarkMode, user, onShowOKXModal, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', name: '사용자 관리', icon: Users },
    { id: 'system', name: '시스템 상태', icon: Server },
    { id: 'logs', name: '로그', icon: Database },
    { id: 'security', name: '보안', icon: Shield }
  ];

  const mockUsers = [
    { id: 1, name: '관리자', email: 'admin@example.com', level: 'super_admin', status: 'active', lastLogin: '2024-01-15 14:30:00' },
    { id: 2, name: '일반 사용자', email: 'user@example.com', level: 'user', status: 'active', lastLogin: '2024-01-15 12:20:00' },
    { id: 3, name: '테스트 사용자', email: 'test@example.com', level: 'user', status: 'inactive', lastLogin: '2024-01-14 09:15:00' },
  ];

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
    { id: 4, level: 'INFO', message: '봇 거래 실행', timestamp: '2024-01-15 14:15:00', user: 'bot' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('/')}
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
                    <span className="text-foreground text-sm font-medium">{user.name}</span>
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
                <h3 className="text-lg font-semibold text-foreground">사용자 관리</h3>
                <p className="text-muted-foreground text-sm">시스템 사용자 목록 및 관리</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">사용자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">레벨</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">마지막 로그인</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.level === 'super_admin'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : user.level === 'admin'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {user.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {user.status === 'active' ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.lastLogin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-primary hover:text-primary/80 mr-2">편집</button>
                          <button className="text-red-600 hover:text-red-800">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">로그인 시도 제한</span>
                    <input type="number" className="w-20 px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm" defaultValue="5" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold text-foreground mb-4">보안 이벤트</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <AlertCircle size={16} className="text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">로그인 실패</p>
                      <p className="text-xs text-muted-foreground">2024-01-15 14:25:00 - admin@example.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">API 키 만료</p>
                      <p className="text-xs text-muted-foreground">2024-01-15 13:45:00 - OKX API</p>
                    </div>
                  </div>
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
    </div>
  );
}

export default AdminPage; 