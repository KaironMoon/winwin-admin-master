import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

const FlashMessage = ({ 
  message, 
  severity = 'info', 
  isVisible, 
  onClose, 
  duration = 3000,
  autoClose = true
}) => {
  useEffect(() => {
    if (isVisible && autoClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, autoClose, duration]); // onClose 제거

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const config = getSeverityConfig(severity);
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className={`fixed bottom-4 left-4 z-50 max-w-sm w-full`}
        >
          <div className={`
            ${config.bgColor} 
            ${config.borderColor} 
            ${config.textColor}
            border rounded-lg shadow-lg p-4
          `}>
            <div className="flex items-start space-x-3">
              <IconComponent 
                size={20} 
                className={`${config.iconColor} flex-shrink-0 mt-0.5`} 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-5">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlashMessage; 