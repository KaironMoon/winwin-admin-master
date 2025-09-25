import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw,
  Target as TargetIcon, 
  Zap, 
  Brain, 
  RotateCcw,
  Shield as ShieldIcon,
  Clock as ClockIcon,
  Rocket as RocketIcon
} from 'lucide-react';
import { formatNumber } from '../../lib/botUtils';

const ReverseSettingsSection = ({ 
  reverseEnabled,
  reverseSettings,
  onToggleReverse,
  onReverseInputChange,
  onToggleReverseCycle,
  onToggleReverseStopLoss,
  onToggleReverseStopLossOnBotEnd,
  maxReverseEntryCount,
  currentDirection
}) => {
  const getEntryTypeDescription = () => {
    switch (reverseSettings.entryType) {
      case 'limit':
        return {
          text: '설정된 진입가에 지정된 가격으로 주문을 넣습니다.',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'market':
        return {
          text: '설정된 진입가에 가격에 도달한 경우 1분 이내로 시장가 주문을 넣습니다.',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'ai':
        return {
          text: '설정된 진입가에 가격이 도달한 이후부턴 AI가 판단하여 시장가 주문을 넣습니다.',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800'
        };
      default:
        return {
          text: '',
          color: '',
          bgColor: '',
          borderColor: ''
        };
    }
  };

  const aiStyles = [
    {
      id: 'aggressive',
      label: '민첩한',
      description: '신뢰도 10% 초과시 진입',
      icon: RocketIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-300 dark:border-orange-700',
      selectedBgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      id: 'balanced',
      label: '침착한',
      description: '신뢰도 50% 초과시 진입',
      icon: ShieldIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-300 dark:border-blue-700',
      selectedBgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'conservative',
      label: '신중한',
      description: '신뢰도 99% 초과시 진입',
      icon: ClockIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-300 dark:border-green-700',
      selectedBgColor: 'bg-green-100 dark:bg-green-900/30'
    }
  ];

  const description = getEntryTypeDescription();
  const oppositeDirection = currentDirection === 'long' ? '숏(Short)' : '롱(Long)';

  return (
    <div className="space-y-3 mb-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>양방설정</span>
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleReverse}
          className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            reverseEnabled
              ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
          }`}
        >
          <RefreshCw size={12} />
          <span>{reverseEnabled ? 'ON' : 'OFF'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {reverseEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-6 space-y-4 overflow-hidden"
          >
            {/* 방향 표시 */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                {reverseSettings.creationStep}단계 거래 성립 시 반대방향 {oppositeDirection} 봇이 자동 생성됩니다
              </p>
            </div>

            {/* 생성단계 설정 */}
            <div className="space-y-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-foreground mb-1">생성단계</label>
              <input
                type="number"
                min="1"
                max={Math.max(1, maxReverseEntryCount)}
                defaultValue={reverseSettings.creationStep}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const maxValue = Math.max(1, maxReverseEntryCount);
                  const finalValue = Math.min(Math.max(1, value), maxValue);
                  onReverseInputChange('creationStep', finalValue);
                  e.target.value = finalValue;
                }}
                className="input h-8 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                기본 봇의 {reverseSettings.creationStep}단계 거래가 성립되면 반대방향 봇이 자동 생성됩니다 (최대: {Math.max(1, maxReverseEntryCount)}단계)
              </p>
            </div>

            {/* 진입 방식 */}
            <div className="space-y-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-foreground mb-2">반대방향 진입방식</label>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onReverseInputChange('entryType', 'limit')}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                    reverseSettings.entryType === 'limit'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-border bg-card hover:border-blue-300 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <TargetIcon size={16} />
                    <span className="text-xs font-medium">지정가</span>
                    <span className="text-xs opacity-75">Limit Order</span>
                  </div>
                  {reverseSettings.entryType === 'limit' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onReverseInputChange('entryType', 'market')}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                    reverseSettings.entryType === 'market'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'border-border bg-card hover:border-green-300 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <Zap size={16} />
                    <span className="text-xs font-medium">시장가</span>
                    <span className="text-xs opacity-75">Market Order</span>
                  </div>
                  {reverseSettings.entryType === 'market' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onReverseInputChange('entryType', 'ai')}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                    reverseSettings.entryType === 'ai'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'border-border bg-card hover:border-purple-300 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <Brain size={16} />
                    <span className="text-xs font-medium">AI</span>
                    <span className="text-xs opacity-75">AI Optimized</span>
                  </div>
                  {reverseSettings.entryType === 'ai' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </motion.button>
              </div>

              {/* 진입 방식 설명 */}
              {description.text && (
                <div className={`p-3 rounded-lg border ${description.bgColor} ${description.borderColor}`}>
                  <p className={`text-xs ${description.color} font-medium`}>
                    {description.text}
                  </p>
                </div>
              )}

              {/* AI 스타일 선택 */}
              {reverseSettings.entryType === 'ai' && (
                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">AI 스타일</label>
                  <div className="flex space-x-1">
                    {aiStyles.map((style) => {
                      const IconComponent = style.icon;
                      const isSelected = reverseSettings.aiStyle === style.id;
                      
                      return (
                        <motion.button
                          key={style.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onReverseInputChange('aiStyle', style.id)}
                          className={`relative flex-1 py-2 px-3 rounded-md border transition-all duration-200 group ${
                            isSelected
                              ? `${style.borderColor} ${style.selectedBgColor} ${style.color}`
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          title={style.description}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <IconComponent size={14} />
                            <span className="text-xs font-medium">{style.label}</span>
                          </div>
                          {isSelected && (
                            <div className={`absolute -top-1 -right-1 w-2 h-2 ${style.color.replace('text-', 'bg-')} rounded-full`}>
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 진입 횟수 및 가격 편차 */}
            <div className="grid grid-cols-1 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">반대방향 진입횟수</label>
                <input
                  type="text"
                  value={formatNumber(reverseSettings.entryCount)}
                  onChange={(e) => onReverseInputChange('entryCount', e.target.value)}
                  className="input h-8 text-sm"
                  max={maxReverseEntryCount}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  최대: {maxReverseEntryCount}회 (1단당 $1 초과 필요)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">반대방향 가격편차 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={reverseSettings.priceDeviation}
                  onChange={(e) => onReverseInputChange('priceDeviation', parseFloat(e.target.value) || 0)}
                  className="input h-8 text-sm"
                />
              </div>
            </div>

            {/* 리스크 매니징 설정 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">반대방향 리스크매니징</label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onToggleReverseCycle}
                  className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    reverseSettings.cycleEnabled
                      ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <RotateCcw size={12} />
                  <span>{reverseSettings.cycleEnabled ? 'ON' : 'OFF'}</span>
                </motion.button>
              </div>

              {reverseSettings.cycleEnabled && (
                <div className="ml-4 space-y-2">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">트리거 포인트</label>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, reverseSettings.entryCount - 1)}
                      defaultValue={reverseSettings.cycleStep}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const maxValue = Math.max(1, reverseSettings.entryCount - 1);
                        const finalValue = Math.min(Math.max(1, value), maxValue);
                        onReverseInputChange('cycleStep', finalValue);
                        e.target.value = finalValue;
                      }}
                      className="input h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      최대: {Math.max(1, reverseSettings.entryCount - 1)}단 (진입 횟수 미만)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 양방설정 전용 익절/손절 설정 */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">반대방향 익절/손절 설정</h4>
              
              <div className="ml-4 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">익절 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={reverseSettings.takeProfit}
                    onChange={(e) => onReverseInputChange('takeProfit', parseFloat(e.target.value) || 0)}
                    className="input h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-foreground">손절 사용</label>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={reverseSettings.stopLossEnabled}
                        onChange={onToggleReverseStopLoss}
                        className="sr-only"
                        id="reverseStopLossToggle"
                      />
                      <label
                        htmlFor="reverseStopLossToggle"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                          reverseSettings.stopLossEnabled
                            ? 'bg-red-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                            reverseSettings.stopLossEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </label>
                    </div>
                  </div>

                  {reverseSettings.stopLossEnabled && (
                    <div className="ml-4 space-y-2">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">손절 (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={reverseSettings.stopLoss}
                          onChange={(e) => onReverseInputChange('stopLoss', parseFloat(e.target.value) || 0)}
                          className="input h-8 text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-foreground">손절시 봇 종료</label>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={reverseSettings.stopLossOnBotEnd}
                            onChange={onToggleReverseStopLossOnBotEnd}
                            className="sr-only"
                            id="reverseStopLossOnBotEndToggle"
                          />
                          <label
                            htmlFor="reverseStopLossOnBotEndToggle"
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                              reverseSettings.stopLossOnBotEnd
                                ? 'bg-red-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                reverseSettings.stopLossOnBotEnd ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReverseSettingsSection;