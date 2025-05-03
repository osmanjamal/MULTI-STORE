/**
 * أداة التنسيق لتحويل البيانات بين تنسيقات مختلفة
 */

// تنسيق استجابة API
const formatApiResponse = (data, status = 'success', message = '') => {
    return {
      status,
      message,
      data
    };
  };
  
  // تنسيق استجابة الخطأ
  const formatErrorResponse = (error, status = 'error') => {
    return {
      status,
      message: error.message || 'حدث خطأ',
      data: null
    };
  };
  
  // تنسيق تاريخ
  const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    
    const formats = {
      'YYYY-MM-DD': () => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      'DD/MM/YYYY': () => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
      },
      'YYYY-MM-DD HH:mm:ss': () => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
    };
  
    return formats[format] ? formats[format]() : d.toISOString();
  };
  
  // تنسيق رقم
  const formatNumber = (number, options = {}) => {
    const { decimals = 2, thousandSeparator = ',', decimalSeparator = '.' } = options;
    
    return number.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).replace(/\./g, decimalSeparator).replace(/,/g, thousandSeparator);
  };
  
  // تنسيق سعر
  const formatPrice = (price, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(price);
  };
  
  module.exports = {
    formatApiResponse,
    formatErrorResponse,
    formatDate,
    formatNumber,
    formatPrice
  };