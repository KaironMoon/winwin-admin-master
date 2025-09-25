import React from 'react';
import { RotateCcw, ArrowDown, Target as TargetIcon } from 'lucide-react';
import { formatNumber } from '../../lib/botUtils';

const EntryPriceList = ({ 
  settings, 
  entryData, 
  onManualAmountChange, 
  onManualPriceChange, 
  onManualPercentageChange,
  calculateEntryPrices,
  calculateTotalManualAmount,
  balance
}) => {
  const getTotalAmount = () => {
    if (settings.autoEntryAmount) {
      return parseFloat(settings.maxTotalSize || settings.firstEntryAmount);
    } else {
      return calculateTotalManualAmount();
    }
  };

  const totalAmount = getTotalAmount();
  const maxTotalSize = settings.maxTotalSize || balance;
  const isOverBalance = totalAmount > maxTotalSize;
  const difference = totalAmount - maxTotalSize;

  // 트리거 포인트 확인 함수
  const isCyclePoint = (step) => {
    return settings.cycleEnabled && step === settings.cycleStep;
  };

  // 순환매 구간 표시 함수
  const isInCycleRange = (step) => {
    return settings.cycleEnabled && step > settings.cycleStep;
  };

  return (
    <div className="space-y-3 mb-3">
      <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
        <TargetIcon size={16} />
        <span>진입가 목록</span>
      </h3>
      <div className="ml-6 space-y-2">
        {settings.autoEntryAmount ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground text-right w-full">
                총합: ${formatNumber(settings.maxTotalSize || settings.firstEntryAmount)}
              </span>
            </div>
            {isOverBalance && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  설정된 사이즈의 총합이 잔고보다 ${formatNumber(difference.toFixed(2))} 더 큽니다.
                </p>
              </div>
            )}
            <div className="space-y-2">
              {(() => {
                const prices = calculateEntryPrices();
                return prices.map((entry, index) => {
                  const isTriggerPoint = isCyclePoint(entry.step);
                  const inCycleRange = isInCycleRange(entry.step);
                  
                  return (
                    <div key={entry.step}>
                      <div className={`flex items-center space-x-2 ${
                        isTriggerPoint ? 'bg-orange-50 dark:bg-orange-900/20 rounded px-2 py-1' : ''
                      } ${inCycleRange ? 'bg-blue-50 dark:bg-blue-900/10 rounded px-2 py-1' : ''}`}>
                        <span className={`text-xs text-muted-foreground w-8 ${
                          isTriggerPoint ? 'font-medium text-orange-600 dark:text-orange-400' : ''
                        } ${inCycleRange ? 'font-medium text-blue-600 dark:text-blue-400' : ''}`}>
                          #{entry.step}
                          {isTriggerPoint && <RotateCcw size={10} className="inline ml-1" />}
                          {inCycleRange && <ArrowDown size={10} className="inline ml-1" />}
                        </span>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                                                  <div>
                          <span className="text-xs text-muted-foreground">가격</span>
                          <div className="text-xs font-medium">
                            {settings.entryType === 'market' ? '시장가' : `$${formatNumber(parseFloat(entry.price.toFixed(2)))}`}
                          </div>
                        </div>
                          <div>
                            <span className="text-xs text-muted-foreground">%</span>
                            <div className="text-xs font-medium">{entry.percentage.toFixed(1)}%</div>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">사이즈(USDT)</span>
                            <div className="text-xs font-medium">{formatNumber(parseFloat(entry.amount.toFixed(2)))}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 트리거 포인트 아래 순환매 구간 표시 바 */}
                      {isTriggerPoint && (
                        <div className="ml-8 mt-1 mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div className="flex-1 h-1 bg-orange-200 dark:bg-orange-800 rounded-full"></div>
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              리스크 매니징 구간 시작
                            </span>
                          </div>
                                                  <p className="text-xs text-muted-foreground mt-1 ml-4">
                          이 단부터 리스크 매니징으로 포지션 사이즈 관리
                        </p>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground text-right w-full">
                총합: ${formatNumber(calculateTotalManualAmount().toFixed(2))}
              </span>
            </div>
            {isOverBalance && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  설정된 사이즈의 총합이 잔고보다 ${formatNumber(difference.toFixed(2))} 더 큽니다.
                </p>
              </div>
            )}
            <div className="space-y-2">
              {calculateEntryPrices().map((entry, index) => {
                const isTriggerPoint = isCyclePoint(entry.step);
                const inCycleRange = isInCycleRange(entry.step);
                
                return (
                  <div key={entry.step}>
                    <div className={`flex items-center space-x-2 ${
                      isTriggerPoint ? 'bg-orange-50 dark:bg-orange-900/20 rounded px-2 py-1' : ''
                    } ${inCycleRange ? 'bg-blue-50 dark:bg-blue-900/10 rounded px-2 py-1' : ''}`}>
                      <span className={`text-xs text-muted-foreground w-8 ${
                        isTriggerPoint ? 'font-medium text-orange-600 dark:text-orange-400' : ''
                      } ${inCycleRange ? 'font-medium text-blue-600 dark:text-blue-400' : ''}`}>
                        #{entry.step}
                        {isTriggerPoint && <RotateCcw size={10} className="inline ml-1" />}
                        {inCycleRange && <ArrowDown size={10} className="inline ml-1" />}
                      </span>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">가격</span>
                          {settings.entryType === 'market' ? (
                            <div className="input h-6 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center cursor-not-allowed">
                              시장가
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={formatNumber(parseFloat(entry.price.toFixed(2)))}
                              onChange={(e) => onManualPriceChange(index, e.target.value)}
                              className="input h-6 text-xs"
                              placeholder="0"
                            />
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">%</span>
                          {settings.entryType === 'market' ? (
                            <div className="input h-6 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center cursor-not-allowed">
                              {entry.percentage.toFixed(1)}%
                            </div>
                          ) : (
                            <input
                              type="number"
                              step="0.1"
                              value={entry.percentage.toFixed(1)}
                              onChange={(e) => onManualPercentageChange(index, e.target.value)}
                              className="input h-6 text-xs"
                              placeholder="0"
                            />
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">사이즈(USDT)</span>
                          <input
                            type="text"
                            value={formatNumber(parseFloat(entry.amount.toFixed(2)))}
                            onChange={(e) => onManualAmountChange(index, e.target.value)}
                            className={`input h-6 text-xs ${entry.isError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                            placeholder="0"
                          />
                          {entry.isError && (
                            <p className="text-xs text-red-500 mt-1">증거금 초과</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 트리거 포인트 아래 순환매 구간 표시 바 */}
                    {isTriggerPoint && (
                      <div className="ml-8 mt-1 mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div className="flex-1 h-1 bg-orange-200 dark:bg-orange-800 rounded-full"></div>
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            리스크 매니징 구간 시작
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-4">
                          이 단부터 리스크 매니징으로 포지션 사이즈 관리
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryPriceList; 