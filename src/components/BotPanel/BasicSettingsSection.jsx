import React, { useState, useEffect, useRef } from 'react';
import { Settings, ArrowUp, ArrowDown, ChevronDown, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import { formatNumber, getActiveSymbols } from '../../lib/botUtils';
import OKXApi from '../../lib/okxApi';

const BasicSettingsSection = ({ 
  settings, 
  onInputChange, 
  onDirectionChange, 
  onMarginTypeChange, 
  onSymbolChange,
  user,
  balance = 0,
  usageAmount = '',
  onUsageAmountChange,
  isUsageAmountValid = true
}) => {
  const [symbols, setSymbols] = useState([]);
  const [activeSymbols, setActiveSymbols] = useState([]);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 심볼 목록 로드
  useEffect(() => {
    const initializeSymbols = async () => {
      setIsLoading(true);
      try {
        // OKX API 인스턴스 생성 (공개 API이므로 인증 정보 없이)
        const okxApi = new OKXApi();
        const futuresSymbols = await okxApi.getFuturesSymbols();
        setSymbols(futuresSymbols);
        
        // 로그인된 사용자인 경우에만 활성 심볼 로드
        let activeSymbolsList = [];
        if (user) {
          activeSymbolsList = await loadActiveSymbols();
        }
        
        // 기본값이 설정되지 않은 경우 적절한 기본값 설정
        if (!settings.symbol) {
          const defaultSymbol = getDefaultSymbol(futuresSymbols, activeSymbolsList);
          if (defaultSymbol) {
            onInputChange('symbol', defaultSymbol.instId);
            onSymbolChange(defaultSymbol.displayName);
          }
        }
      } catch (error) {
        console.error('심볼 초기화 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSymbols();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // user를 의존성 배열에 추가

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSymbolDropdownOpen(false);
        setSearchTerm(''); // 검색어 초기화
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSymbolDropdownOpen(false);
        setSearchTerm(''); // 검색어 초기화
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loadActiveSymbols = async () => {
    try {
      const activeSymbolsList = await getActiveSymbols();
      setActiveSymbols(activeSymbolsList);
      return activeSymbolsList;
    } catch (error) {
      console.error('활성 심볼 로드 실패:', error);
      return [];
    }
  };

  // 기본 심볼 선택 로직
  const getDefaultSymbol = (symbolsList, activeSymbolsList) => {
    // USDT 페어만 필터링
    const usdtSymbols = symbolsList.filter(s => s.instId.includes('-USDT-SWAP'));
    
    // 1. BTC-USDT-SWAP이 사용 가능한지 확인
    const btcUsdt = usdtSymbols.find(s => s.instId === 'BTC-USDT-SWAP');
    if (btcUsdt && !activeSymbolsList.includes('BTC-USDT-SWAP')) {
      return btcUsdt;
    }
    
    // 2. BTC-USDT-SWAP이 사용 중이면 다음 사용 가능한 심볼 찾기
    const availableSymbols = usdtSymbols.filter(s => !activeSymbolsList.includes(s.instId));
    
    // 3. USDT 페어 중에서 인기 있는 순서로 정렬
    const popularSymbols = ['BTC-USDT-SWAP', 'ETH-USDT-SWAP', 'SOL-USDT-SWAP', 'ADA-USDT-SWAP'];
    
    for (const popularSymbol of popularSymbols) {
      const symbol = availableSymbols.find(s => s.instId === popularSymbol);
      if (symbol) {
        return symbol;
      }
    }
    
    // 4. 사용 가능한 첫 번째 USDT 심볼 반환
    return availableSymbols[0] || null;
  };

  // 검색 필터링된 심볼 목록 (USDT 페어만)
  const filteredSymbols = symbols.filter(symbol => {
    const isUsdtPair = symbol.instId.includes('-USDT-SWAP');
    const matchesSearch = symbol.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         symbol.instId.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = activeSymbols.includes(symbol.instId);
    return isUsdtPair && matchesSearch && !isActive;
  });

  // 현재 선택된 심볼 정보
  const selectedSymbol = symbols.find(s => s.instId === settings.symbol);

  const handleSymbolSelect = (symbol) => {
    // OKX API 형식으로 저장 (실제 봇 생성에 사용)
    onInputChange('symbol', symbol.instId);
    
    // 표시 형식으로 차트에 전달 (TradingView에서 사용)
    const displaySymbol = symbol.displayName;
    onSymbolChange(displaySymbol);
    
    setIsSymbolDropdownOpen(false);
    setSearchTerm('');
  };

  const handleSymbolChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isSymbolDropdownOpen) {
      setIsSymbolDropdownOpen(true);
    }
  };

  // 입력 필드에 표시할 값
  const inputValue = searchTerm || (selectedSymbol ? selectedSymbol.displayName : '');

  const toggleAutoReentry = () => {
    onInputChange('autoReentryEnabled', !settings.autoReentryEnabled);
  };

  return (
    <div className="space-y-3 mb-3">
      <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
        <Settings size={16} />
        <span>기본 설정</span>
      </h3>

      <div className="ml-6 space-y-4">
        {/* 사용할 금액 및 총 증거금 */}
        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-semibold mb-1 ${
                !isUsageAmountValid ? 'text-red-600 dark:text-red-400' : 'text-foreground'
              }`}>
                사용할 금액 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={usageAmount}
                onChange={(e) => onUsageAmountChange && onUsageAmountChange(e.target.value)}
                className={`input text-sm px-3 w-full ${
                  !isUsageAmountValid 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' 
                    : ''
                }`}
                placeholder="이번 봇에서 사용할 금액을 입력하세요"
              />
              <p className={`text-xs mt-1 ${
                !isUsageAmountValid 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-muted-foreground'
              }`}>
                {!isUsageAmountValid 
                  ? '사용할 금액을 입력해주세요' 
                  : '이번 봇에서 사용할 금액'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">총 증거금 (OKX)</label>
              <input
                type="text"
                value={formatNumber(settings.totalMargin || balance)}
                readOnly
                className="input text-sm px-3 w-full bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                placeholder="OKX 계정 잔액"
              />
              <p className="text-xs text-muted-foreground mt-1">
                현재 OKX 계정 증거금 잔액
              </p>
            </div>
          </div>
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400">
            <p>• 사용할 금액: 이번 봇에서 사용할 투자 금액 (레버리지 적용 전)</p>
            <p>• 총 증거금: OKX 계정의 현재 증거금 잔액</p>
            {usageAmount && (
              <p>• 현재 레버리지 {settings.leverage}x 기준: 실제 투자금 ${formatNumber(parseFloat(usageAmount.replace(/,/g, '') || 0) / settings.leverage)}</p>
            )}
          </div>
        </div>

        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-foreground mb-1">심볼</label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
                              <input
                  type="text"
                  value={inputValue}
                  onChange={handleSymbolChange}
                  onFocus={() => setIsSymbolDropdownOpen(true)}
                  placeholder="심볼 검색..."
                  className="input text-sm px-3 pr-10 w-full"
                  disabled={isLoading}
                />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
                <ChevronDown 
                  size={16} 
                  className={`transition-transform ${isSymbolDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {isSymbolDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredSymbols.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {searchTerm ? '검색 결과가 없습니다.' : '심볼을 불러오는 중...'}
                  </div>
                ) : (
                  <>
                    {filteredSymbols.map((symbol) => (
                      <div
                        key={symbol.instId}
                        onClick={() => handleSymbolSelect(symbol)}
                        className="px-3 py-2 text-sm hover:bg-accent cursor-pointer flex justify-between items-center"
                      >
                        <span>{symbol.displayName}</span>
                        <span className="text-xs text-muted-foreground">{symbol.instId}</span>
                      </div>
                    ))}
                  </>
                )}
                
                {/* 사용 중인 심볼 표시 (USDT 페어만) */}
                {activeSymbols.length > 0 && (
                  <>
                    <div className="border-t border-border mt-2 pt-2">
                      <div className="px-3 py-1 text-xs text-muted-foreground font-medium">
                        사용 중인 심볼
                      </div>
                      {symbols
                        .filter(symbol => activeSymbols.includes(symbol.instId) && symbol.instId.includes('-USDT-SWAP'))
                        .map((symbol) => (
                          <div
                            key={symbol.instId}
                            className="px-3 py-2 text-sm text-muted-foreground flex justify-between items-center cursor-not-allowed"
                          >
                            <span>{symbol.displayName}</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">봇 사용중</span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="md:col-span-5">
            <label className="block text-sm font-semibold text-foreground mb-1">방향</label>
            <div className="flex space-x-1">
              <button
                onClick={() => onDirectionChange('long')}
                className={`flex-1 input h-8 flex items-center justify-center space-x-1 text-xs ${
                  settings.direction === 'long' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600' 
                    : 'border-border'
                }`}
              >
                <ArrowUp size={12} />
                <span>롱</span>
              </button>
              <button
                onClick={() => onDirectionChange('short')}
                className={`flex-1 input h-8 flex items-center justify-center space-x-1 text-xs ${
                  settings.direction === 'short' 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600' 
                    : 'border-border'
                }`}
              >
                <ArrowDown size={12} />
                <span>숏</span>
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-foreground mb-1">레버리지</label>
            <input
              type="text"
              value={formatNumber(settings.leverage)}
              onChange={(e) => onInputChange('leverage', e.target.value)}
              className="input h-8 text-sm"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block text-sm font-semibold text-foreground mb-1">마진 타입</label>
            <div className="flex space-x-1">
              <button
                onClick={() => onMarginTypeChange('isolated')}
                className={`flex-1 input h-8 flex items-center justify-center text-xs ${
                  settings.marginType === 'isolated' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600' 
                    : 'border-border'
                }`}
              >
                <span>격리</span>
              </button>
              <button
                onClick={() => onMarginTypeChange('cross')}
                className={`flex-1 input h-8 flex items-center justify-center text-xs ${
                  settings.marginType === 'cross' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600' 
                    : 'border-border'
                }`}
              >
                <span>크로스</span>
              </button>
            </div>
          </div>
        </div>

        {/* 자동 재진입 설정 */}
        <div className="space-y-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-foreground flex items-center space-x-2">
              <RefreshCw size={16} />
              <span>자동 재진입</span>
            </label>
            <button
              onClick={toggleAutoReentry}
              className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                settings.autoReentryEnabled
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
              }`}
            >
              <span>{settings.autoReentryEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {settings.autoReentryEnabled && (
            <div className="ml-4 space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">예산 옵션</label>
              <div className="space-y-2">
                <button
                  onClick={() => onInputChange('reentryBudgetType', 'fixed')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    settings.reentryBudgetType === 'fixed'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-border bg-card hover:border-blue-300 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      settings.reentryBudgetType === 'fixed'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {settings.reentryBudgetType === 'fixed' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} />
                      <div>
                        <div className="font-medium text-sm">지정된 예산 및 사이즈를 고정적으로 재진입</div>
                        <div className="text-xs opacity-75">설정한 예산과 진입 사이즈를 그대로 유지</div>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onInputChange('reentryBudgetType', 'percentage')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    settings.reentryBudgetType === 'percentage'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'border-border bg-card hover:border-green-300 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      settings.reentryBudgetType === 'percentage'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {settings.reentryBudgetType === 'percentage' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp size={16} />
                      <div>
                        <div className="font-medium text-sm">수익금을 재투자하여 복리 방식으로 재진입</div>
                        <div className="text-xs opacity-75">이전 수익을 포함하여 점진적으로 사이즈 증가</div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicSettingsSection; 