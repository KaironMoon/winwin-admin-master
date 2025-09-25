import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { calculateStopLoss } from '../../lib/botUtils';

const TakeProfitStopLossSection = ({ 
  settings, 
  onInputChange, 
  onToggleStopLossEnabled, 
  onToggleStopLossOnBotEnd,
  breakEvenPoint
}) => {
  const { minStopLoss } = calculateStopLoss(settings.entryCount, settings.priceDeviation);

  return (
    <div className="space-y-3 mb-3">
      <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
        <AlertTriangle size={16} />
        <span>익절/손절 설정</span>
      </h3>

      <div className="ml-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              익절 (%)
              <span className="text-xs text-muted-foreground font-normal ml-1">소수점 입력 가능</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={settings.takeProfit}
              onChange={(e) => onInputChange('takeProfit', parseFloat(e.target.value) || 0)}
              className="input h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              예상 PnL: {settings.takeProfit}% × {settings.leverage} = {(settings.takeProfit * settings.leverage).toFixed(1)}%
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              손절 (%)
              <span className="text-xs text-muted-foreground font-normal ml-1">소수점 입력 가능</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={settings.stopLossEnabled ? settings.stopLoss : ''}
                onChange={(e) => onInputChange('stopLoss', parseFloat(e.target.value) || 0)}
                className={`input h-8 text-sm ${!settings.stopLossEnabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                disabled={!settings.stopLossEnabled}
                placeholder={!settings.stopLossEnabled ? '미사용' : '0.0'}
              />
            </div>
            {settings.stopLossEnabled && (
              <p className="text-xs text-muted-foreground mt-1">
                최소: {minStopLoss}% (자동 계산)
              </p>
            )}
          </div>
        </div>

        {/* 손절 사용 토글 */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-foreground">손절 사용</label>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.stopLossEnabled}
              onChange={onToggleStopLossEnabled}
              className="sr-only"
              id="stopLossToggle"
            />
            <label
              htmlFor="stopLossToggle"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                settings.stopLossEnabled
                  ? 'bg-red-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  settings.stopLossEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </label>
          </div>
        </div>

        {/* 손절시 봇 종료 토글 */}
        {settings.stopLossEnabled && (
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-foreground">손절시 봇 종료</label>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.stopLossOnBotEnd}
                onChange={onToggleStopLossOnBotEnd}
                className="sr-only"
                id="stopLossOnBotEndToggle"
              />
              <label
                htmlFor="stopLossOnBotEndToggle"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                  settings.stopLossOnBotEnd
                    ? 'bg-red-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    settings.stopLossOnBotEnd ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeProfitStopLossSection; 