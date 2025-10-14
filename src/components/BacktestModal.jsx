import React, { useState } from 'react';
import { X, BarChart3, Calendar, Play, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Clock, DollarSign, Activity, Target, RefreshCw, Shield, Filter, SortAsc, ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { authenticatedFetch } from '../lib/authUtils';
import config from '../config';

const BacktestModal = ({ isOpen, onClose, settings, entryData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [isRunning, setIsRunning] = useState(false);
  const [backtestResult, setBacktestResult] = useState(null);
  const [expandedInstances, setExpandedInstances] = useState(new Set());
  
  // 필터링 및 페이지네이션 상태
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'win', 'loss'
  const [sortBy, setSortBy] = useState('time'); // 'time', 'pnl_desc', 'pnl_asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const itemsPerPage = 10;

  const periodOptions = [
    { value: '1m', label: '1개월', days: 30 },
    { value: '3m', label: '3개월', days: 90 },
    { value: '6m', label: '6개월', days: 180 },
    { value: '1y', label: '1년', days: 365 }
  ];

  // 기간을 분 단위로 변환
  const getTestingPeriodInMinutes = (period) => {
    const option = periodOptions.find(opt => opt.value === period);
    return option ? option.days * 24 * 60 : 30 * 24 * 60; // 기본값 1개월
  };

  // 설정을 API 요청 형식으로 변환
  const formatRequestData = (testingPeriod) => {
    // entryData를 API 형식으로 변환
    const formattedEntryData = entryData.map((entry, index) => ({
      step: entry.step || index + 1,
      price: entry.price,
      amount: entry.amount,
      type: settings.entryType || 'market'
    }));

    return {
      testing_period: testingPeriod,
      basic: {
        symbol: settings.symbol,
        direction: settings.direction,
        leverage: parseInt(settings.leverage),
        margin_type: settings.marginType,
        max_total_size: parseFloat(settings.maxTotalSize),
        auto_reentry: {
          enabled: settings.autoReentryEnabled,
          budget_type: settings.reentryBudgetType
        }
      },
      entry: {
        type: settings.entryType,
        count: parseInt(settings.entryCount),
        auto_amount: settings.autoEntryAmount,
        data: formattedEntryData,
        risk_management: {
          enabled: settings.cycleEnabled,
          step: parseInt(settings.cycleStep),
          trigger_type: settings.triggerType || 'immediate',
          ai_trigger_style: settings.aiTriggerStyle || 'balance'
        }
      },
      exit: {
        take_profit: parseFloat(settings.takeProfit),
        stop_loss: {
          enabled: settings.stopLossEnabled,
          value: settings.stopLossEnabled ? parseFloat(settings.stopLoss) : 0,
          on_bot_end: settings.stopLossEnabled ? settings.stopLossOnBotEnd : false
        }
      },
      metadata: {
        name: `${settings.symbol} ${settings.direction === 'long' ? '롱' : '숏'} 마틴게일 봇`,
        description: `${settings.symbol} ${settings.direction === 'long' ? '롱' : '숏'} 마틴게일 봇 - ${settings.entryCount}회 진입, ${settings.leverage}x 레버리지`
      }
    };
  };

  const handleRunBacktest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setBacktestResult(null);
    
    try {
      const testingPeriod = getTestingPeriodInMinutes(selectedPeriod);
      const requestData = formatRequestData(testingPeriod);
      
      
      
      const response = await authenticatedFetch(`${config.API_BASE_URL}/api/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      
      if (result.success) {
        setBacktestResult(result.result);
      } else {
        throw new Error(result.message || '백테스트 실행 중 오류가 발생했습니다.');
      }
      
    } catch (error) {
      console.error('백테스트 실패:', error);
      alert(`백테스트 실행 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    // 모든 상태 초기화
    setSelectedPeriod('1m');
    setIsRunning(false);
    setBacktestResult(null);
    setExpandedInstances(new Set());
    setStatusFilter('all');
    setSortBy('time');
    setCurrentPage(1);
    setDateFrom('');
    setDateTo('');
    onClose();
  };

  // 다시 테스트하기 핸들러
  const handleResetTest = () => {
    setBacktestResult(null);
    setExpandedInstances(new Set());
    setStatusFilter('all');
    setSortBy('time');
    setCurrentPage(1);
    setDateFrom('');
    setDateTo('');
  };

  // 아코디언 토글
  const toggleInstance = (instanceId) => {
    const newExpanded = new Set(expandedInstances);
    if (newExpanded.has(instanceId)) {
      newExpanded.delete(instanceId);
    } else {
      newExpanded.add(instanceId);
    }
    setExpandedInstances(newExpanded);
  };

  // 총 PnL 계산
  const calculateTotalPnl = () => {
    if (!backtestResult?.bot_instances) return 0;
    return backtestResult.bot_instances.reduce((sum, instance) => sum + instance.final_pnl, 0);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 숫자 포맷팅 (소수점 2자리)
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // 숫자 포맷팅 (콤마만, 소수점 없음)
  const formatNumberWithComma = (num) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
  };

  // 필터링 및 정렬된 봇 인스턴스 가져오기
  const getFilteredAndSortedInstances = () => {
    if (!backtestResult?.bot_instances) return [];

    let filtered = [...backtestResult.bot_instances];

    // 상태 필터링
    if (statusFilter === 'win') {
      filtered = filtered.filter(instance => instance.final_pnl > 0);
    } else if (statusFilter === 'loss') {
      filtered = filtered.filter(instance => instance.final_pnl < 0);
    }

    // 날짜 필터링
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(instance => new Date(instance.start_time) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // 해당 날짜 끝까지
      filtered = filtered.filter(instance => new Date(instance.start_time) <= toDate);
    }

    // 정렬
    switch (sortBy) {
      case 'pnl_desc':
        filtered.sort((a, b) => b.final_pnl - a.final_pnl);
        break;
      case 'pnl_asc':
        filtered.sort((a, b) => a.final_pnl - b.final_pnl);
        break;
      case 'time':
      default:
        filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        break;
    }

    return filtered;
  };

  // 페이지네이션된 데이터
  const getPaginatedInstances = () => {
    const filtered = getFilteredAndSortedInstances();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // 총 페이지 수
  const getTotalPages = () => {
    const filtered = getFilteredAndSortedInstances();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedInstances(new Set()); // 페이지 변경시 아코디언 닫기
  };

  // 페이지네이션 범위 계산
  const getPaginationRange = () => {
    const totalPages = getTotalPages();
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);
    
    // 끝에서 부족한 페이지가 있으면 시작점을 앞으로 이동
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                백테스트
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                과거 데이터로 전략 성능을 검증하세요
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 백테스트 결과가 없을 때 */}
          {!backtestResult && (
            <div className="p-6">
              {/* 현재 설정 요약 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  백테스트 설정 요약
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* 기본 설정 */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h5 className="text-base font-semibold text-gray-900 dark:text-white">기본 설정</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">심볼</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{settings.symbol}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">방향</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settings.direction === 'long' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {settings.direction === 'long' ? '롱' : '숏'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">레버리지</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{settings.leverage}x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">마진 타입</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {settings.marginType === 'isolated' ? '격리' : '크로스'}
                        </span>
                      </div>
                                              <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">총 투입 사이즈</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">${formatNumberWithComma(settings.maxTotalSize)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">총 투입 증거금</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">${formatNumberWithComma(settings.totalMargin || settings.maxTotalSize)}</span>
                        </div>
                    </div>
                  </div>

                  {/* 진입 설정 */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h5 className="text-base font-semibold text-gray-900 dark:text-white">진입 설정</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">진입 방식</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settings.entryType === 'market' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : settings.entryType === 'limit'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {settings.entryType === 'market' ? '시장가' : settings.entryType === 'limit' ? '지정가' : 'AI'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">진입 횟수</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{settings.entryCount}회</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">가격 편차</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{settings.priceDeviation}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">자동 수량</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settings.autoEntryAmount 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {settings.autoEntryAmount ? '활성' : '비활성'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">순환매</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settings.cycleEnabled 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {settings.cycleEnabled ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 자동 재진입 설정 */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h5 className="text-base font-semibold text-gray-900 dark:text-white">자동 재진입</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">재진입</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settings.autoReentryEnabled 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {settings.autoReentryEnabled ? '활성' : '비활성'}
                        </span>
                      </div>
                      {settings.autoReentryEnabled && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">예산 옵션</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            settings.reentryBudgetType === 'fixed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {settings.reentryBudgetType === 'fixed' ? '고정' : '복리'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">트리거 타입</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settings.triggerType === 'immediate' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' 
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {settings.triggerType === 'immediate' ? '즉시' : 'AI'}
                        </span>
                      </div>
                      {settings.triggerType === 'ai' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">AI 스타일</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            settings.aiTriggerStyle === 'safe' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : settings.aiTriggerStyle === 'balance'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}>
                            {settings.aiTriggerStyle === 'safe' ? '안전' : 
                             settings.aiTriggerStyle === 'balance' ? '균형' : '부스트'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 익절/손절 설정 */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-5 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h5 className="text-base font-semibold text-gray-900 dark:text-white">익절/손절</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">익절</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{settings.takeProfit}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">손절</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settings.stopLossEnabled 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {settings.stopLossEnabled ? `${settings.stopLoss}%` : '비활성'}
                        </span>
                      </div>
                      {settings.stopLossEnabled && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">손절시 봇 종료</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            settings.stopLossOnBotEnd 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {settings.stopLossOnBotEnd ? '활성' : '비활성'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">손익분기점</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(settings.leverage / 10)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 백테스트 기간 선택 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  백테스트 기간 선택
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {periodOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPeriod === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="period"
                        value={option.value}
                        checked={selectedPeriod === option.value}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.days}일
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 테스트 수행 버튼 */}
              <button
                onClick={handleRunBacktest}
                disabled={isRunning}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                  isRunning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    백테스트 실행 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    테스트 수행
                  </>
                )}
              </button>
            </div>
          )}

          {/* 백테스트 결과 */}
          {backtestResult && (
            <div className="p-6">
              {/* 백테스트 결과 요약 */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  백테스트 결과
                </h4>
                
                {/* 핵심 지표 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* 총 회차 */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatNumberWithComma(backtestResult.bot_instances?.length || 0)}회
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">총 진입</div>
                      </div>
                    </div>
                  </div>

                  {/* 승률 */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatNumberWithComma(backtestResult.bot_instances ? 
                            backtestResult.bot_instances.filter(instance => instance.final_pnl > 0).length : 0)}승
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">수익</div>
                      </div>
                    </div>
                  </div>

                  {/* 손실 횟수 */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {formatNumberWithComma(backtestResult.bot_instances ? 
                            backtestResult.bot_instances.filter(instance => instance.final_pnl < 0).length : 0)}패
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">손실</div>
                      </div>
                    </div>
                  </div>

                  {/* 총 수익률 */}
                  <div className={`rounded-lg p-4 border ${
                    calculateTotalPnl() >= 0 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {calculateTotalPnl() >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <div className={`text-lg font-bold ${
                          calculateTotalPnl() >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {calculateTotalPnl() >= 0 ? '+' : ''}{formatNumber(calculateTotalPnl())}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">수익률</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 필터 및 정렬 */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* 상태 필터 */}
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <div className="flex space-x-1">
                        {[
                          { value: 'all', label: '전체' },
                          { value: 'win', label: '승' },
                          { value: 'loss', label: '패' }
                        ].map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => {
                              setStatusFilter(filter.value);
                              setCurrentPage(1);
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              statusFilter === filter.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 정렬 */}
                    <div className="flex items-center space-x-2">
                      <SortAsc className="w-4 h-4 text-gray-500" />
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 rounded text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                      >
                        <option value="time">시간 순</option>
                        <option value="pnl_desc">수익 높은 순</option>
                        <option value="pnl_asc">손실 높은 순</option>
                      </select>
                    </div>

                    {/* 날짜 필터 */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 rounded text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                        placeholder="시작일"
                      />
                      <span className="text-xs text-gray-500">~</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 rounded text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                        placeholder="종료일"
                      />
                    </div>
                  </div>
                </div>

                {/* 봇 인스턴스 목록 */}
                <div className="space-y-2">
                  {getPaginatedInstances().map((instance, index) => (
                    <div key={instance.bot_id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {/* 아코디언 헤더 */}
                      <button
                        onClick={() => toggleInstance(instance.bot_id)}
                        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {expandedInstances.has(instance.bot_id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              #{(currentPage - 1) * itemsPerPage + index + 1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(instance.start_time)}</span>
                            </div>
                            <span>→</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(instance.end_time)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            instance.final_pnl >= 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {instance.final_pnl >= 0 ? '+' : ''}{formatNumber(instance.final_pnl)}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            ${formatNumberWithComma(instance.final_balance)}
                          </div>
                        </div>
                      </button>

                      {/* 아코디언 내용 - 거래 내역 */}
                      {expandedInstances.has(instance.bot_id) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <div className="p-3">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              거래 내역 ({instance.trades?.length || 0}건)
                            </h5>
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                              {instance.trades?.map((trade, tradeIndex) => (
                                <div key={tradeIndex} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center space-x-3">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                                      {trade.step}단계
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {formatDate(trade.timestamp)}
                                    </div>
                                    <div className={`px-1 py-0.5 rounded text-xs font-medium ${
                                      trade.action === 'buy' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    }`}>
                                      {trade.action === 'buy' ? '매수' : '매도'}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 text-xs">
                                    <div className="text-gray-600 dark:text-gray-400">
                                      ${formatNumberWithComma(trade.price)}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                      {formatNumber(trade.amount)}
                                    </div>
                                    <div className={`font-medium ${
                                      trade.pnl >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {trade.pnl >= 0 ? '+' : ''}{formatNumber(trade.pnl)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {getTotalPages() > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getFilteredAndSortedInstances().length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, getFilteredAndSortedInstances().length)}개 표시
                    </div>
                    <div className="flex items-center space-x-1">
                      {/* 맨 처음으로 */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="첫 페이지"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      
                      {/* 이전 페이지 */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="이전 페이지"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      {/* 페이지 번호들 */}
                      <div className="flex items-center space-x-1">
                        {/* 첫 페이지가 범위에 없으면 표시 */}
                        {getPaginationRange()[0] > 1 && (
                          <>
                            <button
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                              1
                            </button>
                            {getPaginationRange()[0] > 2 && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                          </>
                        )}
                        
                        {/* 현재 범위의 페이지들 */}
                        {getPaginationRange().map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              page === currentPage
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        {/* 마지막 페이지가 범위에 없으면 표시 */}
                        {getPaginationRange()[getPaginationRange().length - 1] < getTotalPages() && (
                          <>
                            {getPaginationRange()[getPaginationRange().length - 1] < getTotalPages() - 1 && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(getTotalPages())}
                              className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                              {getTotalPages()}
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* 다음 페이지 */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === getTotalPages()}
                        className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="다음 페이지"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      
                      {/* 맨 마지막으로 */}
                      <button
                        onClick={() => handlePageChange(getTotalPages())}
                        disabled={currentPage === getTotalPages()}
                        className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="마지막 페이지"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 다시 테스트하기 버튼 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleResetTest}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  다시 테스트하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacktestModal; 