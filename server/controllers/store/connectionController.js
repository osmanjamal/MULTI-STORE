const Connection = require('../../models/connection');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في اتصالات المتاجر
 */
const connectionController = {
  /**
   * الحصول على جميع اتصالات المستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getConnections(req, res, next) {
    try {
      // الحصول على اتصالات المستخدم
      const connections = await Connection.findByUserId(req.user.id);
      
      res.status(200).json(formatApiResponse({ connections }));
    } catch (error) {
      logger.error('خطأ في الحصول على اتصالات المتاجر:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على اتصال بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getConnectionById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على الاتصال
      const connection = await Connection.findById(id);
      
      if (!connection) {
        throw new NotFoundError('الاتصال غير موجود');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(connection.source_store_id);
      const targetStore = await Store.findById(connection.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا الاتصال');
      }
      
      res.status(200).json(formatApiResponse({ connection }));
    } catch (error) {
      logger.error('خطأ في الحصول على اتصال المتجر:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على اتصالات متجر
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getStoreConnections(req, res, next) {
    try {
      const { storeId } = req.params;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على اتصالات المتجر
      const connections = await Connection.findByStoreId(parseInt(storeId));
      
      res.status(200).json(formatApiResponse({ connections }));
    } catch (error) {
      logger.error('خطأ في الحصول على اتصالات المتجر:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء اتصال جديد بين متجرين
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createConnection(req, res, next) {
    try {
      const {
        sourceStoreId,
        targetStoreId,
        syncProducts,
        syncInventory,
        syncOrders,
        bidirectional
      } = req.body;
      
      // التحقق من توفير المتاجر
      if (!sourceStoreId || !targetStoreId) {
        throw new ValidationError('يرجى توفير معرفات المتاجر المصدر والهدف');
      }
      
      // التحقق من أن المتاجر مختلفة
      if (parseInt(sourceStoreId) === parseInt(targetStoreId)) {
        throw new ValidationError('لا يمكن إنشاء اتصال بين نفس المتجر');
      }
      
      // إنشاء الاتصال
      const connection = await Connection.create({
        sourceStoreId: parseInt(sourceStoreId),
        targetStoreId: parseInt(targetStoreId),
        syncProducts: syncProducts !== false,
        syncInventory: syncInventory !== false,
        syncOrders: syncOrders || false,
        bidirectional: bidirectional || false
      }, req.user.id);
      
      res.status(201).json(formatApiResponse({ 
        connection 
      }, 'success', 'تم إنشاء الاتصال بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء اتصال المتجر:', error);
      next(error);
    }
  },
  
  /**
   * تحديث اتصال
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateConnection(req, res, next) {
    try {
      const { id } = req.params;
      const {
        syncProducts,
        syncInventory,
        syncOrders,
        bidirectional
      } = req.body;
      
      // الحصول على الاتصال
      const connection = await Connection.findById(id);
      
      if (!connection) {
        throw new NotFoundError('الاتصال غير موجود');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(connection.source_store_id);
      const targetStore = await Store.findById(connection.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا الاتصال');
      }
      
      // تحديث الاتصال
      const updatedConnection = await Connection.update(id, {
        syncProducts,
        syncInventory,
        syncOrders,
        bidirectional
      }, req.user.id);
      
      res.status(200).json(formatApiResponse({ 
        connection: updatedConnection 
      }, 'success', 'تم تحديث الاتصال بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث اتصال المتجر:', error);
      next(error);
    }
  },
  
  /**
   * حذف اتصال
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteConnection(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على الاتصال
      const connection = await Connection.findById(id);
      
      if (!connection) {
        throw new NotFoundError('الاتصال غير موجود');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(connection.source_store_id);
      const targetStore = await Store.findById(connection.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذا الاتصال');
      }
      
      // حذف الاتصال
      await Connection.delete(id, req.user.id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف الاتصال بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف اتصال المتجر:', error);
      next(error);
    }
  }
};

module.exports = connectionController;