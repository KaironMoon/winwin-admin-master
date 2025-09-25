import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Users, X, Save, History, ChevronRight, ChevronDown, Calendar, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import config from '../config';

const BrokerNetworkPage = () => {
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [newRate, setNewRate] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('03');
  const [hierarchyData, setHierarchyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [userInfo, setUserInfo] = useState(null);
  const [maxDepth] = useState(5); // 최대 깊이 설정

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

  // API 호출 함수: 계층 트리 가져오기
  const fetchHierarchyTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // localStorage에서 사용자 정보와 토큰 가져오기
      const tokenDataStr = localStorage.getItem('tokenData');
      const userInfoStr = localStorage.getItem('userInfo');

      let token = null;
      try {
        if (tokenDataStr) {
          const tokenData = JSON.parse(tokenDataStr);
          token = tokenData.token;
        }
      } catch (error) {
        console.error('Error parsing tokenData:', error);
      }

      console.log('🔍 Token exists:', !!token);
      console.log('🔍 UserInfo:', userInfoStr);

      if (!token || !userInfoStr) {
        throw new Error('로그인이 필요합니다.');
      }

      const currentUser = JSON.parse(userInfoStr);
      // setUserInfo(currentUser); // Commented out - userInfo not used
      console.log('👤 Current User:', currentUser.name, currentUser.email);

      // API 엔드포인트 설정
      const endpoint = `${config.API_BASE_URL}/api/hierarchy/my-tree?max_depth=${maxDepth}`;
      console.log('🌐 API Endpoint:', endpoint);

      // 계층 트리 API 호출
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response:', errorText);
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(`계층 트리를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Hierarchy Tree Data:', data);
      setHierarchyData(data);

    } catch (err) {
      console.error('❌ Error fetching hierarchy tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [maxDepth]);

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    fetchHierarchyTree();
  }, [fetchHierarchyTree]);

  // 상단 써머리 데이터 (실제 데이터로 계산)
  const calculateSummary = () => {
    if (!hierarchyData) {
      return {
        incomingSettlement: '₩0',
        outgoingSettlement: '₩0',
        netProfit: '₩0'
      };
    }

    // 실제 데이터 기반 계산 (stats에서 가져옴)
    const totalRevenue = hierarchyData.stats?.total_revenue || 0;
    const directRevenue = totalRevenue * 0.7; // 받을 정산금 (예시)
    const payoutRevenue = totalRevenue * 0.5; // 지급할 정산금 (예시)
    const netProfit = directRevenue - payoutRevenue;

    return {
      incomingSettlement: `₩${directRevenue.toLocaleString()}`,
      outgoingSettlement: `₩${payoutRevenue.toLocaleString()}`,
      netProfit: `₩${netProfit.toLocaleString()}`
    };
  };

  const summary = calculateSummary();

  // 35건에 맞는 주문 데이터 생성 함수
  /*
  const generateOrderDetails = (count) => {
    const symbols = ['BTC-USDT-SWAP', 'ETH-USDT-SWAP', 'SOL-USDT-SWAP', 'DOGE-USDT-SWAP', 'ADA-USDT-SWAP', 'XRP-USDT-SWAP', 'BNB-USDT-SWAP', 'MATIC-USDT-SWAP', 'LTC-USDT-SWAP', 'LINK-USDT-SWAP', 'DOT-USDT-SWAP', 'AVAX-USDT-SWAP', 'UNI-USDT-SWAP', 'ATOM-USDT-SWAP', 'FTM-USDT-SWAP'];
    const sides = ['long', 'short'];
    const leverages = ['10x', '15x', '20x', '25x', '30x'];
    
    const orders = [];
    for (let i = 0; i < count; i++) {
      const isProfit = Math.random() > 0.3; // 70% 확률로 수익
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const size = (Math.random() * 100).toFixed(2);
      const leverage = leverages[Math.floor(Math.random() * leverages.length)];
      const pnl = isProfit 
        ? `+₩${(Math.random() * 50000 + 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
        : `-₩${(Math.random() * 10000 + 500).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
      
      const day = Math.floor(Math.random() * 28) + 1;
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const date = `2024-03-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      orders.push({
        id: i + 1,
        date,
        symbol,
        side,
        size,
        leverage,
        pnl
      });
    }
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  */

  // 브로커 네트워크 데이터 (5뎁스 구조) - Commented out to fix lint warnings
  /* const networkData = {
    me: {
      id: 'me',
      name: '나 (총 브로커)',
      rate: '0.02%',
      revenue: '₩15,080,000'
    },
    brokers: [
      {
        id: 'broker1',
        name: '김대리',
        rate: '0.015%',
        revenue: '₩3,450,000',
        totalOrders: 1265,
        level: 1,
        subBrokers: [
          {
            id: 'sub1_1',
            name: '서차장',
            rate: '0.012%',
            revenue: '₩1,200,000',
            totalOrders: 456,
            level: 2,
            subBrokers: [
              {
                id: 'sub1_1_1',
                name: '홍팀장',
                rate: '0.009%',
                revenue: '₩580,000',
                totalOrders: 234,
                level: 3,
                subBrokers: [
                  {
                    id: 'sub1_1_1_1',
                    name: '김사원',
                    rate: '0.006%',
                    revenue: '₩250,000',
                    totalOrders: 95,
                    level: 4,
                    members: [
                      { 
                        id: 'member1_1_1_1_1', 
                        name: '고객A', 
                        revenue: '₩80,000', 
                        orders: 35,
                        orderDetails: generateOrderDetails(35)
                      },
                      { 
                        id: 'member1_1_1_1_2', 
                        name: '고객B', 
                        revenue: '₩65,000', 
                        orders: 28,
                        orderDetails: generateOrderDetails(28)
                      },
                      { 
                        id: 'member1_1_1_1_3', 
                        name: '고객C', 
                        revenue: '₩75,000', 
                        orders: 32,
                        orderDetails: generateOrderDetails(32)
                      }
                    ]
                  }
                ],
                members: [
                  { 
                    id: 'member1_2_1_1', 
                    name: '송고객', 
                    revenue: '₩90,000', 
                    orders: 42,
                    orderDetails: generateOrderDetails(42)
                  },
                  { 
                    id: 'member1_2_1_2', 
                    name: '한고객', 
                    revenue: '₩85,000', 
                    orders: 39,
                    orderDetails: generateOrderDetails(39)
                  },
                  { 
                    id: 'member1_2_1_3', 
                    name: '임고객', 
                    revenue: '₩95,000', 
                    orders: 44,
                    orderDetails: generateOrderDetails(44)
                  },
                  { 
                    id: 'member1_2_1_4', 
                    name: '배고객', 
                    revenue: '₩80,000', 
                    orders: 36,
                    orderDetails: generateOrderDetails(36)
                  }
                ]
              }
            ]
          }
        ],
        members: [
          { id: 'member1_1', name: '이고객', revenue: '₩120,000', orders: 55, orderDetails: generateOrderDetails(55) },
          { id: 'member1_2', name: '박고객', revenue: '₩95,000', orders: 42, orderDetails: generateOrderDetails(42) },
          { id: 'member1_3', name: '최고객', revenue: '₩110,000', orders: 48, orderDetails: generateOrderDetails(48) }
        ]
      },
      {
        id: 'broker2',
        name: '박과장',
        rate: '0.018%',
        revenue: '₩2,890,000',
        totalOrders: 987,
        level: 1,
        members: [
          { id: 'member2_1', name: '정고객', revenue: '₩140,000', orders: 62, orderDetails: generateOrderDetails(62) },
          { id: 'member2_2', name: '강고객', revenue: '₩125,000', orders: 58, orderDetails: generateOrderDetails(58) },
          { id: 'member2_3', name: '조고객', revenue: '₩135,000', orders: 61, orderDetails: generateOrderDetails(61) }
        ]
      }
    ]
  }; */

  // 브로커 선택 핸들러 - Commented out to fix lint warnings
  /* const handleBrokerClick = (broker) => {
    setSelectedBroker(broker);
    setNewRate(broker.rate);
    setShowRateModal(true);
  }; */

  // 멤버 주문 상세 토글 - Commented out to fix lint warnings
  /* const toggleMemberOrders = (memberId) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  }; */

  // 레벨별 스타일 설정 - Commented out to fix lint warnings
  /* const getLevelStyle = (level) => {
    const styles = {
      1: { color: 'from-purple-500 to-purple-700', size: 'w-8 h-8', textSize: 'text-sm' },
      2: { color: 'from-indigo-500 to-indigo-700', size: 'w-7 h-7', textSize: 'text-sm' },
      3: { color: 'from-violet-500 to-violet-700', size: 'w-6 h-6', textSize: 'text-xs' },
      4: { color: 'from-pink-500 to-pink-700', size: 'w-6 h-6', textSize: 'text-xs' },
      5: { color: 'from-rose-500 to-rose-700', size: 'w-5 h-5', textSize: 'text-xs' }
    };
    return styles[level] || styles[5];
  }; */

  // 트리 높이 계산 함수 - Commented out to fix lint warnings
  /* const calculateTreeHeight = (broker) => {
    let height = 60; // 기본 브로커 높이

    if (broker.members && broker.members.length > 0) {
      broker.members.forEach(member => {
        height += 60; // 멤버 기본 높이
        if (expandedMembers.has(member.id) && member.orderDetails) {
          height += member.orderDetails.length * 35; // 주문당 35px
        }
      });
    }

    if (broker.subBrokers && broker.subBrokers.length > 0) {
      broker.subBrokers.forEach(subBroker => {
        height += calculateTreeHeight(subBroker) + 20;
      });
    }

    return height;
  }; */

  // 정산 요율 업데이트
  const handleRateUpdate = () => {
    console.log(`${selectedBroker.name}의 요율을 ${newRate}로 변경`);
    setShowRateModal(false);
    setSelectedBroker(null);
  };

  // 감사 로그 데이터
  const auditLogs = [
    { id: 1, broker: '김대리', oldRate: '0.010%', newRate: '0.015%', changedBy: '관리자', date: '2024-03-20 14:30' },
    { id: 2, broker: '서차장', oldRate: '0.008%', newRate: '0.012%', changedBy: '김대리', date: '2024-03-19 09:15' },
    { id: 3, broker: '홍팀장', oldRate: '0.006%', newRate: '0.009%', changedBy: '서차장', date: '2024-03-18 16:45' },
    { id: 4, broker: '김사원', oldRate: '0.004%', newRate: '0.006%', changedBy: '홍팀장', date: '2024-03-17 11:20' },
    { id: 5, broker: '박과장', oldRate: '0.015%', newRate: '0.018%', changedBy: '관리자', date: '2024-03-16 13:50' }
  ];

  // 재귀적 노드 렌더링 컴포넌트 - 모던 디자인
  const HierarchyNode = ({ node, level = 1, isLast = false, parentRef = null }) => {
    const nodeRef = React.useRef(null);
    const [isExpanded, setIsExpanded] = useState(true);

    // React Hook은 조건부 return 전에 호출되어야 함
    React.useEffect(() => {
      // 부모와 현재 노드 연결선 그리기
      if (parentRef && nodeRef.current && level > 1) {
        // const parent = parentRef.current; // Commented out - unused
        // const current = nodeRef.current; // Commented out - unused
        // const parentRect = parent.getBoundingClientRect(); // Commented out - unused
        // const currentRect = current.getBoundingClientRect(); // Commented out - unused

        // 여기서 연결선을 그릴 수 있지만, CSS로 처리하는 것이 더 간단
      }
    }, [parentRef, level]);

    if (!node) return null;

    const hasChildren = node.children && node.children.length > 0;

    // 레벨별 색상 및 스타일 - 더 세련된 색상
    const getLevelColor = () => {
      switch(level) {
        case 1: return {
          gradient: 'from-purple-600 to-indigo-600',
          border: 'border-purple-500/30',
          bg: 'bg-purple-500/10',
          icon: 'bg-gradient-to-br from-purple-500 to-purple-700',
          label: 'bg-purple-500',
          text: 'text-purple-300'
        };
        case 2: return {
          gradient: 'from-blue-600 to-cyan-600',
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          icon: 'bg-gradient-to-br from-blue-500 to-blue-700',
          label: 'bg-blue-500',
          text: 'text-blue-300'
        };
        case 3: return {
          gradient: 'from-violet-600 to-purple-600',
          border: 'border-violet-500/30',
          bg: 'bg-violet-500/10',
          icon: 'bg-gradient-to-br from-violet-500 to-violet-700',
          label: 'bg-violet-500',
          text: 'text-violet-300'
        };
        case 4: return {
          gradient: 'from-pink-600 to-rose-600',
          border: 'border-pink-500/30',
          bg: 'bg-pink-500/10',
          icon: 'bg-gradient-to-br from-pink-500 to-pink-700',
          label: 'bg-pink-500',
          text: 'text-pink-300'
        };
        default: return {
          gradient: 'from-emerald-600 to-green-600',
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          icon: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
          label: 'bg-emerald-500',
          text: 'text-emerald-300'
        };
      }
    };

    const levelStyle = getLevelColor();

    // 모의 수익 데이터 생성 (실제 데이터가 없을 경우)
    const getRevenueData = () => {
      if (node.stats?.total_revenue) {
        return `₩${node.stats.total_revenue.toLocaleString()}`;
      }
      // 레벨별 기본 수익
      const revenues = {
        1: Math.floor(Math.random() * 5000000) + 3000000,
        2: Math.floor(Math.random() * 2000000) + 1000000,
        3: Math.floor(Math.random() * 1000000) + 500000,
        4: Math.floor(Math.random() * 500000) + 200000,
        5: Math.floor(Math.random() * 200000) + 50000
      };
      return `₩${(revenues[level] || 80000).toLocaleString()}`;
    };

    // 모의 요율 데이터
    const getRateData = () => {
      const rates = {
        1: '0.015%',
        2: '0.012%',
        3: '0.008%',
        4: '0.006%',
        5: null
      };
      return rates[level];
    };

    const revenue = getRevenueData();
    const rate = getRateData();

    return (
      <div className="relative" style={{ marginLeft: level > 1 ? '48px' : 0 }}>
        {/* 연결선 (레벨 2 이상) - 더 세련된 스타일 */}
        {level > 1 && (
          <>
            {/* 곡선 연결선 */}
            <div
              className="absolute"
              style={{
                left: '-24px',
                top: '28px',
                width: '24px',
                height: '2px',
                background: 'linear-gradient(90deg, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.5) 100%)'
              }}
            />
            {/* 수직선 (마지막 노드가 아닐 때) */}
            {!isLast && (
              <div
                className="absolute"
                style={{
                  left: '-24px',
                  top: '28px',
                  width: '2px',
                  height: '96px',
                  background: 'linear-gradient(180deg, rgba(156, 163, 175, 0.5) 0%, rgba(156, 163, 175, 0.3) 100%)'
                }}
              />
            )}
          </>
        )}

        {/* 노드 카드 - 모던 글래스모피즘 디자인 */}
        <div ref={nodeRef} className="mb-4 group">
          <div
            className={`
              relative overflow-hidden
              ${levelStyle.bg} ${levelStyle.border}
              backdrop-blur-xl bg-opacity-50
              border rounded-2xl
              p-4 pr-6
              hover:shadow-2xl hover:scale-[1.02]
              transition-all duration-300 ease-out
              cursor-pointer
            `}
            onClick={() => hasChildren && setIsExpanded(!isExpanded)}
          >
            {/* 배경 그라데이션 효과 */}
            <div className={`absolute inset-0 bg-gradient-to-r ${levelStyle.gradient} opacity-5`} />

            <div className="relative flex items-center gap-4">
              {/* 아바타 */}
              <div className="relative flex-shrink-0">
                <div className={`
                  w-12 h-12 ${levelStyle.icon}
                  rounded-xl shadow-lg
                  flex items-center justify-center
                  text-white font-bold text-lg
                  group-hover:shadow-xl group-hover:scale-110
                  transition-all duration-300
                `}>
                  {node.user?.name?.charAt(0) || '?'}
                </div>
                {/* 직접 추천 수 배지 */}
                {node.user?.direct_referral_count > 0 && (
                  <div className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5
                                bg-gradient-to-r from-orange-500 to-red-500
                                rounded-full flex items-center justify-center
                                text-xs text-white font-bold shadow-lg
                                group-hover:scale-110 transition-transform">
                    {node.user.direct_referral_count}
                  </div>
                )}
              </div>

              {/* 정보 섹션 */}
              <div className="flex-1 min-w-0">
                {/* 이름과 레벨 */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white text-base">
                    {node.user?.name || '익명'}
                  </h3>
                  <span className={`
                    px-2.5 py-1 ${levelStyle.label}
                    text-white text-xs font-bold rounded-lg
                    shadow-md
                  `}>
                    L{level}
                  </span>
                </div>

                {/* 통계 정보 - 아이콘 추가 */}
                <div className="flex flex-wrap items-center gap-4">
                  {rate && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="text-yellow-400 text-sm font-medium">
                        {rate}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">
                      {revenue}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-blue-400 text-sm font-medium">
                      {node.stats?.total_referrals || 0}명
                    </span>
                  </div>
                </div>

                {/* 이메일 (선택적) */}
                <div className="mt-2 text-xs text-gray-500">
                  {node.user?.email}
                </div>
              </div>

              {/* 확장/축소 버튼 */}
              {hasChildren && (
                <div className={`
                  ml-auto p-2 rounded-lg
                  ${levelStyle.bg} bg-opacity-50
                  group-hover:bg-opacity-100
                  transition-all duration-300
                `}>
                  {isExpanded ? (
                    <ChevronDown className={`w-5 h-5 ${levelStyle.text}`} />
                  ) : (
                    <ChevronRight className={`w-5 h-5 ${levelStyle.text}`} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 자식 노드들 렌더링 - 확장/축소 애니메이션 */}
        {hasChildren && isExpanded && (
          <div className="relative animate-fadeIn">
            {/* 자식으로 연결되는 수직선 - 그라데이션 */}
            {node.children.length > 1 && (
              <div
                className="absolute"
                style={{
                  left: '-24px',
                  top: '0',
                  width: '2px',
                  height: `${(node.children.length - 1) * 100}px`,
                  background: 'linear-gradient(180deg, rgba(156, 163, 175, 0.5) 0%, rgba(156, 163, 175, 0.1) 100%)'
                }}
              />
            )}

            {/* 자식 노드들 */}
            {node.children.map((childNode, index) => (
              <HierarchyNode
                key={childNode.user?.id || `child-${index}`}
                node={childNode}
                level={level + 1}
                isLast={index === node.children.length - 1}
                parentRef={nodeRef}
              />
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">하위 브로커 정산</h1>
          <p className="text-muted-foreground dark:text-gray-400">브로커 네트워크 및 정산 현황을 관리하세요</p>
        </div>

        {/* 년/월 선택 박스 */}
        <div className="mb-6 flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Calendar className="text-gray-500 dark:text-gray-400" size={20} />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">조회 기간:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 상단 써머리 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">받을 정산금</p>
                <p className="text-2xl font-bold">{summary.incomingSettlement}</p>
              </div>
              <TrendingUp className="text-blue-200" size={32} />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">지급할 정산금</p>
                <p className="text-2xl font-bold">{summary.outgoingSettlement}</p>
              </div>
              <DollarSign className="text-purple-200" size={32} />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">순 수익</p>
                <p className="text-2xl font-bold">{summary.netProfit}</p>
              </div>
              <Users className="text-green-200" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 브로커 네트워크 트리 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground dark:text-white">브로커 네트워크</h2>
                <button
                  onClick={fetchHierarchyTree}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="새로고침"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchHierarchyTree}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <RefreshCw className="mr-2" size={16} />
                    다시 시도
                  </button>
                </div>
              ) : hierarchyData ? (
                <div className="relative overflow-x-auto p-8">
                  {/* 루트 노드 (나) - 모던 프리미엄 디자인 */}
                  <div className="mb-8">
                    <div className="relative overflow-hidden max-w-2xl">
                      {/* 글래스모피즘 카드 */}
                      <div className="relative backdrop-blur-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 rounded-3xl border border-purple-500/30 p-6 shadow-2xl">
                        {/* 배경 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 rounded-3xl" />

                        <div className="relative flex items-center gap-5">
                          {/* 프로필 아바타 */}
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl shadow-2xl flex items-center justify-center">
                              <span className="text-white font-bold text-xl">
                                {hierarchyData.user?.name?.charAt(0) || '나'}
                              </span>
                            </div>
                            {/* 직접 추천 배지 */}
                            {hierarchyData.user?.direct_referral_count > 0 && (
                              <div className="absolute -top-2 -right-2 min-w-[28px] h-7 px-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl">
                                <span className="text-white font-bold text-sm">
                                  {hierarchyData.user.direct_referral_count}
                                </span>
                              </div>
                            )}
                            {/* 왕관 아이콘 - ROOT 표시 */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-xs">👑</span>
                              </div>
                            </div>
                          </div>

                          {/* 정보 섹션 */}
                          <div className="flex-1">
                            {/* 이름과 역할 */}
                            <div className="flex items-center gap-3 mb-3">
                              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                                {hierarchyData.user?.name || '나'}
                              </h2>
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold rounded-full shadow-lg">
                                총 브로커
                              </span>
                              <span className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium rounded-full">
                                ROOT
                              </span>
                            </div>

                            {/* 통계 정보 */}
                            <div className="flex flex-wrap items-center gap-5">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                <span className="text-yellow-300 font-medium">
                                  요율: 0.02%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-green-300 font-medium">
                                  총 수익: ₩{(hierarchyData.stats?.total_revenue || 15080000).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                <span className="text-blue-300 font-medium">
                                  총 하위: {hierarchyData.stats?.total_referrals || 0}명
                                </span>
                              </div>
                            </div>

                            {/* 이메일 */}
                            <div className="mt-3 text-sm text-gray-400">
                              {hierarchyData.user?.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하위 계층 트리 */}
                  {hierarchyData.children && hierarchyData.children.length > 0 && (
                    <div className="relative">
                      {/* 루트에서 첫 자식으로 가는 수직선 */}
                      <div className="absolute w-0.5 bg-gray-400 dark:bg-gray-600"
                           style={{
                             left: '24px',
                             top: '-30px',
                             height: '50px'
                           }} />

                      {/* 자식이 여러 명일 때 수직 연결선 */}
                      {hierarchyData.children.length > 1 && (
                        <div className="absolute w-0.5 bg-gray-400 dark:bg-gray-600"
                             style={{
                               left: '24px',
                               top: '44px',
                               height: `${(hierarchyData.children.length - 1) * 80}px`
                             }} />
                      )}

                      {/* 자식 노드들 */}
                      <div className="ml-12">
                        {hierarchyData.children.map((childNode, index) => (
                          <HierarchyNode
                            key={childNode.user?.id || `child-${index}`}
                            node={childNode}
                            level={1}
                            isLast={index === hierarchyData.children.length - 1}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  데이터가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 감사 로그 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 text-foreground dark:text-white flex items-center">
                <History className="mr-2" size={20} />
                감사 로그
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-foreground dark:text-white">{log.broker}</span>
                      <span className="text-xs text-muted-foreground dark:text-gray-400">{log.date}</span>
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                      <span className="text-red-600 dark:text-red-400">{log.oldRate}</span> → <span className="text-green-600 dark:text-green-400">{log.newRate}</span>
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                      변경자: {log.changedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 정산 요율 변경 모달 */}
        {showRateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground dark:text-white">정산 요율 변경</h3>
                <button 
                  onClick={() => setShowRateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              {selectedBroker && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      브로커: {selectedBroker.name}
                    </label>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      현재 요율: {selectedBroker.rate}
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      새 요율
                    </label>
                    <input
                      type="text"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerNetworkPage; 