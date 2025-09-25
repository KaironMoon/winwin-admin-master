import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Calendar, Loader2, RefreshCw, AlertCircle, History, Edit, X, Save } from 'lucide-react';
import config from '../config';

const BrokerNetworkTreeView = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('03');
  const [hierarchyData, setHierarchyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [maxDepth] = useState(10); // Removed setMaxDepth - not used // 10단계까지 표시
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [newRate, setNewRate] = useState('');

  // 년도 및 월 옵션
  const years = ['2024', '2023', '2022'];
  const months = [
    { value: '01', label: '1월' },
    { value: '02', label: '2월' },
    { value: '03', label: '3월' },
    { value: '04', label: '4월' },
    { value: '05', label: '5월' },
    { value: '06', label: '6월' },
    { value: '07', label: '7월' },
    { value: '08', label: '8월' },
    { value: '09', label: '9월' },
    { value: '10', label: '10월' },
    { value: '11', label: '11월' },
    { value: '12', label: '12월' }
  ];

  // API 호출
  const fetchHierarchyTree = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokenDataStr = localStorage.getItem('tokenData');
      const userInfoStr = localStorage.getItem('userInfo');

      let token = null;
      if (tokenDataStr) {
        const tokenData = JSON.parse(tokenDataStr);
        token = tokenData.token;
      }

      if (!token || !userInfoStr) {
        throw new Error('로그인이 필요합니다.');
      }

      const endpoint = `${config.API_BASE_URL}/api/hierarchy/my-tree?max_depth=${maxDepth}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(`계층 트리를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      setHierarchyData(data);

      // 초기에 모든 노드 확장
      const allExpanded = new Set(['root']);
      const collectNodeIds = (node, parentPath = '') => {
        const currentPath = parentPath ? `${parentPath}/${node.user?.id}` : node.user?.id;
        if (currentPath) allExpanded.add(currentPath);
        if (node.children) {
          node.children.forEach(child => collectNodeIds(child, currentPath));
        }
      };
      if (data) collectNodeIds(data);
      setExpandedNodes(allExpanded);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchyTree();
  }, []);

  // 노드 토글
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // 요율 변경 모달 열기
  const handleEditRate = (node, currentRate, level) => {
    if (level > 0 && level <= 4) { // L1~L4 브로커만 수정 가능
      setSelectedBroker({
        name: node.user?.name || '익명',
        id: node.user?.id,
        level: level,
        currentRate: currentRate
      });
      setNewRate(currentRate || '');
      setShowRateModal(true);
    }
  };

  // 요율 업데이트
  const handleRateUpdate = () => {
    console.log(`${selectedBroker.name}의 요율을 ${newRate}로 변경`);
    // TODO: API 호출하여 실제 변경
    setShowRateModal(false);
    setSelectedBroker(null);
  };

  // 레벨별 색상 - Commented out to fix lint warnings
  /* const getLevelColor = (level) => {
    const colors = [
      { bg: 'bg-purple-600', text: 'text-purple-200', border: 'border-purple-500' },
      { bg: 'bg-purple-500', text: 'text-purple-200', border: 'border-purple-400' },
      { bg: 'bg-blue-500', text: 'text-blue-200', border: 'border-blue-400' },
      { bg: 'bg-violet-500', text: 'text-violet-200', border: 'border-violet-400' },
      { bg: 'bg-pink-500', text: 'text-pink-200', border: 'border-pink-400' },
      { bg: 'bg-green-500', text: 'text-green-200', border: 'border-green-400' }
    ];
    return colors[Math.min(level, colors.length - 1)];
  }; */

  // 트리 노드 컴포넌트 - 원본 스타일
  const TreeNode = ({ node, level = 0, isLast = false, parentPath = '' }) => {
    const hasChildren = node.children && node.children.length > 0;
    const nodeId = parentPath ? `${parentPath}/${node.user?.id}` : node.user?.id || 'root';
    const isExpanded = expandedNodes.has(nodeId);

    // 레벨별 색상 - 10단계까지 지원
    const getNodeStyle = () => {
      switch(level) {
        case 0: return { bg: '#8B5CF6', label: 'ROOT', labelBg: 'bg-gradient-to-r from-blue-500 to-purple-600' };
        case 1: return { bg: '#A855F7', label: 'L1' };
        case 2: return { bg: '#3B82F6', label: 'L2' };
        case 3: return { bg: '#8B5CF6', label: 'L3' };
        case 4: return { bg: '#EC4899', label: 'L4' };
        case 5: return { bg: '#10B981', label: 'L5' };
        case 6: return { bg: '#F59E0B', label: 'L6' };
        case 7: return { bg: '#EF4444', label: 'L7' };
        case 8: return { bg: '#14B8A6', label: 'L8' };
        case 9: return { bg: '#F97316', label: 'L9' };
        case 10: return { bg: '#06B6D4', label: 'L10' };
        default: return { bg: '#6B7280', label: `L${level}` };
      }
    };

    const nodeStyle = getNodeStyle();

    // 모의 데이터
    const revenue = node.stats?.total_revenue
      ? `₩${node.stats.total_revenue.toLocaleString()}`
      : level === 0 ? '₩15,080,000' : `₩${Math.floor(Math.random() * 5000000 + 1000000).toLocaleString()}`;

    const rate = level < 11 ? ['0.02%', '0.015%', '0.012%', '0.008%', '0.006%', '0.005%', '0.004%', '0.003%', '0.002%', '0.001%', '0.001%'][level] : null;
    const orders = node.stats?.total_referrals || Math.floor(Math.random() * 500 + 50);

    const indent = level * 36; // 더 큰 들여쓰기

    return (
      <div className="relative">
        {/* 노드 컨텐츠 - 두 줄 구성 (더 크게) */}
        <div
          className="relative py-2 hover:bg-gray-700/20 cursor-pointer transition-colors"
          onClick={() => hasChildren && toggleNode(nodeId)}
          style={{ paddingLeft: `${indent + 8}px` }}
        >

          {/* 첫 번째 줄: 아이콘, 이름, 레벨 */}
          <div className="flex items-center">
            {/* 확장/축소 아이콘 */}
            <div className="w-5 h-5 mr-2 flex items-center justify-center flex-shrink-0">
              {hasChildren ? (
                isExpanded ? (
                  <span className="text-gray-400 text-sm">▼</span>
                ) : (
                  <span className="text-gray-400 text-sm">▶</span>
                )
              ) : (
                <span className="text-gray-500 text-xs">●</span>
              )}
            </div>

            {/* 아이콘 원 - 더 크게 */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 relative flex-shrink-0 shadow-lg"
              style={{ backgroundColor: nodeStyle.bg }}
            >
              {node.user?.name?.charAt(0) || '?'}
              {/* 직접 추천 수 배지 */}
              {node.user?.direct_referral_count > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-orange-500 rounded-full flex items-center justify-center shadow-md"
                     style={{ fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                  {node.user.direct_referral_count}
                </div>
              )}
            </div>

            {/* 이름 - 더 크게 */}
            <span className="text-gray-100 text-base font-semibold mr-3 whitespace-nowrap">
              {node.user?.name || '익명'}
            </span>

            {/* 레벨 배지 - 더 크게 */}
            {level === 0 ? (
              <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded shadow-md"
                    style={{ fontSize: '12px' }}>
                ROOT
              </span>
            ) : (
              <span
                className="px-2 py-1 text-white font-bold rounded shadow-md"
                style={{ backgroundColor: nodeStyle.bg, fontSize: '12px' }}
              >
                {nodeStyle.label}
              </span>
            )}

            {/* 편집 버튼 - L1~L4 브로커만 표시 */}
            {level > 0 && level <= 4 && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 노드 토글 방지
                  handleEditRate(node, rate, level);
                }}
                className="ml-3 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors group"
                title="요율 변경"
              >
                <Edit className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </button>
            )}
          </div>

          {/* 두 번째 줄: 통계 정보 - 더 크게 */}
          <div className="flex items-center mt-1" style={{ paddingLeft: '47px' }}>
            <div className="flex items-center gap-4">
              {rate && (
                <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  요율: <span style={{ color: '#FCD34D', fontWeight: '500' }}>{rate}</span>
                </span>
              )}
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
                수익: <span style={{ color: '#4ADE80', fontWeight: '500' }}>{revenue}</span>
              </span>
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
                주문: <span style={{ color: '#60A5FA', fontWeight: '500' }}>{orders}건</span>
              </span>
            </div>
          </div>
        </div>

        {/* 자식 노드들 */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {node.children.map((child, index) => (
              <TreeNode
                key={child.user?.id || index}
                node={child}
                level={level + 1}
                isLast={index === node.children.length - 1}
                parentPath={nodeId}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 상단 써머리 계산
  const calculateSummary = () => {
    if (!hierarchyData) {
      return {
        incomingSettlement: '₩0',
        outgoingSettlement: '₩0',
        netProfit: '₩0'
      };
    }

    const totalRevenue = hierarchyData.stats?.total_revenue || 15080000;
    const directRevenue = totalRevenue * 0.7;
    const payoutRevenue = totalRevenue * 0.5;
    const netProfit = directRevenue - payoutRevenue;

    return {
      incomingSettlement: `₩${directRevenue.toLocaleString()}`,
      outgoingSettlement: `₩${payoutRevenue.toLocaleString()}`,
      netProfit: `₩${netProfit.toLocaleString()}`
    };
  };

  const summary = calculateSummary();

  // 감사 로그 데이터
  const auditLogs = [
    { id: 1, broker: '김대리', oldRate: '0.010%', newRate: '0.015%', changedBy: '관리자', date: '2024-03-20 14:30' },
    { id: 2, broker: '서차장', oldRate: '0.008%', newRate: '0.012%', changedBy: '김대리', date: '2024-03-19 09:15' },
    { id: 3, broker: '홍팀장', oldRate: '0.006%', newRate: '0.009%', changedBy: '서차장', date: '2024-03-18 16:45' },
    { id: 4, broker: '김사원', oldRate: '0.004%', newRate: '0.006%', changedBy: '홍팀장', date: '2024-03-17 11:20' },
    { id: 5, broker: '박과장', oldRate: '0.015%', newRate: '0.018%', changedBy: '관리자', date: '2024-03-16 13:50' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">브로커 네트워크</h1>
          <p className="text-gray-400">하위 브로커 네트워크 트리뷰</p>
        </div>

        {/* 년/월 선택 */}
        <div className="mb-6 flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <Calendar className="text-gray-400" size={20} />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">조회 기간:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 상단 써머리 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">받을 정산금</p>
                <p className="text-2xl font-bold">{summary.incomingSettlement}</p>
              </div>
              <TrendingUp className="text-blue-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">지급할 정산금</p>
                <p className="text-2xl font-bold">{summary.outgoingSettlement}</p>
              </div>
              <DollarSign className="text-purple-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">순 수익</p>
                <p className="text-2xl font-bold">{summary.netProfit}</p>
              </div>
              <Users className="text-green-200" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 트리뷰 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-850 rounded-lg border border-gray-700 shadow-lg" style={{ backgroundColor: '#1a1d29' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">브로커 네트워크</h2>
                <button
                  onClick={fetchHierarchyTree}
                  disabled={loading}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="py-3 px-2 overflow-x-auto" style={{ backgroundColor: '#262937' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={fetchHierarchyTree}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <RefreshCw className="mr-2 inline" size={16} />
                      다시 시도
                    </button>
                  </div>
                ) : hierarchyData ? (
                  <div className="min-w-max">
                    <TreeNode
                      node={hierarchyData}
                      level={0}
                      isLast={true}
                      parentPath=""
                      linePositions={[]}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 감사 로그 */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-700 shadow-lg" style={{ backgroundColor: '#1a1d29' }}>
              <div className="px-5 py-3 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <History className="mr-2" size={18} />
                  감사 로그
                </h2>
              </div>

              <div className="p-4" style={{ backgroundColor: '#262937' }}>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border border-gray-600 rounded-lg p-3 bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-white">{log.broker}</span>
                        <span className="text-xs text-gray-400">{log.date}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="text-red-400">{log.oldRate}</span>
                        <span className="mx-1">→</span>
                        <span className="text-green-400">{log.newRate}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        변경자: {log.changedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 정산 요율 변경 모달 */}
        {showRateModal && selectedBroker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">정산 요율 변경</h3>
                <button
                  onClick={() => setShowRateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    브로커: {selectedBroker.name} ({selectedBroker.level === 1 ? 'L1' : selectedBroker.level === 2 ? 'L2' : selectedBroker.level === 3 ? 'L3' : 'L4'})
                  </label>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    현재 요율: {selectedBroker.currentRate}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    새 요율
                  </label>
                  <input
                    type="text"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                    placeholder="예: 0.02%"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleRateUpdate}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Save size={16} className="mr-2" />
                    저장
                  </button>
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="flex-1 bg-gray-600 text-gray-300 py-2 px-4 rounded-md hover:bg-gray-500 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerNetworkTreeView;