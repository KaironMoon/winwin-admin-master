import axios from 'axios';
import config from '../config';

const TransactionServices = {
  /**
   * 로컬 스토리지에서 사용자 토큰 가져오기
   */
  getUserToken: () => {
    const tokenInfoStr = localStorage.getItem("tokenData");
    let token = null;
    try {
      if (tokenInfoStr) {
        token = JSON.parse(tokenInfoStr).token;
      }
    } catch (error) {
      console.error("Error parsing tokenInfo", error);
    }
    return token;
  },

  /**
   * 거래 내역 목록 조회
   * @param {Object} filters - 필터 옵션
   * @param {number} filters.user_id - 사용자 ID
   * @param {string} filters.symbol - 거래쌍 (예: BTC-USDT-SWAP)
   * @param {string} filters.side - 거래 방향 (buy/sell)
   * @param {string} filters.status - 주문 상태 (filled, canceled, live 등)
   * @param {number} filters.bot_id - 봇 ID
   * @param {string} filters.start_date - 시작 날짜 (YYYY-MM-DD)
   * @param {string} filters.end_date - 종료 날짜 (YYYY-MM-DD)
   * @param {string} filters.search_text - 검색어
   * @param {string} filters.search_type - 검색 타입 (user_id, symbol, type)
   * @param {number} page - 페이지 번호 (기본값: 1)
   * @param {number} size - 페이지 크기 (기본값: 20)
   * @returns {Promise} - 거래 내역 목록
   */
  getTransactions: async (filters = {}, page = 1, size = 20) => {
    const token = TransactionServices.getUserToken();

    try {
      // 쿼리 파라미터 구성
      const params = {
        page,
        size,
        ...filters
      };

      // 빈 값 제거
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await axios.get(`${config.API_BASE_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 사용자별 거래 요약 정보 조회 (관리자 전용)
   * @param {string} search_text - 검색어 (사용자 UID, 닉네임, 이메일)
   * @param {number} page - 페이지 번호 (기본값: 1)
   * @param {number} size - 페이지 크기 (기본값: 20)
   * @returns {Promise} - 사용자 거래 요약 목록
   */
  getUsersTradingSummary: async (search_text = '', page = 1, size = 20) => {
    const token = TransactionServices.getUserToken();

    try {
      const params = {
        page,
        size
      };

      if (search_text) {
        params.search_text = search_text;
      }

      const response = await axios.get(`${config.API_BASE_URL}/api/transactions/users/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error('사용자 거래 요약 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 거래 통계 정보 조회
   * @param {number} user_id - 사용자 ID (옵션)
   * @returns {Promise} - 거래 통계
   */
  getTransactionStats: async (user_id = null) => {
    const token = TransactionServices.getUserToken();

    try {
      const params = user_id ? { user_id } : {};

      const response = await axios.get(`${config.API_BASE_URL}/api/transactions/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error('거래 통계 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 하위 추천인 거래 요약 정보 조회 (관리자 전용)
   * @param {number} user_id - 상위 추천인 사용자 ID
   * @param {string} search_text - 검색어 (사용자 UID, 닉네임, 이메일)
   * @param {number} page - 페이지 번호 (기본값: 1)
   * @param {number} size - 페이지 크기 (기본값: 20)
   * @returns {Promise} - 하위 추천인 거래 요약 목록
   */
  getReferralsTradingSummary: async (user_id, search_text = '', page = 1, size = 20) => {
    const token = TransactionServices.getUserToken();

    try {
      const params = {
        user_id,
        page,
        size
      };

      if (search_text) {
        params.search_text = search_text;
      }

      const response = await axios.get(`${config.API_BASE_URL}/api/transactions/users/referrals/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error('하위 추천인 거래 요약 조회 실패:', error);
      throw error;
    }
  },
};

export default TransactionServices;
