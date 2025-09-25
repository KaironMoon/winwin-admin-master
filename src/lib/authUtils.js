import config from '../config';

// 토큰 만료 시간 (30분)
const TOKEN_EXPIRY_TIME = 30 * 60 * 1000; // 30분을 밀리초로

// 토큰 정보를 localStorage에 저장
export const saveToken = (token) => {
  const tokenData = {
    token: token,
    timestamp: Date.now()
  };
  localStorage.setItem('tokenData', JSON.stringify(tokenData));
  localStorage.setItem('token', token); // 기존 호환성을 위해 유지
};

// 토큰 정보를 localStorage에서 가져오기
export const getToken = () => {
  const tokenData = localStorage.getItem('tokenData');
  if (tokenData) {
    try {
      const parsed = JSON.parse(tokenData);
      return parsed.token;
    } catch (error) {
      console.error('토큰 데이터 파싱 오류:', error);
      return localStorage.getItem('token'); // 기존 방식으로 fallback
    }
  }
  return localStorage.getItem('token'); // 기존 방식으로 fallback
};

// 토큰이 만료되었는지 확인
export const isTokenExpired = () => {
  const tokenData = localStorage.getItem('tokenData');
  if (!tokenData) {
    return true; // 토큰 데이터가 없으면 만료된 것으로 간주
  }

  try {
    const parsed = JSON.parse(tokenData);
    const now = Date.now();
    const timeDiff = now - parsed.timestamp;
    
    return timeDiff >= TOKEN_EXPIRY_TIME;
  } catch (error) {
    console.error('토큰 만료 확인 오류:', error);
    return true; // 오류 발생 시 만료된 것으로 간주
  }
};

// 토큰이 곧 만료될 예정인지 확인 (5분 전)
export const isTokenExpiringSoon = () => {
  const tokenData = localStorage.getItem('tokenData');
  if (!tokenData) {
    return true;
  }

  try {
    const parsed = JSON.parse(tokenData);
    const now = Date.now();
    const timeDiff = now - parsed.timestamp;
    const timeUntilExpiry = TOKEN_EXPIRY_TIME - timeDiff;
    
    // 5분 이내에 만료되면 true 반환
    return timeUntilExpiry <= 5 * 60 * 1000;
  } catch (error) {
    console.error('토큰 만료 예정 확인 오류:', error);
    return true;
  }
};

// 토큰 갱신
export const refreshToken = async () => {
  try {
    const currentToken = getToken();
    if (!currentToken) {
      throw new Error('갱신할 토큰이 없습니다.');
    }

    console.log('토큰 갱신 시도 중...');
    
    const response = await fetch(`${config.API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('토큰이 만료되어 갱신할 수 없습니다.');
      }
      throw new Error(`토큰 갱신 실패: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access_token) {
      saveToken(data.access_token);
      console.log('토큰이 성공적으로 갱신되었습니다.');
      return data.access_token;
    } else {
      throw new Error('갱신된 토큰이 응답에 없습니다.');
    }
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    // 토큰 갱신 실패 시 로그아웃 처리
    logout();
    throw error;
  }
};

// 로그아웃 처리
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenData');
  localStorage.removeItem('user');
  // 페이지 새로고침으로 로그인 페이지로 이동
  window.location.reload();
};

// 인증 헤더를 포함한 fetch 함수
export const authenticatedFetch = async (url, options = {}) => {
  let token = getToken();
  
  // 토큰이 곧 만료될 예정이면 갱신 시도
  if (token && isTokenExpiringSoon()) {
    try {
      token = await refreshToken();
    } catch (error) {
      // 갱신 실패 시 로그아웃
      logout();
      throw error;
    }
  }

  // Authorization 헤더 추가
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // 401 에러 발생 시 토큰 갱신 재시도
  if (response.status === 401 && token) {
    try {
      const newToken = await refreshToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      
      const retryResponse = await fetch(url, {
        ...options,
        headers
      });
      
      return retryResponse;
    } catch (refreshError) {
      logout();
      throw refreshError;
    }
  }

  return response;
}; 