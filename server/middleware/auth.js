const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { AuthenticationError, ForbiddenError } = require('../utils/errors');
const { logger } = require('../utils/logger');

/**
 * وسيط للتحقق من مصادقة المستخدم
 */
const auth = async (req, res, next) => {
  try {
    let token;
    
    // الحصول على الرمز من الرأس أو الكوكيز
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // التحقق من وجود الرمز
    if (!token) {
      throw new AuthenticationError('يرجى تسجيل الدخول للوصول');
    }
    
    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // البحث عن المستخدم
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.id]
    );
    
    const user = result.rows[0];
    
    // التحقق من وجود المستخدم
    if (!user) {
      throw new AuthenticationError('المستخدم المرتبط بهذا الرمز غير موجود');
    }
    
    // تخزين المستخدم في الطلب
    req.user = user;
    next();
  } catch (error) {
    logger.error('خطأ المصادقة:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('رمز غير صالح'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('انتهت صلاحية الرمز'));
    }
    
    next(error);
  }
};

/**
 * وسيط للتحقق من أدوار المستخدم
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('يجب تسجيل الدخول'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('غير مصرح لك بهذه العملية'));
    }
    
    next();
  };
};

module.exports = { auth, authorize };