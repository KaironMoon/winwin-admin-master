import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

/**
 * 데모 필터 전역 상태 관리
 *
 * localStorage에 저장되어 페이지 새로고침 후에도 유지됩니다.
 */

const STORAGE_KEY = 'demoFilter';

// 데모 필터 상태 atom (localStorage 동기화)
export const isDemoFilterAtom = atomWithStorage(STORAGE_KEY, false);

// 데모 필터 설정 atom
export const setIsDemoFilterAtom = atom(
  null,
  (get, set, value) => {
    set(isDemoFilterAtom, value);
    // localStorage에 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
);

// 초기화 atom
export const initDemoFilterAtom = atom(
  null,
  (get, set) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const value = JSON.parse(stored);
        set(isDemoFilterAtom, value);
      }
    } catch (error) {
      console.error('Failed to load demo filter from localStorage:', error);
    }
  }
);

export { STORAGE_KEY };
