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
 },
 
 /**
  * الحصول على الملف الشخصي للمستخدم الحالي
  */
 async getProfile(req, res, next) {
   try {
     const user = await User.findById(req.user.id);
     
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
     logger.error('خطأ في الحصول على الملف الشخصي:', error);
     next(error);
   }
 },
 
 /**
  * تحديث الملف الشخصي للمستخدم الحالي
  */
 async updateProfile(req, res, next) {
   try {
     const { name, email } = req.body;
     
     const updatedUser = await User.update(req.user.id, { name, email });
     
     res.status(200).json(formatApiResponse({
       user: {
         id: updatedUser.id,
         name: updatedUser.name,
         email: updatedUser.email,
         role: updatedUser.role,
         createdAt: updatedUser.created_at,
         updatedAt: updatedUser.updated_at
       }
     }, 'success', 'تم تحديث الملف الشخصي بنجاح'));
   } catch (error) {
     logger.error('خطأ في تحديث الملف الشخصي:', error);
     next(error);
   }
 },
 
 /**
  * تحديث كلمة المرور
  */
 async updatePassword(req, res, next) {
   try {
     const { currentPassword, newPassword } = req.body;
     
     // التحقق من كلمة المرور الحالية
     const user = await User.findById(req.user.id);
     if (!user) {
       throw new NotFoundError('المستخدم غير موجود');
     }
     
     const bcrypt = require('bcryptjs');
     const isMatch = await bcrypt.compare(currentPassword, user.password);
     if (!isMatch) {
       throw new ValidationError('كلمة المرور الحالية غير صحيحة');
     }
     
     // تشفير كلمة المرور الجديدة
     const hashedPassword = await bcrypt.hash(newPassword, 10);
     
     // تحديث كلمة المرور
     await User.update(user.id, { password: hashedPassword });
     
     res.status(200).json(formatApiResponse(null, 'success', 'تم تحديث كلمة المرور بنجاح'));
   } catch (error) {
     logger.error('خطأ في تحديث كلمة المرور:', error);
     next(error);
   }
 }
};

module.exports = userController;