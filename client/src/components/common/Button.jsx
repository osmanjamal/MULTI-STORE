import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  type,
  onClick,
  className,
  disabled,
  loading,
  variant,
  size,
  icon
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-700 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-700 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-700 text-white';
      case 'outline':
        return 'bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent';
      default:
        return 'bg-blue-500 hover:bg-blue-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1 px-2 text-xs';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  const baseClasses = 'font-bold rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out';
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
    >
      <div className="flex items-center justify-center">
        {loading && (
          <svg className="animate-spin -mr-1 h-4 w-4 text-white ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {icon && !loading && <span className="ml-2">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.node
};

Button.defaultProps = {
  type: 'button',
  className: '',
  disabled: false,
  loading: false,
  variant: 'primary',
  size: 'md'
};

export default Button;