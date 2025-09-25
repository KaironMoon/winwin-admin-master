import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target as TargetIcon, 
  Zap, 
  Brain, 
  RotateCcw,
  Shield as ShieldIcon,
  Clock as ClockIcon,
  Rocket as RocketIcon,
  AlertTriangle as AlertTriangleIcon,
  Scale as ScaleIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { formatNumber } from '../../lib/botUtils';

const EntrySettingsSection = ({ 
  settings, 
  onInputChange, 
  onToggleCycle, 
  onToggleAutoEntryAmount,
  maxEntryCount
}) => {
  const getEntryTypeDescription = () => {
    switch (settings.entryType) {
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

  return (
    <div className="space-y-3 mb-3">
      <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
        <TargetIcon size={16} />
        <span>진입 설정</span>
      </h3>

      <div className="ml-6 space-y-4">
        {/* 진입 방식 아이콘 버튼 */}
        <div className="space-y-2 pb-3 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-foreground mb-2">진입 방식</label>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onInputChange('entryType', 'limit')}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                settings.entryType === 'limit'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-border bg-card hover:border-blue-300 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <TargetIcon size={16} />
                <span className="text-xs font-medium">지정가</span>
                <span className="text-xs opacity-75">Limit Order</span>
              </div>
              {settings.entryType === 'limit' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onInputChange('entryType', 'market')}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                settings.entryType === 'market'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'border-border bg-card hover:border-green-300 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Zap size={16} />
                <span className="text-xs font-medium">시장가</span>
                <span className="text-xs opacity-75">Market Order</span>
              </div>
              {settings.entryType === 'market' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onInputChange('entryType', 'ai')}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                settings.entryType === 'ai'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'border-border bg-card hover:border-purple-300 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Brain size={16} />
                <span className="text-xs font-medium">AI</span>
                <span className="text-xs opacity-75">AI Optimized</span>
              </div>
              {settings.entryType === 'ai' && (
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

          {/* AI 추가 설정 */}
          {settings.entryType === 'ai' && (
            <div className="space-y-2">
              <label className="block text-xs text-muted-foreground">AI 스타일</label>
              <div className="flex space-x-1">
                {aiStyles.map((style) => {
                  const IconComponent = style.icon;
                  const isSelected = settings.aiStyle === style.id;
                  
                  return (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onInputChange('aiStyle', style.id)}
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
                        <div className={`absolute -top-1 -right-1 w-2 h-2 ${style.color.replace('text-', 'bg-')} rounded-full flex items-center justify-center`}>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      )}
                      
                      {/* 툴팁 */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {style.description}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">진입 횟수</label>
            <input
              type="text"
              value={formatNumber(settings.entryCount)}
              onChange={(e) => onInputChange('entryCount', e.target.value)}
              className="input h-8 text-sm"
              max={maxEntryCount}
            />
            <p className="text-xs text-muted-foreground mt-1">
              최대: {maxEntryCount}회 (1단당 $1 초과 필요)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">가격 편차 (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={settings.priceDeviation}
              onChange={(e) => onInputChange('priceDeviation', parseFloat(e.target.value) || 0)}
              className="input h-8 text-sm"
            />
          </div>
        </div>

        {/* 순환매 설정 */}
        <div className="space-y-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-foreground">리스크 매니징 트리거</label>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleCycle}
              className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                settings.cycleEnabled
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
              }`}
            >
              <RotateCcw size={12} />
              <span>{settings.cycleEnabled ? 'ON' : 'OFF'}</span>
            </motion.button>
          </div>

          {settings.cycleEnabled && (
            <div className="ml-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">트리거 포인트</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, settings.entryCount - 1)}
                  defaultValue={settings.cycleStep}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const maxValue = Math.max(1, settings.entryCount - 1);
                    const finalValue = Math.min(Math.max(1, value), maxValue);
                    onInputChange('cycleStep', finalValue);
                    e.target.value = finalValue;
                  }}
                  className="input h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  최대: {Math.max(1, settings.entryCount - 1)}단 (진입 횟수 미만)
                </p>
              </div>

              {/* 트리거 옵션 라디오 버튼 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground mb-2">트리거 옵션</label>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onInputChange('triggerType', 'immediate')}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      settings.triggerType === 'immediate'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-border bg-card hover:border-blue-300 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        settings.triggerType === 'immediate'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {settings.triggerType === 'immediate' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">무조건 트리거</div>
                        <div className="text-xs opacity-75">지정한 트리거 포인트를 다른 조건 없이 실행</div>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onInputChange('triggerType', 'ai')}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      settings.triggerType === 'ai'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'border-border bg-card hover:border-purple-300 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        settings.triggerType === 'ai'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {settings.triggerType === 'ai' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">AI 트리거</div>
                        <div className="text-xs opacity-75">지정한 트리거 단의 가격 도달 이후부터 AI가 판단하여 리스크 관리</div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* AI 트리거 스타일 옵션 */}
                {settings.triggerType === 'ai' && (
                  <div className="space-y-2 mt-3">
                    <label className="block text-xs text-muted-foreground">AI 스타일</label>
                    <div className="flex space-x-2">
                      {[
                        { 
                          id: 'safe', 
                          label: '세이프', 
                          color: 'green',
                          icon: AlertTriangleIcon,
                          tooltip: '10% 이상의 신뢰도로 위험 감지시 트리거'
                        },
                        { 
                          id: 'balance', 
                          label: '밸런스', 
                          color: 'blue',
                          icon: ScaleIcon,
                          tooltip: '50% 이상의 신뢰도로 위험 감지시 트리거'
                        },
                        { 
                          id: 'boost', 
                          label: '부스트', 
                          color: 'orange',
                          icon: TrendingUpIcon,
                          tooltip: '99% 이상의 신뢰도로 위험 감지시 트리거'
                        }
                      ].map((style) => {
                        const IconComponent = style.icon;
                        const isSelected = settings.aiTriggerStyle === style.id;
                        const colorClasses = {
                          green: {
                            selected: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                            default: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-muted-foreground hover:text-foreground hover:border-green-300'
                          },
                          blue: {
                            selected: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                            default: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-muted-foreground hover:text-foreground hover:border-blue-300'
                          },
                          orange: {
                            selected: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
                            default: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-muted-foreground hover:text-foreground hover:border-orange-300'
                          }
                        };

                        return (
                          <motion.button
                            key={style.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onInputChange('aiTriggerStyle', style.id)}
                            className={`relative flex-1 py-2 px-3 rounded-md border transition-all duration-200 group ${
                              isSelected
                                ? colorClasses[style.color].selected
                                : colorClasses[style.color].default
                            }`}
                            title={style.tooltip}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <IconComponent size={14} />
                              <span className="text-xs font-medium">{style.label}</span>
                            </div>
                            
                            {/* 툴팁 */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {style.tooltip}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 진입가 자동설정 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-foreground">진입가 자동설정</label>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.autoEntryAmount}
                onChange={onToggleAutoEntryAmount}
                className="sr-only"
                id="autoEntryToggle"
              />
              <label
                htmlFor="autoEntryToggle"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.autoEntryAmount
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    settings.autoEntryAmount ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrySettingsSection; 