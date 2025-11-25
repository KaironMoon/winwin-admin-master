import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import config from '../config';
import {
  Bot,
  TrendingUp,
  Settings,
  BarChart3,
  Activity,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Target,
  Gauge,
  LogIn,
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  Layers,
  Calendar,
  Search,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import * as botUtils from '../lib/botUtils';
import { useAtomValue, useSetAtom } from 'jotai';
import { isDemoAtom } from '../stores/isDemoStore';
import {
  isDemoFilterAtom,
  setIsDemoFilterAtom,
  initDemoFilterAtom
} from '../stores/demoFilterStore';
import { fetchPendingOrders, fetchOrderHistory, categorizePendingOrders } from '../lib/orderDisplayApi';
import { authenticatedFetch } from '../lib/authUtils';

function BotManagementPage({ isDarkMode, user, onShowOKXModal, onLogout, okxConnected, balance, positions, orders, onShowLoginModal }) {
  const isDemo = useAtomValue(isDemoAtom);

  // 데모 필터 상태 (전역 atom 사용)
  const isDemoFilter = useAtomValue(isDemoFilterAtom);
  const setIsDemoFilter = useSetAtom(setIsDemoFilterAtom);
  const initDemoFilter = useSetAtom(initDemoFilterAtom);

  const [selectedBotId, setSelectedBotId] = useState(null);
  const [apiBots, setApiBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingBotId, setDeletingBotId] = useState(null);
  const [completingBotId, setCompletingBotId] = useState(null);
  const [completingWithClosePositionBotId, setCompletingWithClosePositionBotId] = useState(null);
  const [activeOrderTab, setActiveOrderTab] = useState('pending'); // 'pending' | 'filled'
  
  // 봇 목록 탭 상태
  const [activeBotTab, setActiveBotTab] = useState('active'); // 'active' | 'inactive' | 'error'
  
  // 페이지네이션 상태
  const [inactiveBotCount, setInactiveBotCount] = useState(10);
  const [errorBotCount, setErrorBotCount] = useState(10);
  
  // 로그 상태
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [currentLogPage, setCurrentLogPage] = useState(1);
  const [totalLogPages, setTotalLogPages] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingAllLogs, setIsLoadingAllLogs] = useState(false);
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logTimeFilter, setLogTimeFilter] = useState('');
  const [allLogsLoaded, setAllLogsLoaded] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logModalBot, setLogModalBot] = useState(null);
  const logsPerPage = 5000;
  
  // 로그 컨테이너 ref
  const logContainerRef = useRef(null);

  // 요청된 주문 (entry_config) vs 체결된 주문 (API)
  const [requestedOrders, setRequestedOrders] = useState([]); // entry_config 기반
  const [filledOrders, setFilledOrders] = useState({}); // bot_id별 체결된 주문

  // New Order Display API States
  const [pendingOrdersData, setPendingOrdersData] = useState(null);
  const [orderHistoryData, setOrderHistoryData] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const orderRefreshIntervalRef = useRef(null);

  // entry_config 기반 요청된 주문 생성
  const generateRequestedOrders = (bots = apiBots) => {
    const orders = [];
    
    bots.forEach(bot => {
      // entry.data 배열에서 주문 생성 (entry_config가 아닌 entry)
      if (bot.entry && bot.entry.data && Array.isArray(bot.entry.data)) {
        bot.entry.data.forEach((entry, index) => {
          orders.push({
            id: `bot-${bot.id}-entry-${index}`,
            botId: bot.id,
            botName: bot.metadata?.name || 'Unnamed Bot',
            symbol: bot.basic?.symbol,
            type: 'entry',
            price: entry.price,
            size: entry.amount,
            side: 'buy',
            status: 'pending',
            createdAt: bot.created_at,
            step: entry.step,
            entryType: entry.type
          });
        });
      }
      
      // TP/SL 주문도 추가 (exit 설정에서)
      if (bot.exit && bot.exit.take_profit) {
        // 첫 번째 진입가를 기준으로 익절가 계산
        const firstEntryPrice = bot.entry?.data?.[0]?.price || 0;
        const takeProfitPercent = bot.exit.take_profit || 0;
        const direction = bot.basic?.direction || 'long';
        
        // 롱: 진입가 * (1 + TP%), 숏: 진입가 * (1 - TP%)
        const takeProfitPrice = direction === 'long' 
          ? firstEntryPrice * (1 + takeProfitPercent / 100)
          : firstEntryPrice * (1 - takeProfitPercent / 100);
        
        // 전체 진입 사이즈 계산
        const totalEntrySize = bot.entry?.data?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
        
        orders.push({
          id: `bot-${bot.id}-tp`,
          botId: bot.id,
          botName: bot.metadata?.name || 'Unnamed Bot',
          symbol: bot.basic?.symbol,
          type: 'take_profit',
          price: takeProfitPrice,
          size: totalEntrySize,
          side: direction === 'long' ? 'sell' : 'buy',
          status: 'pending',
          createdAt: bot.created_at,
          percentage: takeProfitPercent
        });
      }
      
      if (bot.exit && bot.exit.stop_loss && bot.exit.stop_loss.enabled) {
        // 첫 번째 진입가를 기준으로 손절가 계산
        const firstEntryPrice = bot.entry?.data?.[0]?.price || 0;
        const stopLossPercent = Math.abs(bot.exit.stop_loss.value || 0);
        const direction = bot.basic?.direction || 'long';
        
        // 롱: 진입가 * (1 - SL%), 숏: 진입가 * (1 + SL%)
        const stopLossPrice = direction === 'long' 
          ? firstEntryPrice * (1 - stopLossPercent / 100)
          : firstEntryPrice * (1 + stopLossPercent / 100);
        
        // 전체 진입 사이즈 계산
        const totalEntrySize = bot.entry?.data?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
        
        orders.push({
          id: `bot-${bot.id}-sl`,
          botId: bot.id,
          botName: bot.metadata?.name || 'Unnamed Bot',
          symbol: bot.basic?.symbol,
          type: 'stop_loss',
          price: stopLossPrice,
          size: totalEntrySize,
          side: direction === 'long' ? 'sell' : 'buy',
          status: 'pending',
          createdAt: bot.created_at,
          percentage: -stopLossPercent
        });
      }
    });
    
    setRequestedOrders(orders);
  };

  // API에서 봇 데이터 가져오기
  const fetchBots = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await botUtils.getMyBots(isDemoFilter);
      setApiBots(data);
      generateRequestedOrders(data); // entry_config 기반 주문 생성
      
      // 첫 번째 봇을 자동 선택
      if (data.length > 0 && !selectedBotId) {
        setSelectedBotId(data[0].id);
      }
    } catch (err) {
      console.error('봇 데이터 가져오기 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  // 체결된 주문 API 호출
  const fetchFilledOrders = async (botId) => {
    if (!user || !botId) return;

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/orders?bot_id=${botId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFilledOrders(prev => ({
          ...prev,
          [botId]: data.orders || []
        }));
      }
    } catch (error) {
      // 에러 무시
    }
  };

  // New order fetching functions using Order Display API
  const fetchOrdersFromAPI = async (botId) => {
    if (!user || !botId) return;

    setLoadingOrders(true);
    setOrderError(null);

    try {
      // Fetch pending orders
      const pendingData = await fetchPendingOrders(botId);
      setPendingOrdersData(pendingData);

      // Fetch order history (filled and cancelled)
      const historyData = await fetchOrderHistory(botId, 50, 0);
      setOrderHistoryData(historyData);

    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrderError(error.message);
      // Fallback to old method if new API fails
      await fetchFilledOrders(botId);
    } finally {
      setLoadingOrders(false);
    }
  };

  // 데모 필터 초기화
  useEffect(() => {
    initDemoFilter();
  }, [initDemoFilter]);

  // 봇 목록 로드
  useEffect(() => {
    fetchBots();
  }, [user, isDemoFilter]);

  // 봇 선택 시 주문 데이터 로딩 및 자동 새로고침 (30초)
  useEffect(() => {
    if (selectedBotId) {
      // Initial fetch
      fetchOrdersFromAPI(selectedBotId);

      // Set up auto-refresh every 30 seconds
      orderRefreshIntervalRef.current = setInterval(() => {
        fetchOrdersFromAPI(selectedBotId);
      }, 30000);

      return () => {
        if (orderRefreshIntervalRef.current) {
          clearInterval(orderRefreshIntervalRef.current);
          orderRefreshIntervalRef.current = null;
        }
      };
    } else {
      // Clear data when no bot is selected
      setPendingOrdersData(null);
      setOrderHistoryData(null);
      setOrderError(null);
    }
  }, [selectedBotId]);

  // 봇 완료 함수
  const completeBot = async (botId) => {
    if (!window.confirm('정말로 이 봇을 완료 처리하시겠습니까?')) {
      return;
    }

    setCompletingBotId(botId);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/bots/${botId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });

      if (!response.ok) {
        throw new Error('봇 완료 처리에 실패했습니다.');
      }

      // 완료 성공 시 봇 목록 새로고침
      fetchBots(isDemo);

    } catch (err) {
      console.error('봇 완료 처리 오류:', err);
      setError(err.message);
    } finally {
      setCompletingBotId(null);
    }
  };

  // 포지션 닫고 봇 완료 함수
  const completeBotWithClosePosition = async (botId) => {
    if (!window.confirm('정말로 포지션을 닫고 이 봇을 완료 처리하시겠습니까?')) {
      return;
    }

    setCompletingWithClosePositionBotId(botId);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/bots/${botId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'completed',
          close_position: true
        })
      });

      if (!response.ok) {
        throw new Error('포지션 닫기 및 봇 완료 처리에 실패했습니다.');
      }

      // 완료 성공 시 봇 목록 새로고침
      fetchBots(isDemo);

    } catch (err) {
      console.error('포지션 닫기 및 봇 완료 처리 오류:', err);
      setError(err.message);
    } finally {
      setCompletingWithClosePositionBotId(null);
    }
  };

  // 봇 삭제 함수
  const deleteBot = async (botId) => {
    if (!window.confirm('정말로 이 봇을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setDeletingBotId(botId);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/bots/${botId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('봇 삭제에 실패했습니다.');
      }

      // 삭제 성공 시 봇 목록에서 제거
      const updatedBots = apiBots.filter(bot => bot.id !== botId);
      setApiBots(updatedBots);
      
      // 주문 데이터 다시 생성
      generateRequestedOrders(updatedBots);
      
      // 삭제된 봇이 현재 선택된 봇이었다면 선택 해제
      if (selectedBotId === botId) {
        setSelectedBotId(null);
      }

    } catch (err) {
      console.error('봇 삭제 오류:', err);
      setError(err.message);
    } finally {
      setDeletingBotId(null);
    }
  };

  // 일괄 삭제 함수
  const handleBatchDelete = async (tabType) => {
    let statuses = [];
    let confirmMessage = '';

    if (tabType === 'inactive') {
      // 비활성 봇 = paused, completed
      statuses = ['completed'];
      confirmMessage = `비활성 봇 ${inactiveBots.length}개를 일괄 삭제하시겠습니까?`;
    } else if (tabType === 'error') {
      statuses = ['error'];
      confirmMessage = `오류 봇 ${errorBots.length}개를 일괄 삭제하시겠습니까?`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${config.API_BASE_URL}/api/bot-maintenance/batch-soft-delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            statuses: statuses
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '일괄 삭제에 실패했습니다.');
      }

      const result = await response.json();
      console.log('일괄 삭제 결과:', result);

      alert(
        `일괄 삭제 완료!\n\n` +
        `삭제된 봇: ${result.deleted_count || 0}개`
      );

      // 봇 목록 새로고침
      fetchBots(isDemo);

      // 삭제된 봇이 선택된 봇이었다면 선택 해제
      if (result.bot_ids && result.bot_ids.includes(selectedBotId)) {
        setSelectedBotId(null);
      }

    } catch (err) {
      console.error('일괄 삭제 오류:', err);
      setError(err.message);
      alert(`오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 봇 주문 정리 함수 (서버 상태만 업데이트)
  const handleCleanupBot = async (bot) => {
    setLoading(true);
    setError(null);

    try {
      // sync-orders API 호출 (주문 상태 동기화)
      const syncResponse = await authenticatedFetch(
        `${config.API_BASE_URL}/api/bot-maintenance/sync-orders/${bot.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json();
        throw new Error(errorData.detail || '주문 상태 동기화에 실패했습니다.');
      }

      const result = await syncResponse.json();
      console.log('동기화 결과:', result);

      alert(
        `주문 상태 정리 완료!\n\n` +
        `동기화된 주문: ${result.synced_orders || 0}개\n` +
        `체결: ${result.filled || 0}개\n` +
        `취소: ${result.cancelled || 0}개\n` +
        `변경 없음: ${result.unchanged || 0}개`
      );

      // 봇 목록 새로고침
      fetchBots(isDemo);

      // 선택된 봇인 경우 주문 데이터도 새로고침
      if (selectedBotId === bot.id) {
        fetchOrdersFromAPI(bot.id);
      }

    } catch (err) {
      console.error('주문 정리 오류:', err);
      setError(err.message);
      alert(`오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 봇 상태에 따른 색상 반환
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 봇 상태 텍스트 반환
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'paused':
        return '일시정지';
      case 'error':
        return '오류';
      case 'completed':
        return '완료';
      default:
        return '알 수 없음';
    }
  };

  // 봇 상태 배경색 반환
  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // 봇들을 상태별로 필터링
  const activeBots = apiBots.filter(bot => bot.status === 'active');
  const inactiveBots = apiBots.filter(bot => bot.status === 'paused' || bot.status === 'completed');
  const errorBots = apiBots.filter(bot => bot.status === 'error');
  
  // 현재 탭에 따른 표시할 봇 목록
  const getDisplayBots = () => {
    switch (activeBotTab) {
      case 'active':
        return activeBots;
      case 'inactive':
        return inactiveBots.slice(0, inactiveBotCount);
      case 'error':
        return errorBots.slice(0, errorBotCount);
      default:
        return [];
    }
  };
  
  // 더 보기 함수들
  const showMoreInactiveBots = () => {
    setInactiveBotCount(prev => prev + 10);
  };
  
  const showMoreErrorBots = () => {
    setErrorBotCount(prev => prev + 10);
  };
  
  // 탭 변경 핸들러
  const handleBotTabChange = (tab) => {
    setActiveBotTab(tab);
    
    // 선택된 봇이 현재 탭에 없으면 선택 해제
    if (selectedBotId) {
      const currentDisplayBots = tab === 'active' ? activeBots : 
                                tab === 'inactive' ? inactiveBots : errorBots;
      const isSelectedBotInCurrentTab = currentDisplayBots.some(bot => bot.id === selectedBotId);
      if (!isSelectedBotInCurrentTab) {
        setSelectedBotId(null);
      }
    }
  };

  // 선택된 봇 찾기
  const selectedBot = apiBots.find(bot => bot.id === selectedBotId);

  // 선택된 봇의 포지션 찾기
  const getBotPosition = (bot) => {
    if (!bot || !positions.length) return null;

    // 포지션이 1개면 그냥 반환
    if (positions.length === 1) {
      return positions[0];
    }

    const symbol = bot.basic?.symbol;
    if (!symbol) return null;

    // 정확한 매칭 시도
    let position = positions.find(pos => pos.instId === symbol);
    if (position) return position;

    // 유연한 매칭 시도 (BTC-USDT 부분만 매칭)
    const baseSymbol = symbol.replace('-SWAP', '').replace('-PERP', '');
    position = positions.find(pos => {
      const posBaseSymbol = pos.instId.replace('-SWAP', '').replace('-PERP', '');
      return posBaseSymbol === baseSymbol;
    });

    return position;
  };

  // entry_config 기반 요청된 주문 필터링
  const getBotRequestedOrders = (bot) => {
    if (!bot) return [];
    return requestedOrders.filter(order => order.botId === bot.id);
  };

  // API에서 체결된 주문 가져오기
  const getBotFilledOrders = (bot) => {
    if (!bot) return [];
    return filledOrders[bot.id] || [];
  };

  // ❌ getBotPendingOrders 제거됨 - getBotRequestedOrders 사용

  // 요청된 주문을 유형별로 분류
  const categorizeRequestedOrders = (orders) => {
    const categories = {
      entry: [],
      take_profit: [],
      stop_loss: []
    };
    
    orders.forEach(order => {
      if (categories[order.type]) {
        categories[order.type].push(order);
      }
    });
    
    // 각 카테고리 내에서 가격순 정렬
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    });
    
    return categories;
  };

  // 요청된 주문 카드 컴포넌트
  const RequestedOrderCard = ({ order, bot }) => {
    const getOrderTypeText = (type) => {
      switch (type) {
        case 'entry': return '진입';
        case 'take_profit': return '익절';
        case 'stop_loss': return '손절';
        default: return type;
      }
    };
    
    const getOrderTypeColor = (type) => {
      switch (type) {
        case 'entry': return 'bg-blue-500/20 text-blue-600';
        case 'take_profit': return 'bg-green-500/20 text-green-600';
        case 'stop_loss': return 'bg-red-500/20 text-red-600';
        default: return 'bg-gray-500/20 text-gray-600';
      }
    };
    
    const price = parseFloat(order.price || 0);
    const size = parseFloat(order.size || 0);
    
    // 주문 상태 결정 (봇의 실제 entry.data와 current_step 비교)
    const getOrderStatus = () => {
      if (order.type === 'entry' && order.step && bot?.current_step && bot?.entry?.data) {
        // 봇의 실제 entry.data에서 해당 step이 존재하는지 확인
        const actualEntry = bot.entry.data.find(entry => entry.step === order.step);
        
        // 실제로 존재하고 current_step 이하인 경우만 체결됨으로 표시
        if (actualEntry && order.step <= bot.current_step) {
          return {
            text: '체결됨',
            className: 'bg-green-500/20 text-green-600 border border-green-500/30'
          };
        }
      }
      // TP/SL은 항상 대기중 (모든 진입이 완료된 후에만 실행)
      // 또는 진입 주문이지만 실제 entry.data에 없거나 current_step에 도달하지 않은 경우
      return {
        text: '대기중',
        className: 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'
      };
    };
    
    const orderStatus = getOrderStatus();
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-card/50 rounded-lg p-3 border hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              order.side === 'buy' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              order.side === 'buy' 
                ? 'bg-green-500/20 text-green-600' 
                : 'bg-red-500/20 text-red-600'
            }`}>
              {order.side === 'buy' ? '매수' : '매도'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${getOrderTypeColor(order.type)}`}>
              {getOrderTypeText(order.type)}
              {order.step && ` (${order.step}단계)`}
            </span>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${orderStatus.className}`}>
            {orderStatus.text}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">가격</span>
              <div className="text-right">
                <span className="font-bold text-foreground">${price.toLocaleString()}</span>
                {order.percentage && (
                  <div className={`text-xs ${order.percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {order.percentage > 0 ? '+' : ''}{order.percentage}%
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">사이즈</span>
              <span className="font-medium text-foreground">{size.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">총액</span>
              <span className="font-bold text-foreground">${(price * size).toLocaleString()}</span>
            </div>
            {order.type === 'entry' && order.step && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">단계</span>
                <span className="font-medium text-blue-600">{order.step}단계</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-muted/30">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">주문 ID</span>
            <span className="font-mono text-muted-foreground">{order.id?.slice(-8) || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-muted-foreground">생성시간</span>
            <span className="text-muted-foreground">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  // 체결된 주문 카드 컴포넌트
  const FilledOrderCard = ({ order }) => {
    const price = parseFloat(order.average_price || order.last_filled_price || 0);
    const size = parseFloat(order.filled_size || order.last_filled_size || 0);
    const fee = parseFloat(order.fee || 0);
    
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-card/30 rounded-lg p-3 border border-green-500/20 hover:border-green-500/40 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-600" />
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              order.side === 'buy' 
                ? 'bg-green-500/20 text-green-600' 
                : 'bg-red-500/20 text-red-600'
            }`}>
              {order.side === 'buy' ? '매수 체결' : '매도 체결'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(order.last_filled_time || order.okx_created_at).toLocaleString()}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">체결가</span>
              <span className="font-bold text-green-600">${price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">체결 사이즈</span>
              <span className="font-medium text-foreground">{size.toLocaleString()} USDT</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">체결금액</span>
              <span className="font-bold text-foreground">${(price * size).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">수수료</span>
              <span className="font-medium text-red-600">{Math.abs(fee).toFixed(4)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-green-500/20">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">주문 ID</span>
            <span className="font-mono text-muted-foreground">{order.okx_order_id?.slice(-8) || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-muted-foreground">상태</span>
            <span className="font-medium text-green-600">{order.status}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // New Order Card Components for Order Display API
  const PendingOrderCard = ({ order, type, direction }) => {
    const isEntry = type === 'entry' || type === 'cycle';
    const isTp = type === 'take_profit';
    const isSl = type === 'stop_loss';
    const isCycle = type === 'cycle';

    const getOrderTypeColor = () => {
      if (isTp) return 'text-green-600 bg-green-500/10 border-green-500/30';
      if (isSl) return 'text-red-600 bg-red-500/10 border-red-500/30';
      if (isCycle) return 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/30';
      return 'text-blue-600 bg-blue-500/10 border-blue-500/30';
    };

    const getSideText = () => {
      // 익절/손절의 경우 포지션 청산이므로 별도 처리
      if (isTp || isSl) {
        // 롱 포지션: 익절/손절은 sell (매도)
        // 숏 포지션: 익절/손절은 buy (매도로 표시)
        if (direction === 'long') {
          return order.side === 'sell' ? '매도' : '매수';
        } else if (direction === 'short') {
          return order.side === 'buy' ? '매도' : '매수';
        }
        // direction이 unknown이면 기본 로직
        return order.side === 'buy' ? '매수' : '매도';
      }

      // 포지션 방향에 따른 매수/매도 판단 (진입/순환매 주문)
      const isLong = direction === 'long';
      const isShort = direction === 'short';

      // 진입 주문과 순환매 주문의 경우
      if ((isEntry || isCycle) && direction !== 'unknown') {
        // 롱: buy = 포지션 증가(매수), sell = 포지션 감소(매도)
        // 숏: sell = 포지션 증가(매수), buy = 포지션 감소(매도)
        if (isLong) {
          return order.side === 'buy' ? '매수' : '매도';
        } else if (isShort) {
          return order.side === 'sell' ? '매수' : '매도';
        }
      }

      // 기본 로직
      return order.side === 'buy' ? '매수' : '매도';
    };

    const getOrderTypeText = () => {
      if (isTp) return '익절';
      if (isSl) return '손절';
      if (isCycle) return '순환매';
      if (isEntry && order.entry_step) return `진입 ${order.entry_step}단계`;
      return '진입';
    };

    const getFullOrderText = () => {
      return `[${getSideText()}][${getOrderTypeText()}]`;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card rounded-lg border p-3 ${getOrderTypeColor()}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                order.side === 'buy' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
              }`}>
                {getSideText()}
              </span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                isTp ? 'bg-green-500/20 text-green-600' :
                isSl ? 'bg-red-500/20 text-red-600' :
                isCycle ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium' :
                'bg-blue-500/20 text-blue-600'
              }`}>
                {getOrderTypeText()}
              </span>
              {(isTp || isSl) && order.percentage !== undefined && (
                <span className={`text-xs font-medium ${
                  order.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {order.percentage > 0 ? '+' : ''}{order.percentage}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">가격:</span>
                <span className="text-xs font-medium">${order.price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">수량:</span>
                <span className="text-xs font-medium">{order.size?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">금액:</span>
                <span className="text-xs font-medium">${order.notional?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">타입:</span>
                <span className="text-xs font-medium">{order.order_type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-current/20">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">OKX 주문 ID</span>
            <span className="font-mono text-muted-foreground text-xs break-all">
              {order.order_id || 'N/A'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const OrderHistoryCard = ({ order, direction }) => {
    const isFilled = order.status === 'filled';
    const isCancelled = order.status === 'canceled' || order.status === 'cancelled';
    const filledPercentage = order.size > 0 ? (order.filled_size / order.size * 100) : 0;

    // Convert bot_order_type to number for comparison
    const botOrderType = order.bot_order_type ? Number(order.bot_order_type) : null;

    const getOrderTypeText = () => {
      // bot_order_type 사용 (서버에서 제공 시)
      // 1=TP_SL(손절/익절), 2=MARTINGALE(진입), 3=RISK_MANAGE(순환매)
      if (botOrderType) {
        switch (botOrderType) {
          case 1: // TP_SL - 방향 상관없이 손절/익절
            return '손절/익절';
          case 2: // MARTINGALE (진입)
            return order.entry_step ? `진입 ${order.entry_step}단계` : '진입';
          case 3: // RISK_MANAGE (순환매)
            return '순환매';
          default:
            break;
        }
      }

      // entry_label로 주문 타입 구분
      if (order.entry_label) {
        if (order.entry_label.toLowerCase().includes('tp')) return '익절';
        if (order.entry_label.toLowerCase().includes('sl')) return '손절';
        if (order.entry_label.toLowerCase().includes('reverse') ||
            order.entry_label.toLowerCase().includes('martingale') ||
            order.entry_label.toLowerCase().includes('cycle')) return '순환매';
        if (order.entry_step) return `진입 ${order.entry_step}단계`;
        return '진입';
      }

      // algo_order_id가 있으면 알고리즘 주문 (TP/SL)
      if (order.algo_order_id) {
        // 알고리즘 주문은 보통 TP/SL
        return '익절/손절';
      }

      // order_type으로 추가 구분
      if (order.order_type === 'trigger') {
        return '익절/손절'; // 트리거 주문은 보통 TP/SL
      }

      // 기본값은 진입
      return '진입';
    };

    const isEntry = getOrderTypeText().includes('진입');
    const isCycle = getOrderTypeText() === '순환매';
    const isTp = getOrderTypeText() === '익절';
    const isSl = getOrderTypeText() === '손절';

    const getSideText = () => {
      // 익절/손절의 경우 포지션 청산이므로 별도 처리
      if (isTp || isSl) {
        // 롱 포지션: 익절/손절은 sell (매도)
        // 숏 포지션: 익절/손절은 buy (매도로 표시)
        if (direction === 'long') {
          return order.side === 'sell' ? '매도' : '매수';
        } else if (direction === 'short') {
          return order.side === 'buy' ? '매도' : '매수';
        }
        // direction이 unknown이면 기본 로직
        return order.side === 'buy' ? '매수' : '매도';
      }

      // 포지션 방향에 따른 매수/매도 판단 (진입/순환매 주문)
      const isLong = direction === 'long';
      const isShort = direction === 'short';

      // 진입 주문과 순환매 주문의 경우
      if ((isEntry || isCycle) && direction !== 'unknown') {
        // 롱: buy = 포지션 증가(매수), sell = 포지션 감소(매도)
        // 숏: sell = 포지션 증가(매수), buy = 포지션 감소(매도)
        if (isLong) {
          return order.side === 'buy' ? '매수' : '매도';
        } else if (isShort) {
          return order.side === 'sell' ? '매수' : '매도';
        }
      }

      // 기본 로직
      return order.side === 'buy' ? '매수' : '매도';
    };

    const getFullOrderText = () => {
      return `[${getSideText()}][${getOrderTypeText()}]`;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card rounded-lg border p-3 ${
          isFilled ? 'border-green-500/30 bg-green-500/5' :
          isCancelled ? 'border-gray-500/30 bg-gray-500/5' :
          'border-yellow-500/30 bg-yellow-500/5'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                isFilled ? 'bg-green-500/20 text-green-600' :
                isCancelled ? 'bg-gray-500/20 text-gray-600' :
                'bg-yellow-500/20 text-yellow-600'
              }`}>
                {isFilled ? '체결' : isCancelled ? '취소' : '부분체결'}
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                order.side === 'buy' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
              }`}>
                {getSideText()}
              </span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                getOrderTypeText() === '익절' ? 'bg-green-500/20 text-green-600' :
                getOrderTypeText() === '손절' ? 'bg-red-500/20 text-red-600' :
                getOrderTypeText() === '순환매' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium' :
                getOrderTypeText() === '조건부' ? 'bg-yellow-500/20 text-yellow-600' :
                'bg-blue-500/20 text-blue-600'
              }`}>
                {getOrderTypeText()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">가격:</span>
                <span className="text-xs font-medium">${order.price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">체결:</span>
                <span className="text-xs font-medium">
                  {order.filled_size?.toFixed(4)}/{order.size?.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">금액:</span>
                <span className="text-xs font-medium">${order.notional?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">체결률:</span>
                <span className="text-xs font-medium">{filledPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-current/20 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">OKX 주문 ID</span>
            <span className="font-mono text-muted-foreground text-xs break-all">
              {order.order_id || order.algo_order_id || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">시간</span>
            <span className="text-muted-foreground">
              {new Date(parseInt(order.updated_at)).toLocaleString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  // 로그 관련 함수들
  const fetchLogs = async (page = 1) => {
    if (!selectedBot || !user) return;
    
    setIsLoadingLogs(true);
    try {
      const filename = `bot_user_${user.id}_bot_${selectedBot.id}.log`;
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/system/logs/read-by-name?filename=${filename}&page=${page}&count=${logsPerPage}`);
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.lines || []);
        setTotalLogPages(Math.ceil((data.totalLines || 0) / logsPerPage));
        setCurrentLogPage(page);
      } else {
        setLogs([]);
        setTotalLogPages(0);
      }
    } catch (error) {
      console.error('로그 fetch 실패:', error);
      setLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const navigateMinute = (direction) => {
    if (!logTimeFilter) return;
    
    const currentTime = new Date(logTimeFilter);
    currentTime.setMinutes(currentTime.getMinutes() + direction);
    setLogTimeFilter(currentTime.toISOString().slice(0, 16));
  };

  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    let logsToFilter = allLogsLoaded ? allLogs : logs;
    
    // 검색어 필터
    if (logSearchTerm) {
      logsToFilter = logsToFilter.filter(line => 
        line.toLowerCase().includes(logSearchTerm.toLowerCase())
      );
    }
    
    // 시간 필터 (분 단위)
    if (logTimeFilter) {
      const filterTime = new Date(logTimeFilter);
      const filterMinute = filterTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
      
      logsToFilter = logsToFilter.filter(line => {
        // 로그 라인에서 시간 추출 (예: "2025-07-20 18:02:42")
        const timeMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
        if (timeMatch) {
          const logTime = timeMatch[1].replace(' ', 'T');
          return logTime === filterMinute;
        }
        return false;
      });
    }
    
    return logsToFilter;
  }, [logs, allLogs, allLogsLoaded, logSearchTerm, logTimeFilter]);

  // 선택된 봇이 변경될 때 로그 초기화 및 fetch
  useEffect(() => {
    if (selectedBot) {
      setLogs([]);
      setAllLogs([]);
      setCurrentLogPage(1);
      setTotalLogPages(0);
      setAllLogsLoaded(false);
      setLogSearchTerm('');
      setLogTimeFilter('');
      fetchLogs(1);
    }
  }, [selectedBot]);

  // 로그 모달에서 사용할 함수들
  const fetchModalLogs = async (page = 1) => {
    if (!logModalBot || !user) return;
    
    setIsLoadingLogs(true);
    try {
      const filename = `bot_user_${user.id}_bot_${logModalBot.id}.log`;
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/system/logs/read-by-name?filename=${filename}&page=${page}&count=${logsPerPage}`);
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.lines || []);
        setTotalLogPages(Math.ceil((data.totalLines || 0) / logsPerPage));
        setCurrentLogPage(page);
      } else {
        setLogs([]);
        setTotalLogPages(0);
      }
    } catch (error) {
      console.error('로그 fetch 실패:', error);
      setLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadModalAllLogs = async () => {
    if (!logModalBot || !user || isLoadingAllLogs) return;
    
    setIsLoadingAllLogs(true);
    setAllLogs([]);
    setAllLogsLoaded(false);
    
    try {
      const filename = `bot_user_${user.id}_bot_${logModalBot.id}.log`;
      let page = 1;
      let allLogLines = [];
      let hasMore = true;
      
      while (hasMore) {
        setCurrentLogPage(page);
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/system/logs/read-by-name?filename=${filename}&page=${page}&count=${logsPerPage}`);
        
        if (response.ok) {
          const data = await response.json();
          const lines = data.lines || [];
          
          if (lines.length > 0) {
            allLogLines = [...allLogLines, ...lines];
            setTotalLogPages(Math.ceil((data.totalLines || 0) / logsPerPage));
            
            // 응답받은 lines 갯수가 요청한 count보다 적으면 마지막 페이지
            if (lines.length < logsPerPage) {
              hasMore = false;
            } else {
              page++;
              // 페이지 간 약간의 딜레이
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      setAllLogs(allLogLines);
      setAllLogsLoaded(true);
      
      // 전체 로그 로드 완료 후 스크롤을 맨 아래로 이동
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('전체 로그 로드 실패:', error);
    } finally {
      setIsLoadingAllLogs(false);
    }
  };

  // 스크롤 이동 함수들
  const scrollToTop = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  // 로그 모달이 열릴 때 로그 초기화 및 fetch
  useEffect(() => {
    if (showLogModal && logModalBot) {
      setLogs([]);
      setAllLogs([]);
      setCurrentLogPage(1);
      setTotalLogPages(0);
      setAllLogsLoaded(false);
      setLogSearchTerm('');
      setLogTimeFilter('');
      fetchModalLogs(1);
    }
  }, [showLogModal, logModalBot]);

  // 모달이 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (showLogModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogModal]);

  // 로그 라인 컴포넌트
  const LogLine = ({ line, searchTerm, index }) => {
    const highlightText = (text, search) => {
      if (!search) return text;
      
      const parts = text.split(new RegExp(`(${search})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <span key={i} className="bg-yellow-400 text-black px-1 rounded">{part}</span>
        ) : (
          part
        )
      );
    };

    const getLogLevel = (line) => {
      if (line.includes('ERROR')) return 'text-red-400';
      if (line.includes('WARN')) return 'text-yellow-400';
      if (line.includes('INFO')) return 'text-blue-400';
      if (line.includes('DEBUG')) return 'text-gray-400';
      return 'text-green-400';
    };

    return (
      <div className={`hover:bg-gray-800 px-2 py-1 rounded text-xs ${getLogLevel(line)} whitespace-nowrap`}>
        <span className="text-gray-500 mr-2">{(index + 1).toString().padStart(4, '0')}</span>
        {highlightText(line, searchTerm)}
      </div>
    );
  };

  // 페이지네이션 컴포넌트
  const LogPagination = ({ filteredCount = 0 }) => {
    if (allLogsLoaded) return null; // 전체 로그가 로드된 경우 페이지네이션 숨김
    
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentLogPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalLogPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-muted/10 border-t border-b">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            페이지 {currentLogPage} / {totalLogPages} (총 {filteredCount}개 로그)
          </span>
          {isLoadingLogs && <RefreshCw size={14} className="animate-spin text-primary" />}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => showLogModal ? fetchModalLogs(1) : fetchLogs(1)}
            disabled={currentLogPage === 1 || isLoadingLogs}
            className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-50"
          >
            ≪
          </button>
          <button
            onClick={() => showLogModal ? fetchModalLogs(currentLogPage - 1) : fetchLogs(currentLogPage - 1)}
            disabled={currentLogPage === 1 || isLoadingLogs}
            className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-50"
          >
            ‹
          </button>
          
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => showLogModal ? fetchModalLogs(page) : fetchLogs(page)}
              disabled={isLoadingLogs}
              className={`px-3 py-1 text-sm rounded ${
                page === currentLogPage 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              } disabled:opacity-50`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => showLogModal ? fetchModalLogs(currentLogPage + 1) : fetchLogs(currentLogPage + 1)}
            disabled={currentLogPage === totalLogPages || isLoadingLogs}
            className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-50"
          >
            ›
          </button>
          <button
            onClick={() => showLogModal ? fetchModalLogs(totalLogPages) : fetchLogs(totalLogPages)}
            disabled={currentLogPage === totalLogPages || isLoadingLogs}
            className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-50"
          >
            ≫
          </button>
        </div>
      </div>
    );
  };

  // 비로그인 상태 체크
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LogIn size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-4">봇 관리 기능을 사용하려면 로그인해주세요</p>
          <button onClick={onShowLoginModal} className="btn-primary">
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 메인 컨텐츠 */}
      <main className="px-3 py-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">봇 관리</h1>
            <p className="text-muted-foreground">활성화된 봇들의 상태와 성과를 모니터링하세요</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* DEMO 체크박스 */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDemoFilter}
                onChange={(e) => setIsDemoFilter(e.target.checked)}
                className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">DEMO</span>
            </label>
            <button
              onClick={() => fetchBots()}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2 px-4 py-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? '새로고침 중...' : '새로고침'}</span>
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-red-800 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* 3단 Pane 레이아웃 - 모바일에서는 세로 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 md:h-[calc(100vh-280px)]">
          {/* 1단: 봇 목록 */}
          <div className="col-span-1 md:col-span-3 bg-card rounded-lg border overflow-hidden flex flex-col h-[400px] md:h-auto">
            <div className="p-4 border-b bg-muted/30 flex-shrink-0">
              <h3 className="text-lg font-semibold text-foreground">봇 목록</h3>
              <p className="text-muted-foreground text-sm">총 {apiBots.length}개의 봇</p>
            </div>
            
            {/* 봇 탭 헤더 */}
            <div className="flex border-b bg-muted/10 flex-shrink-0">
              <button
                onClick={() => handleBotTabChange('active')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeBotTab === 'active'
                    ? 'bg-background text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>활성화된 봇</span>
                  <span className="text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded-full">
                    {activeBots.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleBotTabChange('inactive')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeBotTab === 'inactive'
                    ? 'bg-background text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>비활성 봇</span>
                  <span className="text-xs bg-blue-500/20 text-blue-600 px-1.5 py-0.5 rounded-full">
                    {inactiveBots.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleBotTabChange('error')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeBotTab === 'error'
                    ? 'bg-background text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>오류난 봇</span>
                  <span className="text-xs bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded-full">
                    {errorBots.length}
                  </span>
                </div>
              </button>
            </div>

            {/* 일괄 삭제 버튼 - 비활성/오류 봇 탭에서만 표시 */}
            {(activeBotTab === 'inactive' || activeBotTab === 'error') && getDisplayBots().length > 0 && (
              <div className="p-3 border-b bg-muted/30">
                <button
                  onClick={() => handleBatchDelete(activeBotTab)}
                  className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>
                    {activeBotTab === 'inactive' ? '비활성 봇 일괄 삭제' : '오류 봇 일괄 삭제'}
                    ({getDisplayBots().length}개)
                  </span>
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0 max-h-[280px] md:max-h-none">
              {getDisplayBots().map((bot, index) => (
                <motion.div
                  key={`bot-${bot.id || index}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                    selectedBotId === bot.id 
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 shadow-md border-l-4 border-l-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedBotId(bot.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`} />
                      <span className="font-semibold text-foreground">
                        {bot.basic?.symbol?.replace('-SWAP', '').replace('-', '/') || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBgColor(bot.status)}`}>
                        {getStatusText(bot.status)}
                      </span>
                      {bot.status === 'error' && (
                        <AlertTriangle size={12} className="text-red-600" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBot(bot.id);
                        }}
                        disabled={deletingBotId === bot.id}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                        title="봇 삭제"
                      >
                        {deletingBotId === bot.id ? (
                          <RefreshCw size={12} className="animate-spin text-red-600" />
                        ) : (
                          <Trash2 size={12} className="text-red-600 hover:text-red-700" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">봇 ID</span>
                      <span className="text-xs font-mono text-primary font-medium">
                        #{bot.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">봇 이름</span>
                      <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                        {bot.metadata?.name || 'Unnamed Bot'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">방향</span>
                      <span className={`text-xs font-medium ${
                        bot.basic?.direction === 'long' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {bot.basic?.direction === 'long' ? '롱' : '숏'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">레버리지</span>
                      <span className="text-xs font-medium text-foreground">
                        {bot.basic?.leverage}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">투자금액</span>
                      <span className="text-xs font-medium text-foreground">
                        ${bot.total_invested?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">진입 단계</span>
                      <span className="text-xs font-medium text-foreground">
                        {bot.current_step || 0}/{bot.entry?.count || 0}
                      </span>
                    </div>
                    {bot.status === 'error' && bot.last_error && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                        <div className="flex items-start space-x-1">
                          <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{bot.last_error}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 버튼 그룹 - 비활성/오류 봇은 2개, 활성 봇은 1개 */}
                    <div className={`mt-3 flex ${(bot.status === 'inactive' || bot.status === 'error' || bot.status === 'paused' || bot.status === 'completed') ? 'space-x-2' : ''}`}>
                      {/* 로그 확인 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogModalBot(bot);
                          setShowLogModal(true);
                        }}
                        className={`${
                          (bot.status === 'inactive' || bot.status === 'error' || bot.status === 'paused' || bot.status === 'completed') ? 'flex-1' : 'w-full'
                        } px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors flex items-center justify-center space-x-1`}
                      >
                        <FileText size={14} />
                        <span>로그 확인</span>
                      </button>

                      {/* 주문 정리 버튼 - 비활성/오류/일시정지/완료 봇만 표시 */}
                      {(bot.status === 'inactive' || bot.status === 'error' || bot.status === 'paused' || bot.status === 'completed') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCleanupBot(bot);
                          }}
                          className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded transition-colors flex items-center justify-center space-x-1"
                        >
                          <RefreshCw size={14} />
                          <span>주문 정리</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* 더 보기 버튼 */}
              {activeBotTab === 'inactive' && inactiveBots.length > inactiveBotCount && (
                <div className="p-4 border-b">
                  <button
                    onClick={showMoreInactiveBots}
                    className="w-full py-2 px-4 text-sm text-primary hover:bg-primary/10 rounded border border-primary/30 transition-colors"
                  >
                    총 {inactiveBots.length}개, {Math.min(10, inactiveBots.length - inactiveBotCount)}개 추가 표시
                  </button>
                </div>
              )}
              
              {activeBotTab === 'error' && errorBots.length > errorBotCount && (
                <div className="p-4 border-b">
                  <button
                    onClick={showMoreErrorBots}
                    className="w-full py-2 px-4 text-sm text-primary hover:bg-primary/10 rounded border border-primary/30 transition-colors"
                  >
                    총 {errorBots.length}개, {Math.min(10, errorBots.length - errorBotCount)}개 추가 표시
                  </button>
                </div>
              )}
              
              {/* 빈 상태 메시지 */}
              {getDisplayBots().length === 0 && !loading && (
                <div className="p-8 text-center text-muted-foreground">
                  <Bot size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {activeBotTab === 'active' && '활성화된 봇이 없습니다'}
                    {activeBotTab === 'inactive' && '비활성 봇이 없습니다'}
                    {activeBotTab === 'error' && '오류가 발생한 봇이 없습니다'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2단: 주문 목록 */}
          <div className="col-span-1 md:col-span-4 bg-card rounded-lg border h-[400px] md:h-auto overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">주문 현황</h3>
              <p className="text-muted-foreground text-sm">
                {selectedBot ? '실시간 주문 현황' : '봇을 선택해주세요'}
              </p>
            </div>
            
            {selectedBot ? (
                <div className="h-full flex flex-col">
                  {/* 탭 헤더 */}
                  <div className="flex border-b bg-muted/10">
                    <button
                      onClick={() => setActiveOrderTab('pending')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeOrderTab === 'pending'
                          ? 'bg-background text-foreground border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Clock size={16} />
                        <span>현재 포지션 주문 현황</span>
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          {((pendingOrdersData?.pending_orders?.length || 0) +
                            (pendingOrdersData?.tp_sl_orders?.length || 0))}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveOrderTab('filled')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeOrderTab === 'filled'
                          ? 'bg-background text-foreground border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle size={16} />
                                                  <span>주문 체결 히스토리</span>
                        <span className="text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded-full">
                          {orderHistoryData?.orders?.length || 0}
                        </span>
                      </div>
                    </button>
                  </div>
                  
                  {/* 탭 컨텐츠 */}
                  <div className="flex-1 overflow-y-auto pb-4 max-h-[250px] md:max-h-none">
                    {activeOrderTab === 'pending' ? (
                      // 대기중인 주문 탭 (API에서)
                      (() => {
                        if (!pendingOrdersData || pendingOrdersData.total_pending === 0) {
                          return (
                            <div className="p-8 text-center text-muted-foreground">
                              <Clock size={32} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">대기중인 주문이 없습니다</p>
                            </div>
                          );
                        }

                        const categorizedOrders = categorizePendingOrders(pendingOrdersData);

                        return (
                          <div className="p-4 space-y-4">
                            {/* 진입 주문 */}
                            {categorizedOrders.entry.length > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <Target size={16} className="text-blue-500" />
                                  <h4 className="text-sm font-semibold text-foreground">진입 주문</h4>
                                  <span className="text-xs bg-blue-500/20 text-blue-600 px-1.5 py-0.5 rounded-full">
                                    {categorizedOrders.entry.length}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {categorizedOrders.entry.map((order, index) => (
                                    <PendingOrderCard key={`entry-${order.order_id || index}`} order={order} type="entry" direction={pendingOrdersData?.direction} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 익절 주문 */}
                            {categorizedOrders.take_profit.length > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <Zap size={16} className="text-green-500" />
                                  <h4 className="text-sm font-semibold text-foreground">익절 주문</h4>
                                  <span className="text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded-full">
                                    {categorizedOrders.take_profit.length}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {categorizedOrders.take_profit.map((order, index) => (
                                    <PendingOrderCard key={`tp-${order.order_id || index}`} order={order} type="take_profit" direction={pendingOrdersData?.direction} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 손절 주문 */}
                            {categorizedOrders.stop_loss.length > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <Shield size={16} className="text-red-500" />
                                  <h4 className="text-sm font-semibold text-foreground">손절 주문</h4>
                                  <span className="text-xs bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded-full">
                                    {categorizedOrders.stop_loss.length}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {categorizedOrders.stop_loss.map((order, index) => (
                                    <PendingOrderCard key={`sl-${order.order_id || index}`} order={order} type="stop_loss" direction={pendingOrdersData?.direction} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 순환매 주문 */}
                            {categorizedOrders.cycle.length > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <RefreshCw size={16} className="text-purple-500" />
                                  <h4 className="text-sm font-semibold text-foreground">순환매 주문</h4>
                                  <span className="text-xs bg-purple-500/20 text-purple-600 px-1.5 py-0.5 rounded-full">
                                    {categorizedOrders.cycle.length}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {categorizedOrders.cycle.map((order, index) => (
                                    <PendingOrderCard key={`cycle-${order.order_id || index}`} order={order} type="cycle" direction={pendingOrdersData?.direction} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      // 체결된 주문 탭 (API에서)
                      (() => {
                        if (!orderHistoryData || orderHistoryData.total_count === 0) {
                          return (
                            <div className="p-8 text-center text-muted-foreground">
                              <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">체결된 주문 히스토리가 없습니다</p>
                            </div>
                          );
                        }

                        return (
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <CheckCircle size={14} className="text-green-500" />
                                  <span className="text-muted-foreground">체결:</span>
                                  <span className="font-semibold text-green-600">{orderHistoryData.filled_count}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <X size={14} className="text-red-500" />
                                  <span className="text-muted-foreground">취소:</span>
                                  <span className="font-semibold text-red-600">{orderHistoryData.canceled_count}</span>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                총 {orderHistoryData.total_count}건
                              </span>
                            </div>
                            <div className="space-y-2">
                              {orderHistoryData.orders.map((order, index) => (
                                <OrderHistoryCard
                                  key={`history-${order.order_id || order.algo_order_id || index}`}
                                  order={order}
                                  direction={selectedBot?.basic?.direction || 'unknown'}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Eye size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">봇을 선택해주세요</p>
                </div>
              )}
          </div>

          {/* 3단: 봇 설정 및 상세 정보 */}
          <div className="col-span-1 md:col-span-5 bg-card rounded-lg border h-[400px] md:h-auto overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">포지션 현황</h3>
              <p className="text-muted-foreground text-sm">
                {selectedBot ? selectedBot.metadata?.name || '선택된 봇' : '봇을 선택해주세요'}
              </p>
            </div>
            
            {selectedBot ? (
              <div className="overflow-y-auto h-[calc(100%-70px)] p-4 space-y-6 pb-4 max-h-[250px] md:max-h-[calc(100%-70px)]">
                {/* 봇 기본 정보 */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Bot size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">기본 정보</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">봇 이름</span>
                        <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
                          {selectedBot.metadata?.name || 'Unnamed Bot'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">심볼</span>
                        <span className="text-xs font-medium text-foreground">
                          {selectedBot.basic?.symbol?.replace('-SWAP', '').replace('-', '/')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">방향</span>
                        <span className={`text-xs font-medium ${
                          selectedBot.basic?.direction === 'long' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedBot.basic?.direction === 'long' ? '롱' : '숏'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">레버리지</span>
                        <span className="text-xs font-medium text-foreground">
                          {selectedBot.basic?.leverage}x
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">마진 타입</span>
                        <span className="text-xs font-medium text-foreground">
                          {selectedBot.basic?.margin_type === 'isolated' ? '격리' : '교차'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">최대 크기</span>
                        <span className="text-xs font-medium text-foreground">
                          {selectedBot.basic?.max_total_size?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 실시간 포지션 정보 (활성 봇만) */}
                {selectedBot.status !== 'completed' && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">실시간 포지션</span>
                      <div className={`w-2 h-2 rounded-full ${okxConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-muted-foreground">
                        {okxConnected ? `연결됨 (${positions.length}개 포지션)` : '연결안됨'}
                      </span>
                    </div>
                    
                    {(() => {
                      const position = getBotPosition(selectedBot);
                      if (!position) {
                        return (
                          <div className="text-center py-4 text-muted-foreground">
                            <Activity size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">포지션 정보가 없습니다</p>
                            <p className="text-xs mt-2">
                              봇 심볼: {selectedBot.basic?.symbol || '없음'}
                            </p>
                            <p className="text-xs">
                              전체 포지션: {positions.length}개
                            </p>
                            {positions.length > 0 && (
                              <p className="text-xs">
                                포지션 심볼들: {positions.map(p => p.instId).join(', ')}
                              </p>
                            )}
                          </div>
                        );
                      }
                      
                      const unrealizedPnl = parseFloat(position.upl || 0);
                      const unrealizedPnlPercent = parseFloat(position.uplRatio || 0) * 100;
                      const markPrice = parseFloat(position.markPx || 0);
                      const avgPrice = parseFloat(position.avgPx || 0);
                      
                      return (
                        <div className="space-y-4">
                          {/* 🔥 메인 PnL 강조 영역 */}
                          <div className={`relative overflow-hidden rounded-lg border-2 p-4 ${
                            unrealizedPnl >= 0
                              ? 'bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30'
                              : 'bg-gradient-to-br from-red-500/10 to-red-600/20 border-red-500/30'
                          }`}>
                            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                              {unrealizedPnl >= 0 ? (
                                <ArrowUpRight size={80} className="text-green-500" />
                              ) : (
                                <ArrowDownRight size={80} className="text-red-500" />
                              )}
                            </div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <DollarSign size={16} className={unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'} />
                                  <span className="text-sm font-medium text-muted-foreground">미실현 PnL</span>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-black ${
                                    unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {unrealizedPnl >= 0 ? '+' : ''}${Math.abs(unrealizedPnl).toFixed(2)}
                                  </div>
                                  <div className={`text-lg font-bold ${
                                    unrealizedPnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
                                  }`}>
                                    {unrealizedPnlPercent >= 0 ? '+' : ''}{unrealizedPnlPercent.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 포지션 상세 정보 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Gauge size={12} />
                                    <span>포지션 크기 (USDT)</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ${parseFloat(position.notionalUsd || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Target size={12} />
                                    <span>평균 진입가</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ${avgPrice.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Activity size={12} />
                                    <span>현재가</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ${markPrice.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <DollarSign size={12} />
                                    <span>명목 가치 (USD)</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ${parseFloat(position.notionalUsd || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <TrendingUp size={12} />
                                    <span>지수 가격</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ${parseFloat(position.idxPx || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Zap size={12} />
                                    <span>최근 거래가</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ${parseFloat(position.last || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className={`rounded-lg p-3 border-2 ${
                                position.posSide === 'long' 
                                  ? 'bg-green-500/10 border-green-500/30' 
                                  : 'bg-red-500/10 border-red-500/30'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    {position.posSide === 'long' ? (
                                      <TrendingUp size={12} />
                                    ) : (
                                      <TrendingDown size={12} />
                                    )}
                                    <span>포지션 방향</span>
                                  </span>
                                  <span className={`text-sm font-black ${
                                    position.posSide === 'long' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {position.posSide === 'long' ? '🚀 롱' : '📉 숏'}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Settings size={12} />
                                    <span>레버리지</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    {position.lever || 'N/A'}x
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Shield size={12} />
                                    <span>마진 모드</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    {position.mgnMode === 'isolated' ? '격리' : '교차'}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Percent size={12} />
                                    <span>마진 비율</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    {parseFloat(position.mgnRatio || 0).toFixed(2)}%
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <AlertTriangle size={12} />
                                    <span>청산가</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ${parseFloat(position.liqPx || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-card/50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                    <Clock size={12} />
                                    <span>ADL 순위</span>
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    {position.adl || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 마진 및 수수료 정보 */}
                          <div className="bg-muted/20 rounded-lg p-3 border border-dashed">
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-muted-foreground">사용 마진</div>
                                <div className="font-bold text-foreground">${parseFloat(position.margin || 0).toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">유지 마진</div>
                                <div className="font-bold text-foreground">${parseFloat(position.mmr || 0).toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">초기 마진</div>
                                <div className="font-bold text-foreground">${parseFloat(position.imr || 0).toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">수수료</div>
                                <div className="font-bold text-foreground">${parseFloat(position.fee || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          </div>

                          {/* PnL 상세 정보 */}
                          <div className="bg-muted/20 rounded-lg p-3 border border-dashed">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-muted-foreground">실현 손익</div>
                                <div className={`font-bold ${parseFloat(position.realizedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ${parseFloat(position.realizedPnl || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">펀딩 수수료</div>
                                <div className="font-bold text-foreground">${parseFloat(position.fundingFee || 0).toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">청산 페널티</div>
                                <div className="font-bold text-foreground">${parseFloat(position.liqPenalty || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          </div>

                          {/* 기타 정보 */}
                          <div className="bg-muted/20 rounded-lg p-3 border border-dashed">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-muted-foreground">포지션 ID</div>
                                <div className="font-bold text-foreground font-mono text-[10px]">
                                  {position.posId || 'N/A'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground">거래 ID</div>
                                <div className="font-bold text-foreground font-mono text-[10px]">
                                  {position.tradeId || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 완료되지 않은 봇의 상세 설정 */}
                {selectedBot.status !== 'completed' && (
                  <>
                    {/* 진입 설정 */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Layers size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">진입 설정</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">진입 타입</span>
                            <span className="text-xs font-medium text-foreground">
                              {selectedBot.entry?.type === 'limit' ? '지정가' : '시장가'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">진입 횟수</span>
                            <span className="text-xs font-medium text-foreground">
                              {selectedBot.entry?.count}회
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">자동 수량</span>
                            <span className="text-xs font-medium text-foreground">
                              {selectedBot.entry?.auto_amount ? '활성' : '비활성'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">리스크 관리</span>
                            <span className="text-xs font-medium text-foreground">
                              {selectedBot.entry?.risk_management?.enabled ? '활성' : '비활성'}
                            </span>
                          </div>
                          {selectedBot.entry?.risk_management?.enabled && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">트리거 단계</span>
                                <span className="text-xs font-medium text-foreground">
                                  {selectedBot.entry?.risk_management?.step}단계
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">트리거 타입</span>
                                <span className="text-xs font-medium text-foreground">
                                  {selectedBot.entry?.risk_management?.trigger_type === 'immediate' ? '즉시' : '지연'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 익절/손절 설정 */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Target size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">익절/손절 설정</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">익절</span>
                            <span className="text-xs font-medium text-green-600">
                              {selectedBot.exit?.take_profit}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">손절</span>
                            <span className="text-xs font-medium text-red-600">
                              {selectedBot.exit?.stop_loss?.enabled ? `${selectedBot.exit.stop_loss.value}%` : '비활성'}
                            </span>
                          </div>
                          {selectedBot.exit?.stop_loss?.enabled && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">봇 종료 시</span>
                              <span className="text-xs font-medium text-foreground">
                                {selectedBot.exit?.stop_loss?.on_bot_end ? '활성' : '비활성'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 성과 지표 */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart3 size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">성과 지표</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">총 투자금액</span>
                        <span className="text-xs font-medium text-foreground">
                          ${selectedBot.total_invested?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">총 거래</span>
                        <span className="text-xs font-medium text-foreground">
                          {selectedBot.total_trades || 0}회
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">성공 거래</span>
                        <span className="text-xs font-medium text-green-600">
                          {selectedBot.successful_trades || 0}회
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">총 수익</span>
                        <span className={`text-xs font-medium ${
                          (selectedBot.total_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${(selectedBot.total_profit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">평균 진입가</span>
                        <span className="text-xs font-medium text-foreground">
                          ${selectedBot.average_entry_price?.toLocaleString() || '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">현재 단계</span>
                        <span className="text-xs font-medium text-foreground">
                          {selectedBot.current_step || 0}/{selectedBot.entry?.count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 시간 정보 */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">시간 정보</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">시작 시간</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedBot.started_at ? new Date(selectedBot.started_at).toLocaleString() : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">종료 시간</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedBot.ended_at ? new Date(selectedBot.ended_at).toLocaleString() : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">마지막 실행</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedBot.last_execution_at ? new Date(selectedBot.last_execution_at).toLocaleString() : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">생성 시간</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedBot.created_at ? new Date(selectedBot.created_at).toLocaleString() : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex space-x-2">
                  {selectedBot.status === 'completed' ? (
                    // 완료된 봇의 버튼들
                    <>
                      <button 
                        onClick={() => deleteBot(selectedBot.id)}
                        disabled={deletingBotId === selectedBot.id}
                        className="btn-destructive flex-1 flex items-center justify-center space-x-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingBotId === selectedBot.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span>{deletingBotId === selectedBot.id ? '삭제 중...' : '삭제'}</span>
                      </button>
                    </>
                  ) : (
                    // 활성/일시정지/오류 상태 봇의 버튼들
                    <>
                      <button 
                        onClick={() => completeBot(selectedBot.id)}
                        disabled={completingBotId === selectedBot.id}
                        className="btn-primary flex-1 flex items-center justify-center space-x-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completingBotId === selectedBot.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        <span>{completingBotId === selectedBot.id ? '완료 중...' : '완료'}</span>
                      </button>
                      <button 
                        onClick={() => completeBotWithClosePosition(selectedBot.id)}
                        disabled={completingWithClosePositionBotId === selectedBot.id}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {completingWithClosePositionBotId === selectedBot.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Target size={14} />
                        )}
                        <span className="text-xs">{completingWithClosePositionBotId === selectedBot.id ? '처리 중...' : '포지션 닫고 봇 완료'}</span>
                      </button>
                      <button 
                        onClick={() => deleteBot(selectedBot.id)}
                        disabled={deletingBotId === selectedBot.id}
                        className="btn-destructive flex items-center justify-center space-x-2 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingBotId === selectedBot.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span>{deletingBotId === selectedBot.id ? '삭제 중...' : '삭제'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bot size={32} className="mx-auto mb-2 opacity-50" />
                <p>봇을 선택해주세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 로그 모달 */}
        {showLogModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowLogModal(false)}
          >
                         <div 
               className="bg-card rounded-lg border w-full h-full max-w-[95vw] max-h-[90vh] flex flex-col"
               onClick={(e) => e.stopPropagation()}
             >
              {/* 모달 헤더 */}
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">봇 로그</h3>
                  <p className="text-muted-foreground text-sm">
                    {logModalBot?.metadata?.name || '선택된 봇'}의 실시간 로그
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* 검색 기능 */}
                  <div className="flex items-center space-x-2">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="로그 검색..."
                      value={logSearchTerm}
                      onChange={(e) => setLogSearchTerm(e.target.value)}
                      disabled={isLoadingAllLogs}
                      className="px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  
                  {/* 시간 필터 */}
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <input
                      type="datetime-local"
                      value={logTimeFilter}
                      onChange={(e) => setLogTimeFilter(e.target.value)}
                      disabled={isLoadingAllLogs}
                      className="px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                    <button
                      onClick={() => navigateMinute(-1)}
                      disabled={isLoadingAllLogs}
                      className="p-1 hover:bg-muted rounded disabled:opacity-50"
                      title="이전 분"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => navigateMinute(1)}
                      disabled={isLoadingAllLogs}
                      className="p-1 hover:bg-muted rounded disabled:opacity-50"
                      title="다음 분"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  {/* 전체 로그 로드 버튼 */}
                  <button
                    onClick={loadModalAllLogs}
                    disabled={isLoadingAllLogs}
                    className="flex items-center space-x-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/80 disabled:opacity-50"
                  >
                    {isLoadingAllLogs ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>전체 로그 로딩중...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>전체 로그 로드</span>
                      </>
                    )}
                  </button>
                  
                  {/* 닫기 버튼 */}
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="p-2 hover:bg-muted rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* 모달 컨텐츠 */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* 상단 페이지네이션 */}
                <LogPagination filteredCount={filteredLogs.length} />
                
                {/* 로딩 상태 */}
                {isLoadingAllLogs && (
                  <div className="flex-1 flex items-center justify-center bg-muted/10">
                    <div className="text-center">
                      <RefreshCw size={32} className="mx-auto mb-4 animate-spin text-primary" />
                      <p className="text-sm font-medium text-foreground">전체 로그 받아오는 중...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        페이지 {currentLogPage} / {totalLogPages > 0 ? totalLogPages : '?'} 로딩중
                      </p>
                      <div className="w-48 bg-muted rounded-full h-2 mt-3 mx-auto">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: totalLogPages > 0 ? `${(currentLogPage / totalLogPages) * 100}%` : '10%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 로그 내용 */}
                {!isLoadingAllLogs && (
                  <div 
                    ref={logContainerRef}
                    className="flex-1 overflow-y-auto overflow-x-auto p-4 bg-gray-900 text-green-400 font-mono text-sm min-h-0 relative"
                  >
                    {filteredLogs.length > 0 ? (
                      <div className="space-y-1">
                        {filteredLogs.map((line, index) => (
                          <LogLine 
                            key={`${currentLogPage}-${index}`} 
                            line={line} 
                            searchTerm={logSearchTerm}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <FileText size={32} className="mx-auto mb-2 opacity-50" />
                          <p>로그가 없습니다</p>
                          {logSearchTerm && <p className="text-xs mt-1">검색어 '{logSearchTerm}'에 해당하는 로그가 없습니다</p>}
                        </div>
                      </div>
                    )}
                    
                    {/* 플로팅 스크롤 버튼 */}
                    <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                      <button
                        onClick={scrollToTop}
                        className="p-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
                        title="맨 위로"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={scrollToBottom}
                        className="p-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
                        title="맨 아래로"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 하단 페이지네이션 */}
                <LogPagination filteredCount={filteredLogs.length} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BotManagementPage; 
