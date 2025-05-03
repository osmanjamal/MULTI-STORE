import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, title, className, bodyClassName, headerClassName, footerClassName, footer }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${headerClassName}`}>
          {typeof title === 'string' ? <h3 className="text-lg font-medium text-gray-900">{title}</h3> : title}
        </div>
      )}
      
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  footer: PropTypes.node
};

Card.defaultProps = {
  className: '',
  bodyClassName: '',
  headerClassName: '',
  footerClassName: ''
};

export default Card;