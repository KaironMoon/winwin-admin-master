import { atom } from 'jotai';

/**
 * 기간 검색 필터 전역 상태 관리
 * 모든 관리자 페이지에서 공통으로 사용하는 기간 필터 상태
 * localStorage를 사용하여 탭/창 간 동기화 지원
 */

const STORAGE_KEY = 'dateRangeFilter';

// 읽기 전용 atoms
const dateRangeTypeAtom = atom('all');
const startDateAtom = atom('');
const endDateAtom = atom('');

// 쓰기 전용 atoms (useSetAtom에서 사용) - localStorage에도 저장
const setDateRangeTypeAtom = atom(null, (get, set, value) => {
  set(dateRangeTypeAtom, value);
  const filterData = {
    type: value,
    startDate: get(startDateAtom),
    endDate: get(endDateAtom)
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filterData));
});

const setStartDateAtom = atom(null, (get, set, value) => {
  set(startDateAtom, value);
  const filterData = {
    type: get(dateRangeTypeAtom),
    startDate: value,
    endDate: get(endDateAtom)
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filterData));
});

const setEndDateAtom = atom(null, (get, set, value) => {
  set(endDateAtom, value);
  const filterData = {
    type: get(dateRangeTypeAtom),
    startDate: get(startDateAtom),
    endDate: value
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filterData));
});

// 리셋 atom
const resetDateRangeAtom = atom(null, (get, set) => {
  set(dateRangeTypeAtom, 'all');
  set(startDateAtom, '');
  set(endDateAtom, '');
  window.localStorage.removeItem(STORAGE_KEY);
});

// 초기화 atom - localStorage에서 값 읽어오기
const initDateRangeAtom = atom(null, (get, set) => {
  try {
    const storedData = window.localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const filterData = JSON.parse(storedData);
      set(dateRangeTypeAtom, filterData.type || 'all');
      set(startDateAtom, filterData.startDate || '');
      set(endDateAtom, filterData.endDate || '');
    }
  } catch (error) {
    console.error('Error loading date range filter from localStorage:', error);
  }
});

export {
  dateRangeTypeAtom,
  startDateAtom,
  endDateAtom,
  setDateRangeTypeAtom,
  setStartDateAtom,
  setEndDateAtom,
  resetDateRangeAtom,
  initDateRangeAtom,
  STORAGE_KEY
};
