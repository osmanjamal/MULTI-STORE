const User = require('../../models/user');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في المستخدمين
 */
const userController = {
  /**
   * الحصول على جميع المستخدمين (للمشرفين فقط)
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getAllUsers(req, res, next) {
    try {
      // التحقق من صلاحيات المستخدم
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('غير مصرح لك بهذه العملية');
      }
      
      // استعلام مباشر لأن النموذج لا يحتوي على دالة للحصول على جميع المستخدمين
      const { pool } = require('../../config/database');
      const result = await pool.query(
        `SELECT id, name, email, role, created_at, updated_at
         FROM users
         ORDER BY created_at DESC`
      );
      
      res.status(200).json(formatApiResponse({
        users: result.rows
      }));
    } catch (error) {
      logger.error('خطأ في الحصول على جميع المستخدمين:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على مستخدم بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      // التحقق من صلاحيات المستخدم
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        throw new ForbiddenError('غير مصرح لك بهذه العملية');
      }
      
      const user = await User.findById(id);
      
      if (!user) {
        throw new NotFoundError('المستخدم غير موجود');
      }
      
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
      logger.error('خطأ في الحصول على المستخدم:', error);
      next(error);
    }
  },
  
  /**
   * تحديث مستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      
      // التحقق من صلاحيات المستخدم
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        throw new ForbiddenError('غير مصرح لك بهذه العملية');
      }
      
      const user = await User.findById(id);
      
      if (!user) {
        throw new NotFoundError('المستخدم غير موجود');
      }
      
      // تحديث المستخدم
      const updatedUser = await User.update(id, { name, email });
      
      res.status(200).json(formatApiResponse({
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at
        }
      }, 'success', 'تم تحديث المستخدم بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث المستخدم:', error);
      next(error);
    }
  },
  
  /**
   * تحديث دور المستخدم (للمشرفين فقط)
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      // التحقق من صلاحيات المستخدم
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('غير مصرح لك بهذه العملية');
      }
      
      // التحقق من صحة الدور
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(role)) {
        throw new ValidationError('الدور غير صالح');
      }
      
      const user = await User.findById(id);
      
      if (!user) {
        throw new NotFoundError('المستخدم غير موجود');
      }
      
      // تحديث دور المستخدم
      const updatedUser = await User.update(id, { role });
      
      res.status(200).json(formatApiResponse({
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at
        }
      }, 'success', 'تم تحديث دور المستخدم بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث دور المستخدم:', error);
      next(error);
    }
  },
  
  /**
   * حذف مستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      // التحقق من صلاحيات المستخدم
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        throw new ForbiddenError('غير مصرح لك بهذه العملية');
      }
      
      const user = await User.findById(id);
      
      if (!user) {
        throw new NotFoundError('المستخدم غير موجود');
      }
      
      // حذف المستخدم
      await User.delete(id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف المستخدم بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف المستخدم:', error);
      next(error);
    }
  }
};

module.exports = userController;