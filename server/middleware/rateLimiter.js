const rateLimit = require('express-rate-limit');

/**
 * وسيط لتحديد معدل الطلبات
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  standardHeaders: true, // رؤوس قياسية لتحديد المعدل
  legacyHeaders: false, // تعطيل الرؤوس القديمة
  message: {
    status: 'fail',
    message: 'تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة مرة أخرى لاحقاً'
  }
});

/**
 * وسيط لتحديد معدل طلبات تسجيل الدخول
 */
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 5, // 5 محاولات فاشلة لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // تخطي الطلبات الناجحة
  message: {
    status: 'fail',
    message: 'محاولات تسجيل دخول كثيرة جداً، يرجى المحاولة مرة أخرى بعد ساعة'
  }
});

/**
 * وسيط لتحديد معدل طلبات ويب هوك
 */
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 30, // 30 طلب لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'تم تجاوز الحد الأقصى لطلبات الويب هوك'
  }
});

module.exports = { apiLimiter, loginLimiter, webhookLimiter };