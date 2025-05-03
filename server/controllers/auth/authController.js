const User = require('../../models/user');
const { AuthenticationError, ValidationError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في المصادقة
 */
const authController = {
  /**
   * تسجيل مستخدم جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      
      // التحقق من وجود المستخدم
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new ValidationError('البريد الإلكتروني مستخدم بالفعل');
      }
      
      // إنشاء المستخدم
      const user = await User.create({ name, email, password });
      
      // إنشاء رمز المصادقة
      const token = User.generateAuthToken(user.id);
      
      // تعيين ملف تعريف الارتباط
      const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
      };
      
      if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
      }
      
      res.cookie('token', token, cookieOptions);
      
      res.status(201).json(formatApiResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        },
        token
      }, 'success', 'تم إنشاء الحساب بنجاح'));
    } catch (error) {
      logger.error('خطأ في تسجيل المستخدم:', error);
      next(error);
    }
  },
  
  /**
   * تسجيل دخول مستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // التحقق من وجود البريد الإلكتروني وكلمة المرور
      if (!email || !password) {
        throw new ValidationError('يرجى توفير البريد الإلكتروني وكلمة المرور');
      }
      
      // التحقق من وجود المستخدم
      const user = await User.findByEmail(email);
      if (!user) {
        throw new AuthenticationError('بيانات الاعتماد غير صالحة');
      }
      
      // التحقق من صحة كلمة المرور
      const isPasswordValid = await User.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('بيانات الاعتماد غير صالحة');
      }
      
      // إنشاء رمز المصادقة
      const token = User.generateAuthToken(user.id);
      
      // تعيين ملف تعريف الارتباط
      const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
      };
      
      if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
      }
      
      res.cookie('token', token, cookieOptions);
      
      res.status(200).json(formatApiResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        },
        token
      }, 'success', 'تم تسجيل الدخول بنجاح'));
    } catch (error) {
      logger.error('خطأ في تسجيل الدخول:', error);
      next(error);
    }
  },
  
  /**
   * تسجيل خروج مستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async logout(req, res, next) {
    try {
      // مسح ملف تعريف الارتباط
      res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم تسجيل الخروج بنجاح'));
    } catch (error) {
      logger.error('خطأ في تسجيل الخروج:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على المستخدم الحالي
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      res.status(200).json(formatApiResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }));
    } catch (error) {
      logger.error('خطأ في الحصول على المستخدم الحالي:', error);
      next(error);
    }
  },
  
  /**
   * تحديث كلمة مرور المستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // التحقق من وجود كلمة المرور الحالية والجديدة
      if (!currentPassword || !newPassword) {
        throw new ValidationError('يرجى توفير كلمة المرور الحالية والجديدة');
      }
      
      // التحقق من وجود المستخدم
      const user = await User.findById(req.user.id);
      
      // التحقق من صحة كلمة المرور الحالية
      const isPasswordValid = await User.comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('كلمة المرور الحالية غير صحيحة');
      }
      
      // تحديث كلمة المرور
      await User.update(user.id, { password: newPassword });
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم تحديث كلمة المرور بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث كلمة المرور:', error);
      next(error);
    }
  }
};

module.exports = authController;