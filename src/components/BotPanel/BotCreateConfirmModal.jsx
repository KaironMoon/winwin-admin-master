import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Brain, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';

const BotCreateConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  settings, 
  entryData, 
  isCreating,
  reverseEnabled = false,
  reverseSettings = {}
}) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    }).format(price);
  };

  const convertOKXFormatToDisplay = (okxSymbol) => {
    return okxSymbol.replace('-SWAP', '').replace('-', '/');
  };

  const calculateTotalAmount = () => {
    return entryData.reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getDirectionText = (direction) => {
    return direction === 'long' ? '롱' : '숏';
  };

  const getMarginTypeText = (marginType) => {
    return marginType === 'isolated' ? '격리' : '교차';
  };

  const getEntryTypeText = (entryType) => {
    const types = {
      'market': '시장가',
      'ai': 'AI 진입',
      'limit': '지정가'
    };
    return types[entryType] || entryType;
  };

  const getEntryTypeConfig = (entryType) => {
    switch (entryType) {
      case 'limit':
        return {
          icon: Target,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-300 dark:border-blue-700'
        };
      case 'market':
        return {
          icon: Zap,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-300 dark:border-green-700'
        };
      case 'ai':
        return {
          icon: Brain,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
          borderColor: 'border-purple-300 dark:border-purple-700'
        };
      default:
        return {
          icon: Target,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-300 dark:border-gray-700'
        };
    }
  };

  const getFirstEntryAmount = () => {
    if (entryData.length > 0) {
      return entryData[0].amount;
    }
    return 0;
  };

  const getLastEntryPrice = () => {
    if (entryData.length > 0) {
      return entryData[entryData.length - 1].price;
    }
    // 수동 계산: 첫 진입가 + (진입횟수-1) * 가격편차
    const priceChange = (settings.entryCount - 1) * (settings.priceDeviation / 100) * settings.firstEntryPrice;
    return settings.direction === 'long' 
      ? settings.firstEntryPrice - priceChange 
      : settings.firstEntryPrice + priceChange;
  };

  const calculateExpectedPnL = () => {
    const takeProfitPercent = settings.takeProfit * settings.leverage;
    return takeProfitPercent;
  };

  const getReentryBudgetTypeText = (type) => {
    return type === 'fixed' ? '고정 예산' : '복리 재투자';
  };

  const entryTypeConfig = getEntryTypeConfig(settings.entryType);
  const EntryTypeIcon = entryTypeConfig.icon;

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                봇 생성 확인
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              설정한 내용을 확인하고 봇을 생성하세요
            </p>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                기본 정보
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">심볼</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {convertOKXFormatToDisplay(settings.symbol)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">방향</span>
                  <p className={`font-semibold ${settings.direction === 'long' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {getDirectionText(settings.direction)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">레버리지</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {settings.leverage}x
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">마진 타입</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {getMarginTypeText(settings.marginType)}
                  </p>
                </div>
              </div>
              
              {/* 자동 재진입 설정 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">자동 재진입</span>
                  </div>
                  
                  {/* 자동 재진입 상태 버튼 */}
                  <div className="flex items-center space-x-2">
                    {settings.autoReentryEnabled ? (
                      <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                        {settings.reentryBudgetType === 'fixed' ? (
                          <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                        <span className="font-semibold text-sm text-green-600 dark:text-green-400">
                          {getReentryBudgetTypeText(settings.reentryBudgetType)}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700">
                        <span className="font-semibold text-sm text-red-600 dark:text-red-400">
                          자동 재진입 설정 안됨
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

                        {/* 진입 설정 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  진입 설정
                </h3>
                
                {/* 진입 타입 버튼 */}
                <div className="flex items-center space-x-2">
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${entryTypeConfig.bgColor} ${entryTypeConfig.borderColor}`}>
                    <EntryTypeIcon size={16} className={entryTypeConfig.color} />
                    <span className={`font-semibold text-sm ${entryTypeConfig.color}`}>
                      {getEntryTypeText(settings.entryType)}
                    </span>
                  </div>
                  
                  {/* AI 스타일 버튼 (AI 진입인 경우) */}
                  {settings.entryType === 'ai' && (
                    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${entryTypeConfig.bgColor} ${entryTypeConfig.borderColor}`}>
                      <span className={`font-semibold text-sm ${entryTypeConfig.color}`}>
                        {settings.aiStyle === 'aggressive' ? '민첩한' : 
                         settings.aiStyle === 'balanced' ? '침착한' : '신중한'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">1단 진입:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${formatPrice(settings.firstEntryPrice)} (${formatNumber(getFirstEntryAmount())})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">최종 진입:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${formatPrice(getLastEntryPrice())} ({settings.entryCount}단)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">총 사용 금액:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    ${formatNumber(calculateTotalAmount())}
                  </span>
                </div>
              </div>
            </div>



            {/* 리스크 매니징 트리거 설정 */}
            {settings.cycleEnabled && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    리스크 매니징 트리거
                  </h3>
                  
                  {/* 트리거 옵션 버튼 */}
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                      settings.triggerType === 'immediate' 
                        ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                        : 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                    }`}>
                      <span className={`font-semibold text-sm ${
                        settings.triggerType === 'immediate' 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-purple-600 dark:text-purple-400'
                      }`}>
                        {settings.triggerType === 'immediate' ? '무조건 트리거' : 'AI 트리거'}
                      </span>
                    </div>
                    
                    {/* AI 트리거 스타일 버튼 (AI 트리거인 경우) */}
                    {settings.triggerType === 'ai' && (
                      <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700">
                        <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                          {settings.aiTriggerStyle === 'safe' ? '세이프' : 
                           settings.aiTriggerStyle === 'balance' ? '밸런스' : '부스트'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">트리거 포인트</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {settings.cycleStep}단
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 익절/손절 설정 */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                익절/손절 설정
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">익절</span>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {settings.takeProfit}%
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (예상 PnL: {formatNumber(calculateExpectedPnL())}% x 해당 시점의 총 진입금액)
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">손절</span>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {settings.stopLossEnabled ? `${settings.stopLoss}%` : '비활성화'}
                  </p>
                </div>
                {settings.stopLossEnabled && settings.stopLossOnBotEnd && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">손절 시 봇 종료</span>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      활성화
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 양방설정 */}
            {reverseEnabled && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  양방설정 (반대방향 자동 생성)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">생성 조건</span>
                    <p className="font-semibold text-purple-600 dark:text-purple-400">
                      {reverseSettings.creationStep}단계 거래 성립 시
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">반대방향</span>
                    <p className={`font-semibold ${settings.direction === 'long' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {settings.direction === 'long' ? '숏' : '롱'} 봇 생성
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">진입방식</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {getEntryTypeText(reverseSettings.entryType)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">진입횟수</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {reverseSettings.entryCount}회
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">가격편차</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {reverseSettings.priceDeviation}%
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">익절</span>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {reverseSettings.takeProfit}%
                    </p>
                  </div>
                  {reverseSettings.stopLossEnabled && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">손절</span>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {reverseSettings.stopLoss}%
                      </p>
                    </div>
                  )}
                  {reverseSettings.cycleEnabled && (
                    <div className={reverseSettings.stopLossEnabled ? '' : 'col-span-2'}>
                      <span className="text-sm text-gray-600 dark:text-gray-400">리스크매니징</span>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">
                        {reverseSettings.cycleStep}단계부터 활성화
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>자동 생성:</strong> 기본 봇이 {reverseSettings.creationStep}단계 거래를 완료하면 
                    {settings.direction === 'long' ? '숏' : '롱'} 방향의 독립적인 봇이 자동으로 생성됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 py-3 px-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={isCreating}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>생성 중...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>봇 만들기</span>
                </div>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default BotCreateConfirmModal; 