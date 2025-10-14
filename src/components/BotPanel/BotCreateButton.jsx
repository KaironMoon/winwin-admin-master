import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import BotCreateConfirmModal from './BotCreateConfirmModal';
import BacktestModal from '../BacktestModal';

const BotCreateButton = ({ 
  isCreating, 
  isDisabled, 
  onCreateBot,
  settings,
  entryData,
  isDemoMode = false,
  reverseEnabled = false,
  reverseSettings = {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);

  const handleButtonClick = () => {
    if (!isCreating && !isDisabled) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    await onCreateBot();
  };

  const handleBacktestButtonClick = () => {
    setIsBacktestModalOpen(true);
  };

  const handleBacktestModalClose = () => {
    setIsBacktestModalOpen(false);
  };

  return (
    <div className="space-y-3 mb-3">
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex space-x-3">
          {/* 봇 만들기 버튼 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleButtonClick}
            disabled={isCreating || isDisabled}
            className={`flex-1 py-4 px-6 text-base font-semibold rounded-lg transition-all duration-300 ${
              isCreating || isDisabled
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white dark:text-white'
            }`}
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="font-medium">생성 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">
                  봇 만들기
                </span>
              </div>
            )}
          </motion.button>

          {/* 백테스트 버튼 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBacktestButtonClick}
            disabled={isCreating}
            className={`py-4 px-6 text-base font-semibold rounded-lg transition-all duration-300 ${
              isCreating
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white dark:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">백테스트</span>
            </div>
          </motion.button>
        </div>
      </div>

      <BotCreateConfirmModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        settings={settings}
        entryData={entryData}
        isCreating={isCreating}
        reverseEnabled={reverseEnabled}
        reverseSettings={reverseSettings}
      />

      <BacktestModal
        isOpen={isBacktestModalOpen}
        onClose={handleBacktestModalClose}
        settings={settings}
        entryData={entryData}
      />
    </div>
  );
};

export default BotCreateButton; 