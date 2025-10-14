import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, UserPlus, Phone } from 'lucide-react';
import axios from 'axios';
import config from '../config';
import { saveToken } from '../lib/authUtils';

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // 로그인 - JSON body로 전송
        const response = await axios.post(`${config.API_BASE_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        
        const { access_token } = response.data;
        saveToken(access_token);
        
        // 사용자 정보 가져오기 (토큰에서 추출하거나 별도 엔드포인트 사용)
        const userInfo = {
          email: formData.email,
          name: formData.email.split('@')[0], // 임시로 이메일에서 이름 추출
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
        onLogin(userInfo);
        onClose();
      } else {
        // 회원가입
        // 비밀번호 확인 검증
        if (formData.password !== formData.passwordConfirm) {
          setError('비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }

        const requestData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone_number: formData.phone
        };

        // 추천코드가 입력된 경우에만 추가
        if (formData.referralCode) {
          requestData.referral_code = formData.referralCode;
        }
        
        await axios.post(`${config.API_BASE_URL}/api/auth/register`, requestData);
        
        // 회원가입 성공 후 자동 로그인
        const loginResponse = await axios.post(`${config.API_BASE_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        
        const { access_token } = loginResponse.data;
        saveToken(access_token);
        
        const userInfo = {
          email: formData.email,
          name: formData.name,
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
        onLogin(userInfo);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '', phone: '', referralCode: '' });
    setError('');
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
          className="bg-card rounded-lg max-w-md w-full mx-4 overflow-hidden border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">
              {isLogin ? '로그인' : '회원가입'}
            </h2>
            <button
              onClick={onClose}
              className="btn-ghost p-1.5 rounded-md hover:bg-accent"
            >
              <X size={18} />
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            {!isLogin && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground w-20">
                  이름
                </label>
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input pl-10 w-full"
                    placeholder="이름을 입력하세요"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground w-20">
                이메일
              </label>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground w-20">
                  전화번호
                </label>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input pl-10 w-full"
                    placeholder="010-1234-5678"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground w-20">
                비밀번호
              </label>
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input pl-10 pr-10 w-full"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground w-20">
                    비밀번호
                    확인
                  </label>
                  <div className="relative flex-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      value={formData.passwordConfirm}
                      onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                      className="input pl-10 pr-10 w-full"
                      placeholder="비밀번호 재입력"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                  <p className="text-xs text-red-500 mt-0.5 ml-23">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground w-20">
                  추천코드
                </label>
                <div className="relative flex-1">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => handleInputChange('referralCode', e.target.value)}
                    className="input pl-10 w-full"
                    placeholder="선택사항"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-base font-medium disabled:opacity-50"
            >
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>
          </form>

          {/* 모드 전환 */}
          <div className="p-3 pt-0 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal; 