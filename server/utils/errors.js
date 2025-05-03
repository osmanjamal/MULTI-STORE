// فئة الأخطاء المخصصة
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // فئة خطأ المصادقة
  class AuthenticationError extends AppError {
    constructor(message = 'غير مصرح') {
      super(message, 401);
    }
  }
  
  // فئة خطأ الوصول
  class ForbiddenError extends AppError {
    constructor(message = 'غير مسموح') {
      super(message, 403);
    }
  }
  
  // فئة خطأ غير موجود
  class NotFoundError extends AppError {
    constructor(message = 'لم يتم العثور عليه') {
      super(message, 404);
    }
  }
  
  // فئة خطأ التحقق
  class ValidationError extends AppError {
    constructor(message = 'بيانات غير صالحة') {
      super(message, 400);
    }
  }
  
  // فئة خطأ المزامنة
  class SyncError extends AppError {
    constructor(message = 'فشل المزامنة', statusCode = 500) {
      super(message, statusCode);
    }
  }
  
  // فئة خطأ API المتجر
  class MarketplaceApiError extends AppError {
    constructor(message = 'فشل طلب API المتجر', statusCode = 500) {
      super(message, statusCode);
    }
  }
  
  module.exports = {
    AppError,
    AuthenticationError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    SyncError,
    MarketplaceApiError
  };