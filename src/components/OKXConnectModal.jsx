import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Eye, EyeOff, Link, AlertCircle, CheckCircle } from 'lucide-react';
import UserServices from '../services/userServices';

const OKXConnectModal = ({ isOpen, onClose, onSuccess }) => {
  const [directFormData, setDirectFormData] = useState({
    apiKey: '',
    secretKey: '',
    passphrase: ''
  });
  const [showDirectSecrets, setShowDirectSecrets] = useState(false);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState('');
  const [directSuccess, setDirectSuccess] = useState('');


  const handleDirectInputChange = (field, value) => {
    setDirectFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setDirectError('');
    setDirectSuccess('');
  };


  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    setDirectLoading(true);
    setDirectError('');
    setDirectSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await UserServices.patchUserMe(
        directFormData.apiKey,
        directFormData.secretKey,
        directFormData.passphrase
      );

      setDirectSuccess('OKX API 정보가 성공적으로 저장되었습니다!');
      
      // 성공 후 콜백 호출
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // 폼 초기화
      setDirectFormData({
        apiKey: '',
        secretKey: '',
        passphrase: ''
      });

    } catch (err) {
      setDirectError(err.response?.data?.detail || err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setDirectLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Link className="text-primary" size={20} />
              <h2 className="text-xl font-bold text-foreground">
                OKX 계정 연동
              </h2>
            </div>
            <button
              onClick={onClose}
              className="btn-ghost p-2 rounded-md hover:bg-accent"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-6 p-4">
            {/* 직접 입력 섹션 */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-4">직접 입력</h3>
              <form onSubmit={handleDirectSubmit} className="space-y-4">
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <p className="font-medium mb-2">💡 간편 저장</p>
                  <ul className="space-y-1 text-xs">
                    <li>• API 정보만 간단히 저장합니다</li>
                    <li>• 계정명과 테스트넷 설정은 제외됩니다</li>
                    <li>• PATCH /api/user 엔드포인트로 저장됩니다</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type={showDirectSecrets ? 'text' : 'password'}
                      value={directFormData.apiKey}
                      onChange={(e) => handleDirectInputChange('apiKey', e.target.value)}
                      className="input pl-10"
                      placeholder="OKX API Key를 입력하세요"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Secret Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type={showDirectSecrets ? 'text' : 'password'}
                      value={directFormData.secretKey}
                      onChange={(e) => handleDirectInputChange('secretKey', e.target.value)}
                      className="input pl-10"
                      placeholder="OKX Secret Key를 입력하세요"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Passphrase
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type={showDirectSecrets ? 'text' : 'password'}
                      value={directFormData.passphrase}
                      onChange={(e) => handleDirectInputChange('passphrase', e.target.value)}
                      className="input pl-10"
                      placeholder="OKX Passphrase를 입력하세요"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectSecrets(!showDirectSecrets)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showDirectSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showDirectSecrets ? '숨기기' : '보기'}
                  </button>
                </div>

                {directError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <AlertCircle size={16} />
                    {directError}
                  </div>
                )}

                {directSuccess && (
                  <div className="flex items-center gap-2 text-green-500 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <CheckCircle size={16} />
                    {directSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={directLoading}
                  className="w-full btn-secondary py-2 px-4"
                >
                  {directLoading ? '저장 중...' : '저장하기'}
                </button>
              </form>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="p-6 pt-0">
            <button
              onClick={onClose}
              className="w-full btn-ghost"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OKXConnectModal; 