import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// 쿠키 관련 유틸리티 함수들
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (error) {
        console.error('쿠키 파싱 오류:', error);
        return null;
      }
    }
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// 봇 설정 관련 쿠키 함수들
export const saveBotSettings = (settings) => {
  setCookie('botSettings', settings, 1); // 1일간 저장
};

export const loadBotSettings = () => {
  return getCookie('botSettings');
};

export const clearBotSettings = () => {
  deleteCookie('botSettings');
};

// 진입가 데이터 관련 쿠키 함수들
export const saveEntryData = (entryData) => {
  setCookie('entryData', entryData, 1); // 1일간 저장
};

export const loadEntryData = () => {
  return getCookie('entryData');
};

export const clearEntryData = () => {
  deleteCookie('entryData');
}; 