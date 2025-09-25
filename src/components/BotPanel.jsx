import React, { useState, useEffect, useCallback, useMemo } from 'react';
import OKXApi from '../lib/okxApi';
import config from '../config';
import { authenticatedFetch } from '../lib/authUtils';
import FlashMessage from './FlashMessage';
import BasicSettingsSection from './BotPanel/BasicSettingsSection';
import EntrySettingsSection from './BotPanel/EntrySettingsSection';
import EntryPriceList from './BotPanel/EntryPriceList';
import ReverseSettingsSection from './BotPanel/ReverseSettingsSection';
import TakeProfitStopLossSection from './BotPanel/TakeProfitStopLossSection';
import BotCreateButton from './BotPanel/BotCreateButton';
import { 
  removeCommas, 
  calculateMaxEntryCount, 
  calculateAutoEntryPrices,
  calculateStopLoss
} from '../lib/botUtils';
import { saveBotSettings, loadBotSettings, clearBotSettings, saveEntryData, loadEntryData, clearEntryData } from '../lib/utils';
import { isDemoAtom } from '../store/isDemoStore';
import { useAtomValue } from 'jotai';


const BotPanel = ({ onSymbolChange, balance = 25.30, user, onShowLoginModal }) => {
  const [okxApi, setOkxApi] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [flashMessage, setFlashMessage] = useState({
    isVisible: false,
    message: '',
    severity: 'info'
  });
  const isDemo = useAtomValue(isDemoAtom);

  // 데모 모드 여부 확인 (로그인하지 않은 사용자)
  const isDemoMode = !user;

  // 사용할 금액 상태 (사용자가 직접 입력)
  const [usageAmount, setUsageAmount] = useState('');

  // 기본 설정값 (쿠키에서 불러오거나 기본값 사용)
  const getDefaultSettings = (currentPrice = null) => {
    const savedSettings = loadBotSettings();
    
    // 데모 모드에서는 balance를 10000으로 강제 설정
    const effectiveBalance = isDemoMode ? 10000 : balance;
    
    if (savedSettings) {
      // 저장된 usageAmount가 있으면 사용, 없으면 빈 문자열
      setUsageAmount(savedSettings.usageAmount || '');
      return {
        ...savedSettings,
        firstEntryAmount: savedSettings.usageAmount || 0, // usageAmount 사용
        maxTotalSize: savedSettings.usageAmount || 0, // usageAmount 사용
        totalMargin: Math.floor(effectiveBalance) // OKX 증거금은 항상 balance 사용
      };
    }
    
    // 현재가가 없으면 기본값 사용 (실제로는 API에서 가져올 예정)
    const defaultPrice = currentPrice || 45000;
    
    // 기본 사용금액 (빈 문자열로 시작)
    setUsageAmount('');
    
    return {
      // 기본 설정
      symbol: 'BTC-USDT-SWAP', // OKX API 형식으로 변경
      direction: 'long', // long/short
      leverage: 10,
      marginType: 'cross', // isolated/cross
      maxTotalSize: 0, // 사용자가 입력할 때까지 0
      totalMargin: Math.floor(effectiveBalance), // OKX 증거금은 balance 사용
      
      // 진입 설정
      entryType: 'market', // market/ai/limit
      aiStyle: 'balanced', // aggressive/balanced/conservative
      firstEntryPrice: defaultPrice,
      firstEntryAmount: 0, // 사용자가 입력할 때까지 0
      
      // 반복 진입 설정
      entryCount: 1, // 기본값 1로 설정
      priceDeviation: 1.0, // %
      
      // 순환매 설정
      cycleEnabled: true, // 순환매 활성화 여부
      cycleStep: 1, // 순환매 기준 단
      
      // 자동 재진입 설정
      autoReentryEnabled: true, // 자동 재진입 활성화 여부
      reentryBudgetType: 'percentage', // fixed/percentage
      
      // 리스크매니징 트리거 설정
      triggerType: 'immediate', // immediate/ai
      aiTriggerStyle: 'balance', // safe/balance/boost
      
      // 진입가 자동설정
      autoEntryAmount: true, // 진입가 자동설정 여부
      
      // 익절/손절
      takeProfit: 2, // %
      stopLossEnabled: false, // 손절 사용 여부
      stopLoss: 1, // 기본값 1로 설정
      stopLossOnBotEnd: false, // 손절시 봇 종료 여부
    };
  };

  const [settings, setSettings] = useState(getDefaultSettings);

  // 진입가 데이터 상태 (쿠키에서 불러오거나 빈 배열)
  const getDefaultEntryData = () => {
    const savedEntryData = loadEntryData();
    return savedEntryData || [];
  };

  const [entryData, setEntryData] = useState(getDefaultEntryData);

  // 양방설정 상태
  const [reverseEnabled, setReverseEnabled] = useState(false);
  const [reverseSettings, setReverseSettings] = useState({
    creationStep: 1,            // 생성단계 (몇 단계 거래 성립 시 반대방향 봇 생성)
    entryType: 'market',        // 'market' | 'ai' | 'limit'
    aiStyle: 'balanced',        // 'aggressive' | 'balanced' | 'conservative'
    entryCount: 1,              // 진입횟수
    priceDeviation: 1.0,        // 가격편차 (%)
    cycleEnabled: true,         // 리스크매니징 활성화
    cycleStep: 1,               // 트리거 포인트
    triggerType: 'immediate',   // 'immediate' | 'ai'
    aiTriggerStyle: 'balance',  // 'safe' | 'balance' | 'boost'
    // 양방설정 전용 익절/손절
    takeProfit: 2,              // 익절 (%)
    stopLossEnabled: false,     // 손절 사용 여부
    stopLoss: 1,                // 손절 (%)
    stopLossOnBotEnd: false     // 손절시 봇 종료 여부
  });

  // 심볼별 기본 가격 설정 (OKX API 형식으로 변경) - API 실패 시 사용
  const symbolPrices = useMemo(() => ({
    'BTC-USDT-SWAP': 45000, // API 실패 시에만 사용
    'ETH-USDT-SWAP': 2800,
    'SOL-USDT-SWAP': 120,
    'ADA-USDT-SWAP': 0.45
  }), []);

  // OKX API 인스턴스 초기화
  useEffect(() => {
    // OKX API 인스턴스 생성 (공개 API이므로 인증 정보 없이 사용)
    const api = new OKXApi();
    setOkxApi(api);
  }, []);

  // 현재 심볼의 실시간 가격 가져오기
  const fetchCurrentPrice = useCallback(async (symbol) => {
    if (!okxApi) return;
    
    try {
      setIsLoadingPrice(true);
      // symbol이 이미 OKX API 형식이므로 변환 불필요
      const price = await okxApi.getCurrentPrice(symbol);
      
      setCurrentPrices(prev => ({
        ...prev,
        [symbol]: price
      }));
      
      // 첫 진입가 업데이트 (함수형 업데이트 사용)
      setSettings(prevSettings => {
        const newSettings = {
          ...prevSettings,
          firstEntryPrice: price
        };
        saveBotSettings(newSettings);
        return newSettings;
      });
      
    } catch (error) {
      console.error('현재가 조회 실패, 기본값 사용:', error);
      // 실패 시 기본 가격 사용 (API 실패 시에만)
      const defaultPrice = symbolPrices[symbol] || 45000;
      setSettings(prevSettings => {
        const newSettings = {
          ...prevSettings,
          firstEntryPrice: defaultPrice
        };
        saveBotSettings(newSettings);
        return newSettings;
      });
    } finally {
      setIsLoadingPrice(false);
    }
  }, [okxApi, symbolPrices]);

  // 심볼 변경 시 첫 진입가 자동 업데이트
  useEffect(() => {
    if (okxApi && settings.symbol) {
      fetchCurrentPrice(settings.symbol);
    }
  }, [settings.symbol, okxApi, fetchCurrentPrice]);

  // 밸런스 변경 시 총 증거금(OKX) 자동 업데이트
  useEffect(() => {
    setSettings(prevSettings => {
      // 데모 모드에서는 balance를 10000으로 강제 설정
      const effectiveBalance = isDemoMode ? 10000 : balance;
      
      const newSettings = {
        ...prevSettings,
        totalMargin: Math.floor(effectiveBalance) // OKX 증거금만 업데이트
      };
      saveBotSettings(newSettings);
      return newSettings;
    });
  }, [balance, isDemoMode]);

  // 사용할 금액 변경 핸들러
  const handleUsageAmountChange = (value) => {
    const numericValue = parseFloat(removeCommas(value)) || 0;
    setUsageAmount(value);
    
    // settings 업데이트
    const newSettings = {
      ...settings,
      maxTotalSize: numericValue,
      firstEntryAmount: numericValue,
      usageAmount: value // 쿠키 저장용
    };
    
    setSettings(newSettings);
    saveBotSettings(newSettings);
  };

  // 사용할 금액 유효성 검사
  const isUsageAmountValid = () => {
    const trimmedValue = usageAmount.toString().trim();
    const numericValue = parseFloat(removeCommas(trimmedValue));
    return trimmedValue !== '' && !isNaN(numericValue) && numericValue > 0;
  };

  // 진입 횟수 자동 조정
  useEffect(() => {
    setSettings(prevSettings => {
      const maxCount = calculateMaxEntryCount(prevSettings.maxTotalSize, prevSettings.firstEntryPrice);
      if (prevSettings.entryCount > maxCount) {
        const newSettings = {
          ...prevSettings,
          entryCount: maxCount
        };
        saveBotSettings(newSettings);
        return newSettings;
      }
      return prevSettings;
    });
  }, [settings.maxTotalSize, settings.firstEntryPrice]);

  // 초기 로드 시 진입 횟수를 최대값으로 설정 (쿠키에 저장된 값이 없을 때만)
  useEffect(() => {
    const savedSettings = loadBotSettings();
    if (!savedSettings) {
      setSettings(prevSettings => {
        const maxCount = calculateMaxEntryCount(prevSettings.maxTotalSize, prevSettings.firstEntryPrice);
        if (prevSettings.entryCount !== maxCount) {
          const newSettings = {
            ...prevSettings,
            entryCount: maxCount
          };
          saveBotSettings(newSettings);
          return newSettings;
        }
        return prevSettings;
      });
    }
  }, [settings.maxTotalSize, settings.firstEntryPrice]);

  // 순환매 단 자동 조정
  useEffect(() => {
    setSettings(prevSettings => {
      if (prevSettings.cycleStep >= prevSettings.entryCount) {
        const newSettings = {
          ...prevSettings,
          cycleStep: Math.max(1, prevSettings.entryCount - 1)
        };
        saveBotSettings(newSettings);
        return newSettings;
      }
      return prevSettings;
    });
  }, [settings.entryCount, settings.cycleStep]);

  // 손절값 자동 업데이트 (진입 횟수나 가격 편차 변경 시)
  useEffect(() => {
    setSettings(prevSettings => {
      const { minStopLoss } = calculateStopLoss(prevSettings.entryCount, prevSettings.priceDeviation);
      if (prevSettings.stopLoss < minStopLoss) {
        const newSettings = {
          ...prevSettings,
          stopLoss: minStopLoss
        };
        saveBotSettings(newSettings);
        return newSettings;
      }
      return prevSettings;
    });
  }, [settings.entryCount, settings.priceDeviation]);

  const handleInputChange = (field, value) => {
    let numericValue = value;
    
    // 숫자 필드인 경우 콤마 제거 후 숫자로 변환
    if (['firstEntryPrice', 'firstEntryAmount', 'leverage', 'entryCount', 'priceDeviation', 'takeProfit', 'cycleStep', 'stopLoss', 'maxTotalSize', 'totalMargin'].includes(field)) {
      if (typeof value === 'string') {
        numericValue = parseFloat(removeCommas(value)) || 0;
      }
    }

    const newSettings = {
      ...settings,
      [field]: numericValue
    };

    setSettings(newSettings);
    
    // 설정값을 쿠키에 저장
    saveBotSettings(newSettings);
  };

  const toggleDirection = (direction) => {
    const newSettings = {
      ...settings,
      direction: direction
    };
    setSettings(newSettings);
    saveBotSettings(newSettings);
  };

  const toggleMarginType = (marginType) => {
    const newSettings = {
      ...settings,
      marginType: marginType
    };
    setSettings(newSettings);
    saveBotSettings(newSettings);
  };

  const toggleCycle = () => {
    const newSettings = {
      ...settings,
      cycleEnabled: !settings.cycleEnabled,
      triggerType: !settings.cycleEnabled ? 'immediate' : settings.triggerType || 'immediate'
    };
    setSettings(newSettings);
    saveBotSettings(newSettings);
  };

  const toggleAutoEntryAmount = () => {
    const newSettings = {
      ...settings,
      autoEntryAmount: !settings.autoEntryAmount
    };
    setSettings(newSettings);
    saveBotSettings(newSettings);
  };

  const toggleStopLossEnabled = () => {
    const newSettings = {
      ...settings,
      stopLossEnabled: !settings.stopLossEnabled
    };
    setSettings(newSettings);
    saveBotSettings(newSettings);
  };

  // 양방설정 핸들러 함수들
  const toggleReverse = () => {
    setReverseEnabled(!reverseEnabled);
  };

  const handleReverseInputChange = (field, value) => {
    let numericValue = value;
    
    // 숫자 필드인 경우 콤마 제거 후 숫자로 변환
    if (['creationStep', 'entryCount', 'priceDeviation', 'cycleStep', 'takeProfit', 'stopLoss'].includes(field)) {
      if (typeof value === 'string') {
        numericValue = parseFloat(removeCommas(value)) || 0;
      }
    }

    // 생성단계는 원본 봇의 진입횟수를 넘을 수 없도록 제한
    if (field === 'creationStep') {
      numericValue = Math.max(1, Math.min(numericValue, maxReverseEntryCount));
    }

    const newReverseSettings = {
      ...reverseSettings,
      [field]: numericValue
    };

    setReverseSettings(newReverseSettings);
  };

  const toggleReverseCycle = () => {
    const newReverseSettings = {
      ...reverseSettings,
      cycleEnabled: !reverseSettings.cycleEnabled,
      triggerType: !reverseSettings.cycleEnabled ? 'immediate' : reverseSettings.triggerType || 'immediate'
    };
    setReverseSettings(newReverseSettings);
  };

  const toggleReverseStopLoss = () => {
    const newReverseSettings = {
      ...reverseSettings,
      stopLossEnabled: !reverseSettings.stopLossEnabled
    };
    setReverseSettings(newReverseSettings);
  };

  const toggleReverseStopLossOnBotEnd = () => {
    const newReverseSettings = {
      ...reverseSettings,
      stopLossOnBotEnd: !reverseSettings.stopLossOnBotEnd
    };
    setReverseSettings(newReverseSettings);
  };

  // 진입가 데이터 초기화
  useEffect(() => {
    // settings가 완전히 초기화된 후에 실행
    if (settings.maxTotalSize > 0 && settings.firstEntryPrice > 0) {
      const initialPrices = calculateAutoEntryPrices(settings);
      setEntryData(initialPrices);
      saveEntryData(initialPrices);
    }
  }, [settings]);

  // 진입가 데이터 업데이트 (자동설정 ON)
  useEffect(() => {
    if (settings.autoEntryAmount && settings.maxTotalSize > 0 && settings.firstEntryPrice > 0) {
      const calculatedPrices = calculateAutoEntryPrices(settings);
      setEntryData(calculatedPrices);
      saveEntryData(calculatedPrices);
    }
  }, [settings]);

  // 진입가 자동설정 OFF일 때 entryCount 변경 시 entryData 길이 맞추기
  useEffect(() => {
    if (!settings.autoEntryAmount) {
      const count = Number(settings.entryCount) || 0;
      let newEntryData = [...entryData];
      if (newEntryData.length < count) {
        // 부족하면 마지막 값 복사 또는 기본값으로 채움
        const defaultAmount = settings.maxTotalSize > 0 ? settings.maxTotalSize / count : 0;
        const last = newEntryData.length > 0 ? newEntryData[newEntryData.length - 1] : { price: settings.firstEntryPrice || 45000, amount: defaultAmount, percentage: 0, step: 1 };
        for (let i = newEntryData.length; i < count; i++) {
          newEntryData.push({ ...last, step: i + 1 });
        }
      } else if (newEntryData.length > count) {
        // 많으면 자름
        newEntryData = newEntryData.slice(0, count);
      }
      setEntryData(newEntryData);
      saveEntryData(newEntryData);
    }
  }, [entryData, settings.autoEntryAmount, settings.entryCount, settings.firstEntryPrice, settings.maxTotalSize]);

  // cycleStep 변경 시 즉시 반영 (트리거 포인트 업데이트)
  useEffect(() => {
    setSettings(prevSettings => {
      if (prevSettings.cycleEnabled && prevSettings.cycleStep > prevSettings.entryCount) {
        const newSettings = {
          ...prevSettings,
          cycleStep: Math.max(1, prevSettings.entryCount - 1)
        };
        saveBotSettings(newSettings);
        return newSettings;
      }
      return prevSettings;
    });
  }, [settings.cycleStep, settings.entryCount, settings.cycleEnabled]);

  // 반대방향 cycleStep 자동 조정
  useEffect(() => {
    if (reverseSettings.cycleStep >= reverseSettings.entryCount) {
      const newReverseSettings = {
        ...reverseSettings,
        cycleStep: Math.max(1, reverseSettings.entryCount - 1)
      };
      setReverseSettings(newReverseSettings);
    }
  }, [reverseSettings.entryCount, reverseSettings.cycleStep]);

  // 원본 봇의 진입횟수 변경 시 양방설정 생성단계 자동 조정
  useEffect(() => {
    const maxAllowed = Math.max(1, settings.entryCount - 1);
    if (reverseSettings.creationStep > maxAllowed) {
      const newReverseSettings = {
        ...reverseSettings,
        creationStep: maxAllowed
      };
      setReverseSettings(newReverseSettings);
    }
  }, [settings.entryCount]); // reverseSettings.creationStep 제거하여 무한루프 방지

  // 수동 진입가 변경 핸들러
  const handleManualAmountChange = (index, value) => {
    const numericValue = parseFloat(removeCommas(value)) || 0;
    
    const newEntryData = entryData.map((entry, i) => 
      i === index ? { ...entry, amount: numericValue } : entry
    );
    
    setEntryData(newEntryData);
    saveEntryData(newEntryData);
  };

  // 수동 가격 변경 핸들러
  const handleManualPriceChange = (index, value) => {
    const numericValue = parseFloat(removeCommas(value)) || 0;
    const basePrice = settings.firstEntryPrice;
    
    // 퍼센트 계산
    const percentage = ((numericValue - basePrice) / basePrice) * 100;
    
    const newEntryData = entryData.map((entry, i) => 
      i === index ? { 
        ...entry, 
        price: parseFloat(numericValue.toFixed(2)), 
        percentage: parseFloat(percentage.toFixed(2))
      } : entry
    );
    
    setEntryData(newEntryData);
    saveEntryData(newEntryData);
  };

  // 수동 퍼센트 변경 핸들러
  const handleManualPercentageChange = (index, value) => {
    const numericValue = parseFloat(removeCommas(value)) || 0;
    const basePrice = settings.firstEntryPrice;
    
    // 가격 계산
    const price = basePrice * (1 + numericValue / 100);
    
    const newEntryData = entryData.map((entry, i) => 
      i === index ? { 
        ...entry, 
        price: parseFloat(price.toFixed(2)), 
        percentage: numericValue
      } : entry
    );
    
    setEntryData(newEntryData);
    saveEntryData(newEntryData);
  };

  // 수동 진입가 총합 계산
  const calculateTotalManualAmount = () => {
    return entryData.reduce((sum, entry) => sum + entry.amount, 0);
  };

  // 진입가 계산 (현재 표시용)
  const calculateEntryPrices = () => {
    // entryData가 비어있으면 자동 계산된 값 반환
    if (entryData.length === 0) {
      return calculateAutoEntryPrices(settings);
    }
    return entryData;
  };

  // 익절선 계산 (레버리지/10)
  const breakEvenPoint = settings.leverage / 10;

  // 손절시 봇 종료 토글
  const toggleStopLossOnBotEnd = () => {
    const newSettings = {
      ...settings,
      stopLossOnBotEnd: !settings.stopLossOnBotEnd
    };
    setSettings(newSettings);
    saveBotSettings(newSettings);
  };

  // 최대 진입 횟수
  const maxEntryCount = calculateMaxEntryCount(settings.maxTotalSize, settings.firstEntryPrice);
  // 양방설정의 생성단계는 원본 봇의 진입횟수 미만이어야 함 (마지막 단계 전에 생성)
  const maxReverseEntryCount = Math.max(1, settings.entryCount - 1);

  // 플래시 메시지 표시 함수
  const showFlashMessage = (message, severity = 'info') => {
    setFlashMessage({
      isVisible: true,
      message,
      severity
    });
  };

  // 플래시 메시지 닫기 함수
  const closeFlashMessage = () => {
    setFlashMessage(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // 패널 클릭 핸들러
  const handlePanelClick = (e) => {
    // 데모 모드에서 패널 클릭 시 아무 동작 안함
  };

  // OKX API 형식을 표시 형식으로 변환
  const convertOKXFormatToDisplay = (okxSymbol) => {
    // BTC-USDT-SWAP -> BTC/USDT
    return okxSymbol.replace('-SWAP', '').replace('-', '/');
  };

  // 개별 봇 생성 헬퍼 함수
  const createSingleBot = async (botSettings, botEntryData, isReverse = false, isDemo = false) => {
    let finalEntryData = botEntryData;
    
    if (botSettings.autoEntryAmount) {
      // 자동설정이 ON이면 현재 설정으로 새로 계산
      finalEntryData = calculateAutoEntryPrices(botSettings);
    }
    
    const entryDataForApi = finalEntryData.map(entry => ({
      step: entry.step,
      price: parseFloat(entry.price),
      amount: parseFloat(entry.amount) * parseInt(botSettings.leverage),
      type: botSettings.entryType === 'market' ? (entry.step === 1 ? 'market' : 'stop') : (entry.type || 'market')
    }));

    const displaySymbol = convertOKXFormatToDisplay(botSettings.symbol);
    const directionText = botSettings.direction === 'long' ? '롱' : '숏';
    const botTypeText = isReverse ? ' (양방설정)' : '';

    // 구조화된 API 요청 데이터
    const requestData = {
      // 기본 정보
      basic: {
        symbol: botSettings.symbol,
        direction: botSettings.direction,
        leverage: parseInt(botSettings.leverage),
        margin_type: botSettings.marginType,
        max_total_size: parseFloat(botSettings.maxTotalSize),
        // 자동 재진입 설정 (기본 설정의 하위)
        auto_reentry: {
          enabled: botSettings.autoReentryEnabled,
          budget_type: botSettings.reentryBudgetType
        }
      },
      
      // 진입 설정
      entry: {
        type: botSettings.entryType,
        count: parseInt(botSettings.entryCount),
        auto_amount: botSettings.autoEntryAmount,
        data: entryDataForApi,
        // AI 진입 타입인 경우 스타일 포함
        ai_style: botSettings.entryType === 'ai' ? (botSettings.aiStyle || 'balanced') : undefined,
        // 리스크매니징 트리거 (진입 설정의 하위)
        risk_management: {
          enabled: botSettings.cycleEnabled,
          step: parseInt(botSettings.cycleStep),
          trigger_type: botSettings.triggerType || 'immediate',
          ai_trigger_style: botSettings.aiTriggerStyle || 'balance'
        }
      },
      
      // 익절/손절 설정
      exit: {
        take_profit: parseFloat(botSettings.takeProfit),
        stop_loss: {
          enabled: botSettings.stopLossEnabled,
          value: botSettings.stopLossEnabled ? parseFloat(botSettings.stopLoss) : 0,
          on_bot_end: botSettings.stopLossEnabled ? botSettings.stopLossOnBotEnd : false
        }
      },
      
      // 메타데이터
      metadata: {
        name: `${displaySymbol} ${directionText} 마틴게일 봇${botTypeText}`,
        description: `${displaySymbol} ${directionText} 마틴게일 봇 - ${botSettings.entryCount}회 진입, ${botSettings.leverage}x 레버리지${botTypeText}`
      },

      // 양방설정 (기본 봇에만 포함) - 백엔드 인터페이스에 맞춰 수정
      reverse: !isReverse && reverseEnabled ? {
        enabled: true,
        triggerStep: reverseSettings.creationStep,
        settings: {
          entryType: reverseSettings.entryType,
          aiStyle: reverseSettings.aiStyle,
          entryCount: reverseSettings.entryCount,
          priceDeviation: reverseSettings.priceDeviation,
          cycleEnabled: reverseSettings.cycleEnabled,
          cycleStep: reverseSettings.cycleStep,
          triggerType: reverseSettings.triggerType,
          aiTriggerStyle: reverseSettings.aiTriggerStyle,
          takeProfit: reverseSettings.takeProfit,
          stopLoss: {
            enabled: reverseSettings.stopLossEnabled,
            value: reverseSettings.stopLoss
          }
        }
      } : { enabled: false },

      is_demo: isDemo
    };

    const response = await authenticatedFetch(`${config.API_BASE_URL}/api/bots`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      // 서버에서 보낸 에러 메시지가 있으면 그것을 사용
      const errorMessage = responseData.detail || responseData.message || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.responseData = responseData;
      throw error;
    }

    return responseData;
  };

  // 봇 생성 API 호출
  const createBot = async (isDemo = false) => {
    if (isCreating) return;
    
    setIsCreating(true);
    
    // 데모 모드인 경우 3초 후 성공 메시지 표시
    if (isDemoMode) {
      setTimeout(() => {
        const botCount = reverseEnabled ? 2 : 1;
        const message = reverseEnabled 
          ? `[데모] ${botCount}개의 봇이 성공적으로 생성되었습니다! (기본 + 양방설정)`
          : '[데모] 봇이 성공적으로 생성되었습니다!';
        showFlashMessage(message, 'success');
        
        // 현재 선택된 심볼과 방향을 저장
        const currentSymbol = settings.symbol;
        const currentDirection = settings.direction;
        
        // 봇 생성 성공 후 설정값 초기화 (심볼과 방향 제외)
        clearBotSettings();
        clearEntryData();
        
        // 현재가를 가져와서 기본값으로 재설정하되, 현재 심볼과 방향 유지
        try {
          if (okxApi) {
            okxApi.getCurrentPrice(currentSymbol).then(currentPrice => {
              const newSettings = getDefaultSettings(currentPrice);
              // 현재 선택된 심볼과 방향 유지
              newSettings.symbol = currentSymbol;
              newSettings.direction = currentDirection;
              setSettings(newSettings);
            }).catch(error => {
              console.error('현재가 조회 실패, 기본값 사용:', error);
              const newSettings = getDefaultSettings();
              // 현재 선택된 심볼과 방향 유지
              newSettings.symbol = currentSymbol;
              newSettings.direction = currentDirection;
              setSettings(newSettings);
            });
          } else {
            const newSettings = getDefaultSettings();
            // 현재 선택된 심볼과 방향 유지
            newSettings.symbol = currentSymbol;
            newSettings.direction = currentDirection;
            setSettings(newSettings);
          }
        } catch (error) {
          console.error('현재가 조회 실패, 기본값 사용:', error);
          const newSettings = getDefaultSettings();
          // 현재 선택된 심볼과 방향 유지
          newSettings.symbol = currentSymbol;
          newSettings.direction = currentDirection;
          setSettings(newSettings);
        }
        
        setEntryData(getDefaultEntryData());
        
        // 스크롤 맨 위로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setIsCreating(false);
      }, 3000);
      return;
    }
    
    try {
      // 기본 봇 생성 (양방설정 정보 포함)
      await createSingleBot(settings, entryData, false, isDemo);
      
      // 성공 메시지 표시
      if (reverseEnabled) {
        showFlashMessage(`봇이 성공적으로 생성되었습니다! (${reverseSettings.creationStep}단계 거래 시 반대방향 봇 자동 생성 설정됨)`, 'success');
      } else {
        showFlashMessage('봇이 성공적으로 생성되었습니다!', 'success');
      }
      
      // 현재 선택된 심볼과 방향을 저장
      const currentSymbol = settings.symbol;
      const currentDirection = settings.direction;
      
      // 봇 생성 성공 후 설정값 초기화 (심볼과 방향 제외)
      clearBotSettings();
      clearEntryData();
      
      // 현재가를 가져와서 기본값으로 재설정하되, 현재 심볼과 방향 유지
      try {
        if (okxApi) {
          const currentPrice = await okxApi.getCurrentPrice(currentSymbol);
          const newSettings = getDefaultSettings(currentPrice);
          // 현재 선택된 심볼과 방향 유지
          newSettings.symbol = currentSymbol;
          newSettings.direction = currentDirection;
          setSettings(newSettings);
        } else {
          const newSettings = getDefaultSettings();
          // 현재 선택된 심볼과 방향 유지
          newSettings.symbol = currentSymbol;
          newSettings.direction = currentDirection;
          setSettings(newSettings);
        }
      } catch (error) {
        console.error('현재가 조회 실패, 기본값 사용:', error);
        const newSettings = getDefaultSettings();
        // 현재 선택된 심볼과 방향 유지
        newSettings.symbol = currentSymbol;
        newSettings.direction = currentDirection;
        setSettings(newSettings);
      }
      
      setEntryData(getDefaultEntryData());
      // 양방설정도 초기화
      setReverseEnabled(false);
      setReverseSettings({
        creationStep: 1,
        entryType: 'market',
        aiStyle: 'balanced',
        entryCount: 1,
        priceDeviation: 1.0,
        cycleEnabled: true,
        cycleStep: 1,
        triggerType: 'immediate',
        aiTriggerStyle: 'balance',
        takeProfit: 2,
        stopLossEnabled: false,
        stopLoss: 1,
        stopLossOnBotEnd: false
      });
      
    } catch (error) {
      console.error('봇 생성 실패:', error);
      
      // 서버에서 보낸 상세 에러 메시지가 있으면 우선 사용
      let errorMessage = error.message || '봇 생성에 실패했습니다. 다시 시도해주세요.';
      let severity = 'error';
      
      // HTTP 상태 코드에 따른 추가 처리
      if (error.status === 401) {
        errorMessage = error.message || '인증이 만료되었습니다. 다시 로그인해주세요.';
        severity = 'warning';
      } else if (error.status === 403) {
        errorMessage = error.message || '권한이 없습니다. 관리자에게 문의하세요.';
        severity = 'error';
      } else if (error.status === 409) {
        // 409 Conflict - 중복 봇 에러
        // 서버에서 보낸 메시지를 그대로 사용
        severity = 'warning';
      } else if (error.status === 422) {
        errorMessage = error.message || '입력 데이터가 올바르지 않습니다. 설정을 확인해주세요.';
        severity = 'warning';
      } else if (error.status === 500) {
        errorMessage = error.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        severity = 'error';
      }
      
      showFlashMessage(errorMessage, severity);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="bot-panel overflow-y-auto relative bg-card rounded-lg border shadow-sm p-2"
      onClick={handlePanelClick}
    >
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Bot 만들기</h2>
        </div>
      </div>

      <div className="p-2">
        {/* 기본 설정 */}
        <BasicSettingsSection
          settings={settings}
          onInputChange={handleInputChange}
          onDirectionChange={toggleDirection}
          onMarginTypeChange={toggleMarginType}
          onSymbolChange={onSymbolChange}
          user={user}
          balance={balance}
          usageAmount={usageAmount}
          onUsageAmountChange={handleUsageAmountChange}
          isUsageAmountValid={isUsageAmountValid()}
        />

        {/* 진입 설정 */}
        <EntrySettingsSection
          settings={settings}
          onInputChange={handleInputChange}
          onToggleCycle={toggleCycle}
          onToggleAutoEntryAmount={toggleAutoEntryAmount}
          isLoadingPrice={isLoadingPrice}
          currentPrices={currentPrices}
          balance={balance}
          maxEntryCount={maxEntryCount}
          calculateTotalManualAmount={calculateTotalManualAmount}
        />

        {/* 진입가 목록 */}
        <EntryPriceList
          settings={settings}
          entryData={entryData}
          onManualAmountChange={handleManualAmountChange}
          onManualPriceChange={handleManualPriceChange}
          onManualPercentageChange={handleManualPercentageChange}
          calculateEntryPrices={calculateEntryPrices}
          calculateTotalManualAmount={calculateTotalManualAmount}
          balance={balance}
        />

        {/* 익절/손절 설정 */}
        <TakeProfitStopLossSection
          settings={settings}
          onInputChange={handleInputChange}
          onToggleStopLossEnabled={toggleStopLossEnabled}
          onToggleStopLossOnBotEnd={toggleStopLossOnBotEnd}
          breakEvenPoint={breakEvenPoint}
        />

        {/* 양방설정 */}
        <ReverseSettingsSection
          reverseEnabled={reverseEnabled}
          reverseSettings={reverseSettings}
          onToggleReverse={toggleReverse}
          onReverseInputChange={handleReverseInputChange}
          onToggleReverseCycle={toggleReverseCycle}
          onToggleReverseStopLoss={toggleReverseStopLoss}
          onToggleReverseStopLossOnBotEnd={toggleReverseStopLossOnBotEnd}
          maxReverseEntryCount={maxReverseEntryCount}
          currentDirection={settings.direction}
        />

        {/* 생성 버튼 */}
        <BotCreateButton
          isCreating={isCreating}
          isDisabled={!isUsageAmountValid()}
          onCreateBot={() => createBot(isDemo)}
          settings={settings}
          entryData={entryData}
          isDemoMode={isDemoMode}
          reverseEnabled={reverseEnabled}
          reverseSettings={reverseSettings}
        />

        {/* 플래시 메시지 */}
        <FlashMessage
          message={flashMessage.message}
          severity={flashMessage.severity}
          isVisible={flashMessage.isVisible}
          onClose={closeFlashMessage}
          duration={3000}
          autoClose={true}
        />
      </div>
    </div>
  );
};

export default BotPanel; 