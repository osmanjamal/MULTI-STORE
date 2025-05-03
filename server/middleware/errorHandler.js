const { logger } = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * وسيط لمعالجة الأخطاء العامة
 */
const errorHandler = (err, req, res, next) => {
  // تسجيل الخطأ
  logger.error('خطأ:', err);

  // نسخ الخطأ الأصلي
  let error = { ...err };
  error.message = err.message;

  // خطأ قاعدة البيانات
  if (err.code === '23505') { // خطأ قيمة فريدة مكررة
    error = new AppError('القيمة موجودة بالفعل', 400);
  }

  // خطأ كائن غير موجود
  if (err.code === '22P02') { // خطأ تحويل قيمة
    error = new AppError('معرف غير صالح', 400);
  }

  // خطأ JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('رمز غير صالح', 401);
  }

  // خطأ انتهاء صلاحية JWT
  if (err.name === 'TokenExpiredError') {
    error = new AppError('انتهت صلاحية الرمز', 401);
  }

  // إرسال استجابة الخطأ
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || 'خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
};

module.exports = errorHandler;