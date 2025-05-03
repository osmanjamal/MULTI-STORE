/**
 * أدوات معالجة الأخطاء
 * توفر دوال وفئات لمعالجة الأخطاء في التطبيق
 */

/**
 * فئة الخطأ الأساسية للتطبيق
 * @extends Error
 */
export class AppError extends Error {
    /**
     * إنشاء خطأ جديد
     * @param {string} message - رسالة الخطأ
     * @param {string} code - رمز الخطأ
     * @param {*} data - بيانات إضافية متعلقة بالخطأ
     */
    constructor(message, code = 'APP_ERROR', data = null) {
      super(message);
      this.name = this.constructor.name;
      this.code = code;
      this.data = data;
      
      // تعيين تتبع كامل للخطأ إذا كان مدعوماً
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  /**
   * خطأ المصادقة
   * @extends AppError
   */
  export class AuthError extends AppError {
    constructor(message = 'خطأ في المصادقة', data = null) {
      super(message, 'AUTH_ERROR', data);
    }
  }
  
  /**
   * خطأ الوصول غير المصرح به
   * @extends AppError
   */
  export class UnauthorizedError extends AppError {
    constructor(message = 'غير مصرح بالوصول', data = null) {
      super(message, 'UNAUTHORIZED', data);
    }
  }
  
  /**
   * خطأ عدم العثور على الموارد
   * @extends AppError
   */
  export class NotFoundError extends AppError {
    constructor(message = 'لم يتم العثور على المورد', data = null) {
      super(message, 'NOT_FOUND', data);
    }
  }
  
  /**
   * خطأ التحقق من الصحة
   * @extends AppError
   */
  export class ValidationError extends AppError {
    constructor(message = 'خطأ في التحقق من الصحة', data = null) {
      super(message, 'VALIDATION_ERROR', data);
    }
  }
  
  /**
   * خطأ الشبكة
   * @extends AppError
   */
  export class NetworkError extends AppError {
    constructor(message = 'خطأ في الاتصال بالشبكة', data = null) {
      super(message, 'NETWORK_ERROR', data);
    }
  }
  
  /**
   * خطأ API
   * @extends AppError
   */
  export class ApiError extends AppError {
    /**
     * إنشاء خطأ API جديد
     * @param {string} message - رسالة الخطأ
     * @param {number} status - رمز حالة HTTP
     * @param {*} data - بيانات إضافية متعلقة بالخطأ
     */
    constructor(message = 'خطأ في طلب API', status = 500, data = null) {
      super(message, `API_ERROR_${status}`, data);
      this.status = status;
    }
  }
  
  /**
   * معالجة خطأ HTTP
   * @param {Error} error - كائن الخطأ
   * @returns {AppError} كائن خطأ منسق
   */
  export const handleHttpError = (error) => {
    // إذا كان الخطأ من axios فله شكل معين
    if (error.response) {
      // الخادم رد بحالة خارج نطاق 2xx
      const { status, data } = error.response;
      const message = data.message || error.message || 'حدث خطأ أثناء تنفيذ الطلب';
      
      switch (status) {
        case 401:
          return new UnauthorizedError(message, data);
        case 404:
          return new NotFoundError(message, data);
        case 422:
          return new ValidationError(message, data);
        default:
          return new ApiError(message, status, data);
      }
    } else if (error.request) {
      // تم إنشاء الطلب لكن لم يتم تلقي استجابة
      return new NetworkError('لم يتم تلقي استجابة من الخادم', error.request);
    } else {
      // حدث خطأ أثناء إعداد الطلب
      return new AppError(error.message || 'حدث خطأ غير معروف');
    }
  };
  
  /**
   * تنسيق رسالة الخطأ للعرض
   * @param {Error|AppError|string} error - كائن الخطأ أو رسالة الخطأ
   * @returns {string} رسالة الخطأ المنسقة
   */
  export const formatErrorMessage = (error) => {
    if (!error) return 'حدث خطأ غير معروف';
    
    if (typeof error === 'string') return error;
    
    if (error instanceof AppError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message || 'حدث خطأ غير معروف';
    }
    
    return 'حدث خطأ غير معروف';
  };
  
  /**
   * تنسيق البيانات الإضافية للخطأ
   * @param {Error|AppError} error - كائن الخطأ
   * @returns {Object} البيانات الإضافية المنسقة
   */
  export const formatErrorData = (error) => {
    if (!error) return null;
    
    if (error instanceof AppError && error.data) {
      return error.data;
    }
    
    if (error.response && error.response.data) {
      return error.response.data;
    }
    
    return null;
  };
  
  /**
   * التقاط وتسجيل الأخطاء في التطبيق
   * @param {Error} error - كائن الخطأ
   * @param {string} context - سياق حدوث الخطأ
   */
  export const logError = (error, context = '') => {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : '';
    
    console.error(`${prefix} ${timestamp}:`, error);
    
    // هنا يمكن إضافة أكواد لإرسال الأخطاء إلى خدمة تتبع الأخطاء مثل Sentry
    
    // if (process.env.NODE_ENV === 'production' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  };
  
  /**
   * تصنيف الخطأ وإنشاء نوع الخطأ المناسب
   * @param {Error|Object|string} error - كائن الخطأ أو رسالته
   * @returns {AppError} كائن خطأ منسق
   */
  export const classifyError = (error) => {
    if (error instanceof AppError) {
      return error;
    }
    
    if (error instanceof Error) {
      // تصنيف أنواع الأخطاء المضمنة
      if (error.name === 'TypeError') {
        return new AppError(error.message, 'TYPE_ERROR');
      }
      
      if (error.name === 'ReferenceError') {
        return new AppError(error.message, 'REFERENCE_ERROR');
      }
      
      if (error.name === 'SyntaxError') {
        return new AppError(error.message, 'SYNTAX_ERROR');
      }
      
      return new AppError(error.message);
    }
    
    if (typeof error === 'string') {
      return new AppError(error);
    }
    
    if (error && typeof error === 'object') {
      return new AppError(error.message || 'حدث خطأ غير معروف', error.code);
    }
    
    return new AppError('حدث خطأ غير معروف');
  };
  
  /**
   * معالج أخطاء عام يمكن استخدامه كدالة مغلفة
   * @param {Function} fn - الدالة التي سيتم تنفيذها
   * @param {Function} onError - دالة معالجة الخطأ (اختيارية)
   * @param {string} context - سياق التنفيذ
   * @returns {Function} دالة مغلفة مع معالجة الأخطاء
   */
  export const withErrorHandling = (fn, onError, context = '') => {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        logError(error, context);
        
        const formattedError = classifyError(error);
        
        if (typeof onError === 'function') {
          onError(formattedError);
        }
        
        throw formattedError;
      }
    };
  };
  
  export default {
    AppError,
    AuthError,
    UnauthorizedError,
    NotFoundError,
    ValidationError,
    NetworkError,
    ApiError,
    handleHttpError,
    formatErrorMessage,
    formatErrorData,
    logError,
    classifyError,
    withErrorHandling,
  };