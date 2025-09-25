// 봇 관련 공통 유틸리티 함수들
import config from '../config';

// 3자리 콤마 포맷팅 함수
export const formatNumber = (num) => {
  // 문자열인 경우 숫자로 변환
  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  // 소숫점이 있는 경우와 없는 경우를 구분하여 처리
  if (Number.isInteger(num)) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    // 소숫점이 있는 경우, 소숫점 부분은 그대로 두고 정수 부분만 콤마 추가
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  }
};

// 콤마 제거 함수
export const removeCommas = (str) => {
  return str.replace(/,/g, '');
};

// 최대 진입 횟수 계산
export const calculateMaxEntryCount = (totalAmount, basePrice) => {
  let maxCount = 1;
  
  for (let i = 2; i <= 20; i++) {
    const ratios = [];
    for (let j = 0; j < i; j++) {
      if (j === 0) {
        ratios.push(1);
      } else {
        ratios.push(Math.pow(2, j - 1));
      }
    }
    
    const newTotalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
    const unitAmount = totalAmount / newTotalRatio;
    
    // 1단이 1달러를 초과하는지 확인
    if (unitAmount > 1) {
      maxCount = i;
    } else {
      break;
    }
  }
  
  return maxCount;
};

// 자동 진입가 계산
export const calculateAutoEntryPrices = (settings) => {
  const prices = [];
  const basePrice = settings.firstEntryPrice;
  
  // 마틴게일 비율 계산 (1, 1, 2, 4, 8, 16, ...)
  const martingaleRatios = [];
  for (let i = 0; i < settings.entryCount; i++) {
    if (i === 0) {
      martingaleRatios.push(1);
    } else {
      martingaleRatios.push(Math.pow(2, i - 1));
    }
  }
  
  // 마틴게일 비율의 총합
  const totalRatio = martingaleRatios.reduce((sum, ratio) => sum + ratio, 0);
  
  // 단위 금액 계산 (총 투입 사이즈 상한액 / 마틴게일 비율 총합)
  const unitAmount = (settings.maxTotalSize || settings.firstEntryAmount) / totalRatio;
  
  for (let i = 0; i < settings.entryCount; i++) {
    if (i === 0) {
      prices.push({
        step: i + 1,
        price: basePrice,
        percentage: 0,
        amount: unitAmount * martingaleRatios[i],
        type: settings.entryType,
        isCyclePoint: settings.cycleEnabled && (i + 1) === settings.cycleStep
      });
    } else {
      const deviation = settings.direction === 'long' 
        ? basePrice * (1 - (settings.priceDeviation * i / 100))
        : basePrice * (1 + (settings.priceDeviation * i / 100));
      
      const percentage = settings.direction === 'long' 
        ? -(settings.priceDeviation * i)
        : (settings.priceDeviation * i);
      
      prices.push({
        step: i + 1,
        price: deviation,
        percentage: percentage,
        amount: unitAmount * martingaleRatios[i],
        type: settings.entryType,
        isCyclePoint: settings.cycleEnabled && (i + 1) === settings.cycleStep
      });
    }
  }
  
  return prices;
};

// 손절값 자동 계산
export const calculateStopLoss = (entryCount, priceDeviation) => {
  const minStopLoss = entryCount * priceDeviation;
  const defaultStopLoss = (entryCount + 1) * priceDeviation;
  return { minStopLoss, defaultStopLoss };
};

// 심볼을 OKX API 형식으로 변환
export const convertSymbolToOKXFormat = (symbol) => {
  // BTC/USDT -> BTC-USDT-SWAP (선물 거래)
  const [base, quote] = symbol.split('/');
  return `${base}-${quote}-SWAP`;
};

// 사용자의 활성 봇 목록 가져오기
export const getMyBots = async (isDemo = false) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('토큰이 없어서 봇 목록을 가져올 수 없습니다.');
      return [];
    }

    const apiUrl = `${config.API_BASE_URL}/api/bots/my-bots?is_demo=${isDemo}`;
    console.log('API 호출 URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('인증이 만료되었습니다.');
        return [];
      }
      throw new Error(`봇 목록 조회 실패: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('JSON이 아닌 응답을 받았습니다. API 엔드포인트를 확인해주세요.');
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
      console.log('HTML 응답을 받았습니다. API 엔드포인트가 올바른지 확인해주세요.');
      return [];
    }
    console.error('봇 목록 조회 중 오류:', error);
    return [];
  }
};

// 사용 중인 심볼 목록 가져오기
export const getActiveSymbols = async (isDemo = false) => {
  try {
    const bots = await getMyBots(isDemo);
    return bots.map(bot => bot.symbol).filter(Boolean);
  } catch (error) {
    console.error('활성 심볼 조회 중 오류:', error);
    return [];
  }
}; 