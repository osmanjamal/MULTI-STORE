import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ type, message, className, onClose }) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className={`border-r-4 px-4 py-3 rounded relative ${getAlertStyle()} ${className}`} role="alert">
      <span className="block sm:inline">{message}</span>
      {onClose && (
        <span
          className="absolute top-0 bottom-0 left-0 px-4 py-3 cursor-pointer"
          onClick={onClose}
        >
          <svg
            className={`fill-current h-6 w-6 ${type === 'error' ? 'text-red-500' : type === 'success' ? 'text-green-500' : 'text-gray-500'}`}
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>إغلاق</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </span>
      )}
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'warning', 'info', 'error']),
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClose: PropTypes.func
};

Alert.defaultProps = {
  type: 'info',
  className: ''
};

export default Alert;