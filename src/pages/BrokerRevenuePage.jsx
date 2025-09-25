import React, { useState, useEffect } from 'react';
import { User, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, Copy, Loader2, RefreshCw } from 'lucide-react';
import config from '../config';

const BrokerRevenuePage = () => {
  // 상태 관리
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  // const [hierarchyStats, setHierarchyStats] = useState(null); // Commented out - unused

  // 목업 데이터 (일부는 실제 데이터로 대체될 예정)
  const brokerInfo = {
    referralCode: 'BR-MG2024-8829',
    settlementRate: '0.02%',
    monthlyRevenue: '₩45,230,000',
    settlementRevenue: '₩38,150,000'
  };

  // 첫 번째 회원과 첫 번째 포지션을 기본 선택
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // API 호출 함수: 직접 추천한 회원 목록 가져오기
  const fetchDirectReferrals = async () => {
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
      setUserInfo(currentUser);
      console.log('👤 Current User ID:', currentUser.id);
      console.log('👤 Current User Email:', currentUser.email);

      // API 엔드포인트 설정
      const endpoint = `${config.API_BASE_URL}/api/hierarchy/direct-referrals/${currentUser.id}`;
      console.log('🌐 API Endpoint:', endpoint);

      // 직접 추천한 회원 목록 API 호출
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response:', errorText);
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(`회원 목록을 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ API Response Data:', data);
      console.log('📊 Referrals Count:', data.referrals?.length || 0);
      console.log('📊 Total Count:', data.total);

      // 데이터 포맷 변환 (API 응답을 UI에 맞게 변환)
      const formattedMembers = (data.referrals || []).map(referral => {
        console.log('Processing referral:', referral);
        return {
          id: referral.id,
          name: referral.name,
          email: referral.email,
          joinDate: new Date(referral.created_at).toLocaleDateString('ko-KR'),
          status: 'active',
          revenue: `₩${(referral.stats?.total_revenue || 0).toLocaleString()}`,
          totalReferrals: referral.stats?.total_referrals || 0,
          directReferrals: referral.stats?.direct_referrals || 0
        };
      });

      console.log('📝 Formatted Members:', formattedMembers);
      setMembers(formattedMembers);

      // 첫 번째 회원 자동 선택
      if (formattedMembers.length > 0) {
        setSelectedMember(formattedMembers[0]);
      }

    } catch (err) {
      console.error('❌ Error fetching direct referrals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    fetchDirectReferrals();
  }, []);

  const positions = {
    1: [
      { id: 1, symbol: 'BTC-USDT-SWAP', side: 'long', size: '0.25', entryPrice: '67,450', currentPrice: '68,200', pnl: '+₩187,500', pnlPercent: '+1.11%' },
      { id: 2, symbol: 'ETH-USDT-SWAP', side: 'short', size: '2.5', entryPrice: '3,420', currentPrice: '3,380', pnl: '+₩100,000', pnlPercent: '+1.17%' }
    ],
    2: [
      { id: 3, symbol: 'DOGE-USDT-SWAP', side: 'long', size: '15000', entryPrice: '0.158', currentPrice: '0.162', pnl: '+₩60,000', pnlPercent: '+2.53%' }
    ],
    3: [
      { id: 4, symbol: 'BTC-USDT-SWAP', side: 'long', size: '0.18', entryPrice: '66,800', currentPrice: '68,200', pnl: '+₩252,000', pnlPercent: '+2.10%' },
      { id: 5, symbol: 'SOL-USDT-SWAP', side: 'short', size: '50', entryPrice: '185', currentPrice: '182', pnl: '+₩150,000', pnlPercent: '+1.62%' },
      { id: 6, symbol: 'ADA-USDT-SWAP', side: 'long', size: '8000', entryPrice: '0.45', currentPrice: '0.47', pnl: '+₩160,000', pnlPercent: '+4.44%' }
    ]
  };

  // 첫 번째 회원의 첫 번째 포지션을 기본 선택
  useEffect(() => {
    if (selectedMember && positions[selectedMember.id] && positions[selectedMember.id].length > 0) {
      setSelectedPosition(positions[selectedMember.id][0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMember]);

  const orders = {
    1: [
      // BTC-USDT-SWAP 주문들
      { id: 1, symbol: 'BTC-USDT-SWAP', type: 'limit', side: 'buy', size: '0.1', price: '67,000', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 14:30' },
      { id: 2, symbol: 'BTC-USDT-SWAP', type: 'market', side: 'buy', size: '0.08', price: '67,200', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 14:45' },
      { id: 3, symbol: 'BTC-USDT-SWAP', type: 'limit', side: 'sell', size: '0.05', price: '68,500', status: 'pending', settlementStatus: 'pending', time: '2024-03-15 16:10' },
      { id: 4, symbol: 'BTC-USDT-SWAP', type: 'limit', side: 'buy', size: '0.12', price: '66,800', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 13:20' },
      { id: 5, symbol: 'BTC-USDT-SWAP', type: 'market', side: 'sell', size: '0.03', price: '67,800', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 15:15' },
      { id: 6, symbol: 'BTC-USDT-SWAP', type: 'limit', side: 'buy', size: '0.09', price: '66,500', status: 'canceled', settlementStatus: 'pending', time: '2024-03-15 11:30' },
      { id: 7, symbol: 'BTC-USDT-SWAP', type: 'market', side: 'sell', size: '0.07', price: '68,100', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 16:45' },
      
      // ETH-USDT-SWAP 주문들  
      { id: 8, symbol: 'ETH-USDT-SWAP', type: 'market', side: 'sell', size: '1.0', price: '3,420', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 15:45' },
      { id: 9, symbol: 'ETH-USDT-SWAP', type: 'limit', side: 'sell', size: '0.8', price: '3,450', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 14:20' },
      { id: 10, symbol: 'ETH-USDT-SWAP', type: 'market', side: 'sell', size: '0.5', price: '3,400', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 16:30' },
      { id: 11, symbol: 'ETH-USDT-SWAP', type: 'limit', side: 'buy', size: '1.2', price: '3,350', status: 'pending', settlementStatus: 'pending', time: '2024-03-15 17:00' },
      { id: 12, symbol: 'ETH-USDT-SWAP', type: 'market', side: 'sell', size: '0.3', price: '3,380', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 13:10' },
      { id: 13, symbol: 'ETH-USDT-SWAP', type: 'limit', side: 'sell', size: '0.7', price: '3,480', status: 'canceled', settlementStatus: 'pending', time: '2024-03-15 12:45' }
    ],
    2: [
      // DOGE-USDT-SWAP 주문들
      { id: 14, symbol: 'DOGE-USDT-SWAP', type: 'market', side: 'buy', size: '10000', price: '0.158', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 13:20' },
      { id: 15, symbol: 'DOGE-USDT-SWAP', type: 'limit', side: 'sell', size: '5000', price: '0.165', status: 'pending', settlementStatus: 'pending', time: '2024-03-15 16:00' },
      { id: 16, symbol: 'DOGE-USDT-SWAP', type: 'market', side: 'buy', size: '8000', price: '0.156', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 14:30' },
      { id: 17, symbol: 'DOGE-USDT-SWAP', type: 'limit', side: 'sell', size: '3000', price: '0.162', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 15:20' },
      { id: 18, symbol: 'DOGE-USDT-SWAP', type: 'market', side: 'buy', size: '12000', price: '0.159', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 12:10' },
      { id: 19, symbol: 'DOGE-USDT-SWAP', type: 'limit', side: 'sell', size: '7000', price: '0.168', status: 'canceled', settlementStatus: 'pending', time: '2024-03-15 11:45' },
      { id: 20, symbol: 'DOGE-USDT-SWAP', type: 'market', side: 'sell', size: '4000', price: '0.161', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 16:20' },
      { id: 21, symbol: 'DOGE-USDT-SWAP', type: 'limit', side: 'buy', size: '15000', price: '0.155', status: 'pending', settlementStatus: 'pending', time: '2024-03-15 17:15' }
    ],
    3: [
      // BTC-USDT-SWAP 주문들
      { id: 22, symbol: 'BTC-USDT-SWAP', type: 'market', side: 'buy', size: '0.15', price: '66,800', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 12:15' },
      { id: 23, symbol: 'BTC-USDT-SWAP', type: 'limit', side: 'buy', size: '0.05', price: '66,500', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 13:30' },
      { id: 24, symbol: 'BTC-USDT-SWAP', type: 'market', side: 'sell', size: '0.08', price: '67,500', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 15:45' },
      { id: 25, symbol: 'BTC-USDT-SWAP', type: 'limit', side: 'buy', size: '0.12', price: '66,200', status: 'pending', settlementStatus: 'pending', time: '2024-03-15 16:30' },
      { id: 26, symbol: 'BTC-USDT-SWAP', type: 'market', side: 'sell', size: '0.06', price: '68,000', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 14:20' },
      
      // SOL-USDT-SWAP 주문들
      { id: 27, symbol: 'SOL-USDT-SWAP', type: 'limit', side: 'sell', size: '30', price: '185', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 14:00' },
      { id: 28, symbol: 'SOL-USDT-SWAP', type: 'market', side: 'sell', size: '20', price: '183', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 15:30' },
      { id: 29, symbol: 'SOL-USDT-SWAP', type: 'limit', side: 'buy', size: '25', price: '180', status: 'pending', settlementStatus: 'pending', time: '2024-03-15 16:45' },
      { id: 30, symbol: 'SOL-USDT-SWAP', type: 'market', side: 'sell', size: '15', price: '182', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 13:15' },
      { id: 31, symbol: 'SOL-USDT-SWAP', type: 'limit', side: 'sell', size: '40', price: '188', status: 'canceled', settlementStatus: 'pending', time: '2024-03-15 12:30' },
      
      // ADA-USDT-SWAP 주문들
      { id: 32, symbol: 'ADA-USDT-SWAP', type: 'market', side: 'buy', size: '5000', price: '0.45', status: 'filled', settlementStatus: 'pending', time: '2024-03-15 15:30' },
      { id: 33, symbol: 'ADA-USDT-SWAP', type: 'limit', side: 'buy', size: '3000', price: '0.44', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 14:15' },
      { id: 34, symbol: 'ADA-USDT-SWAP', type: 'market', side: 'sell', size: '2000', price: '0.47', status: 'filled', settlementStatus: 'settled', time: '2024-03-15 16:00' },
      { id: 35, symbol: 'ADA-USDT-SWAP', type: 'limit', side: 'buy', size: '4000', price: '0.43', status: 'pending', settlementStatus: 'pending', time: '2024-03-15 17:30' },
      { id: 36, symbol: 'ADA-USDT-SWAP', type: 'market', side: 'sell', size: '1500', price: '0.46', status: 'filled', settlementStatus: 'requested', time: '2024-03-15 13:45' }
    ]
  };

  const getSettlementStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: '정산 전', color: 'bg-gray-500', icon: Clock },
      requested: { text: '정산 요청됨', color: 'bg-yellow-500', icon: AlertCircle },
      settled: { text: '정산됨', color: 'bg-green-500', icon: CheckCircle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* 상단 정보 바 */}
      <div className="mb-6 bg-card rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">내 추천인 코드</p>
              <div className="flex items-center space-x-2">
                <p className="font-mono font-medium">{brokerInfo.referralCode}</p>
                <button
                  onClick={() => copyToClipboard(brokerInfo.referralCode)}
                  className="p-1 hover:bg-accent rounded"
                >
                  <Copy size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">내가 받는 정산 요율</p>
              <p className="font-semibold text-green-600">{brokerInfo.settlementRate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">이번달 누적 수익</p>
              <p className="font-semibold text-purple-600">{brokerInfo.monthlyRevenue}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">정산 수익</p>
              <p className="font-semibold text-orange-600">{brokerInfo.settlementRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* 좌측: 내 회원 목록 */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">내 회원 목록</h2>
            <button
              onClick={fetchDirectReferrals}
              disabled={loading}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>아직 추천한 회원이 없습니다.</p>
                <p className="text-sm mt-2">추천인 코드를 공유하여 회원을 모집해보세요!</p>
              </div>
            ) : (
              members.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMember?.id === member.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">가입: {member.joinDate}</p>
                      {member.directReferrals > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          직접 추천: {member.directReferrals}명
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{member.revenue}</p>
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1"></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 중간: 선택한 회원의 포지션 */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">
            {selectedMember ? `${selectedMember.name}님의 포지션` : '회원을 선택하세요'}
          </h2>
          <div className="space-y-3 overflow-y-auto h-full">
            {!selectedMember ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 회원을 선택해주세요</p>
                </div>
              </div>
            ) : selectedMember && positions[selectedMember.id] ? (
              positions[selectedMember.id].map(position => (
                <div
                  key={position.id}
                  onClick={() => setSelectedPosition(position)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedPosition?.id === position.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{position.symbol}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      position.side === 'long' 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {position.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">크기</p>
                      <p className="font-medium">{position.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">진입가</p>
                      <p className="font-medium">{position.entryPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">현재가</p>
                      <p className="font-medium">{position.currentPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">손익</p>
                      <p className={`font-medium ${position.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {position.pnl}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>아직 포지션이 없습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 선택한 포지션의 주문 */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">
            {selectedPosition ? `${selectedPosition.symbol} 주문` : '포지션을 선택하세요'}
          </h2>
          <div className="space-y-3 overflow-y-auto h-full">
            {selectedMember && orders[selectedMember.id] ? (
              orders[selectedMember.id]
                .filter(order => !selectedPosition || order.symbol === selectedPosition.symbol)
                .map(order => (
                <div key={order.id} className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{order.symbol}</span>
                    {getSettlementStatusBadge(order.settlementStatus)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">타입</p>
                      <p className="font-medium">{order.type.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">방향</p>
                      <p className={`font-medium ${
                        order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {order.side.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">크기</p>
                      <p className="font-medium">{order.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">가격</p>
                      <p className="font-medium">{order.price}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.time}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {selectedMember ? '주문이 없습니다' : '회원을 선택하세요'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerRevenuePage; 