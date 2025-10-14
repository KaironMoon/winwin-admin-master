import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import config from '../config';

const OKXOAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      generateAuthUrl();
    }
  }, [isOpen]);

  const generateAuthUrl = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await axios.get(`${config.API_BASE_URL}/api/okx/oauth/auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAuthUrl(response.data.auth_url);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || '인증 URL 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = () => {
    if (authUrl) {
      // 새 창에서 OKX OAuth 페이지 열기
      const popup = window.open(
        authUrl,
        'okx_oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // 팝업 창에서 콜백 처리
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          // 팝업이 닫히면 연동 상태 확인
          checkOAuthStatus();
        }
      }, 1000);
    }
  };

  const checkOAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_BASE_URL}/api/okx/oauth/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.connected) {
        setSuccess('OKX 계정이 성공적으로 연동되었습니다!');
        
        if (onSuccess) {
          onSuccess(response.data.accounts[0]);
        }
        
        // 2초 후 모달 닫기
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('OAuth 상태 확인 실패:', err);
    }
  };

  const handleClose = () => {
    onClose();
    setError('');
    setSuccess('');
    setAuthUrl('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-lg max-w-md w-full mx-4 overflow-hidden border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Link className="text-primary" size={20} />
              <h2 className="text-xl font-bold text-foreground">
                OKX 계정 연동
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="btn-ghost p-2 rounded-md hover:bg-accent"
            >
              <X size={20} />
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="p-4 space-y-4">
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <p className="font-medium mb-2">🔐 안전한 연동 방식</p>
              <ul className="space-y-1 text-xs">
                <li>• OKX 공식 OAuth를 통한 안전한 연동</li>
                <li>• API 키를 직접 입력할 필요 없음</li>
                <li>• Read 및 Trade 권한만 요청</li>
                <li>• 언제든지 OKX에서 권한 해제 가능</li>
              </ul>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin text-primary" size={24} />
                <span className="ml-2 text-foreground">인증 URL 생성 중...</span>
              </div>
            ) : authUrl ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-foreground mb-4">
                    아래 버튼을 클릭하여 OKX 계정에 로그인하고 권한을 승인해주세요.
                  </p>
                  
                  <button
                    onClick={handleOAuthConnect}
                    className="btn-primary flex items-center justify-center gap-2 w-full py-3"
                  >
                    <ExternalLink size={16} />
                    OKX에서 연동하기
                  </button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  새 창에서 OKX 로그인 후 권한을 승인하면 자동으로 연동됩니다.
                </div>
              </div>
            ) : null}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-500 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="btn-secondary flex-1 py-2 px-4"
                disabled={loading}
              >
                취소
              </button>
              {!authUrl && !loading && (
                <button
                  onClick={generateAuthUrl}
                  className="btn-primary flex-1 py-2 px-4"
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OKXOAuthModal; 