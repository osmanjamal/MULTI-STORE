import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  const renderPageButtons = () => {
    const buttons = [];
    
    // عدد الصفحات التي ستظهر قبل وبعد الصفحة الحالية
    const pageNeighbours = 1;
    
    // الحد الأدنى والأقصى للصفحات التي ستظهر
    const leftBound = Math.max(1, currentPage - pageNeighbours);
    const rightBound = Math.min(totalPages, currentPage + pageNeighbours);
    
    // إضافة زر "الصفحة الأولى" إذا كانت الصفحة الحالية ليست الأولى
    if (leftBound > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="relative inline-flex items-center px-2 py-2 mx-1 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          1
        </button>
      );
      
      // إضافة زر "..." إذا كانت هناك صفحات محذوفة بين الصفحة الأولى والحد الأيسر
      if (leftBound > 2) {
        buttons.push(
          <span key="left-dots" className="relative inline-flex items-center px-2 py-2 mx-1 text-sm font-medium text-gray-500">
            ...
          </span>
        );
      }
    }
    
    // إضافة أزرار الصفحات في النطاق الحالي
    for (let page = leftBound; page <= rightBound; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`relative inline-flex items-center px-4 py-2 mx-1 text-sm font-medium rounded-md ${
            page === currentPage
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      );
    }
    
    // إضافة زر "..." إذا كانت هناك صفحات محذوفة بين الحد الأيمن والصفحة الأخيرة
    if (rightBound < totalPages - 1) {
      buttons.push(
        <span key="right-dots" className="relative inline-flex items-center px-2 py-2 mx-1 text-sm font-medium text-gray-500">
          ...
        </span>
      );
    }
    
    // إضافة زر "الصفحة الأخيرة" إذا كانت الصفحة الحالية ليست الأخيرة
    if (rightBound < totalPages) {
      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="relative inline-flex items-center px-2 py-2 mx-1 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className={`flex items-center justify-center py-3 ${className}`}>
      <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="تصفح">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">السابق</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {renderPageButtons()}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">التالي</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

Pagination.defaultProps = {
  className: ''
};

export default Pagination;