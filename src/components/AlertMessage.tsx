import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { AlertProps } from '../types';

const AlertMessage: React.FC<AlertProps> = ({ type, message }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [type]);

  if (!isVisible) return null;

  const alertStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    danger: <XCircle size={18} className="text-red-500" />,
    warning: <AlertTriangle size={18} className="text-yellow-500" />,
    info: <Info size={18} className="text-blue-500" />
  };

  return (
    <div className={`flex items-start p-4 border rounded-lg animate-fadeIn ${alertStyles[type]}`}>
      <div className="flex-shrink-0 mr-3">{icons[type]}</div>
      <div className="flex-1 text-sm">{message}</div>
      <button 
        onClick={() => setIsVisible(false)}
        className={`ml-3 text-${type === 'danger' ? 'red' : type === 'success' ? 'green' : 'gray'}-500 hover:text-${type === 'danger' ? 'red' : type === 'success' ? 'green' : 'gray'}-700`}
      >
        <span className="sr-only">Fechar</span>
        <svg 
          className="h-5 w-5" 
          fill="currentColor" 
          viewBox="0 0 20 20" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fillRule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default AlertMessage;