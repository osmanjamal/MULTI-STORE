import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  showCloseButton = true
}) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    const handleEsc = (event) => {
      if (closeOnEsc && event.keyCode === 27) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    
    // منع التمرير على الصفحة عندما يكون النافذة مفتوحة
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, closeOnEsc]);
  
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const sizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-lg';
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* خلفية داكنة */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleOutsideClick}
        ></div>
        
        {/* هذا العنصر لمركزة النافذة عموديًا */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>
        
        {/* محتوى النافذة */}
        <div
          ref={modalRef}
          className={`inline-block transform overflow-hidden rounded-lg bg-white text-right align-bottom shadow-xl transition-all sm:my-8 sm:align-middle ${sizeClass()} w-full`}
        >
          {/* رأس النافذة */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-md bg-gray-50 text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">إغلاق</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* جسم النافذة */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {children}
          </div>
          
          {/* تذييل النافذة */}
          {footer && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
          
          {!footer && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="ml-3"
                onClick={onClose}
              >
                إغلاق
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeOnEsc: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  showCloseButton: PropTypes.bool
};

Modal.defaultProps = {
  size: 'md',
  closeOnEsc: true,
  closeOnOutsideClick: true,
  showCloseButton: true
};

export default Modal;