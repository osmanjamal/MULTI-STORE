const SyncLog = require('../../models/syncLog');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في سجلات المزامنة
 */
const logController = {
  /**
   * الحصول على سجلات المزامنة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getLogs(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20,
        sourceStoreId,
        targetStoreId,
        syncRuleId,
        type,
        status,
        action,
        entityType,
        entityId,
        startDate,
        endDate,
        sortBy,
        sortOrder
      } = req.query;
      
      // بناء مرشحات البحث
      const filters = {
        sourceStoreId,
        targetStoreId,
        syncRuleId,
        type,
        status,
        action,
        entityType,
        entityId,
        startDate,
        endDate,
        sortBy,
        sortOrder
      };
      
      // الحصول على سجلات المزامنة
      const logs = await SyncLog.search(filters, req.user.id, parseInt(page), parseInt(limit));
      
      res.status(200).json(formatApiResponse(logs));
    } catch (error) {
      logger.error('خطأ في الحصول على سجلات المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجل مزامنة بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getLogById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على سجل المزامنة
      const log = await SyncLog.findById(id);
      
      if (!log) {
        throw new NotFoundError('سجل المزامنة غير موجود');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(log.source_store_id);
      const targetStore = await Store.findById(log.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا السجل');
      }
      
      res.status(200).json(formatApiResponse({ log }));
    } catch (error) {
      logger.error('خطأ في الحصول على سجل المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجلات مزامنة متجر
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getStoreSourceLogs(req, res, next) {
    try {
      const { storeId } = req.params;
      const { 
        page = 1, 
        limit = 20,
        startDate,
        endDate,
        type,
        status
      } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على سجلات المزامنة للمتجر المصدر
      const logs = await SyncLog.findBySourceStoreId(
        parseInt(storeId),
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );
      
      res.status(200).json(formatApiResponse(logs));
    } catch (error) {
      logger.error('خطأ في الحصول على سجلات مزامنة المتجر المصدر:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجلات مزامنة المتجر الهدف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getStoreTargetLogs(req, res, next) {
    try {
      const { storeId } = req.params;
      const { 
        page = 1, 
        limit = 20,
        startDate,
        endDate,
        type,
        status
      } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على سجلات المزامنة للمتجر الهدف
      const logs = await SyncLog.findByTargetStoreId(
        parseInt(storeId),
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );
      
      res.status(200).json(formatApiResponse(logs));
    } catch (error) {
      logger.error('خطأ في الحصول على سجلات مزامنة المتجر الهدف:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجلات مزامنة قاعدة المزامنة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getSyncRuleLogs(req, res, next) {
    try {
      const { syncRuleId } = req.params;
      const { 
        page = 1, 
        limit = 20,
        startDate,
        endDate,
        status
      } = req.query;
      
      // الحصول على سجلات المزامنة لقاعدة المزامنة
      const logs = await SyncLog.findBySyncRuleId(
        parseInt(syncRuleId),
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );
      
      res.status(200).json(formatApiResponse(logs));
    } catch (error) {
      logger.error('خطأ في الحصول على سجلات مزامنة قاعدة المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجلات مزامنة كيان
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getEntityLogs(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const { 
        page = 1, 
        limit = 20
      } = req.query;
      
      // الحصول على سجلات المزامنة للكيان
      const logs = await SyncLog.findByEntity(
        entityType,
        entityId,
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );
      
      res.status(200).json(formatApiResponse(logs));
    } catch (error) {
      logger.error('خطأ في الحصول على سجلات مزامنة الكيان:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء سجل مزامنة جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createLog(req, res, next) {
    try {
      const {
        syncRuleId,
        sourceStoreId,
        targetStoreId,
        type,
        status,
        action,
        entityType,
        entityId,
        externalSourceId,
        externalTargetId,
        details,
        error
      } = req.body;
      
      // التحقق من توفير المتاجر
      if (!sourceStoreId || !targetStoreId) {
        throw new ValidationError('يرجى توفير معرفات المتاجر المصدر والهدف');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(sourceStoreId);
      const targetStore = await Store.findById(targetStoreId);
      
      if (!sourceStore || !targetStore) {
        throw new NotFoundError('أحد المتاجر غير موجود');
      }
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بإنشاء سجل مزامنة لهذه المتاجر');
      }
      
      // إنشاء سجل المزامنة
      const log = await SyncLog.create({
        syncRuleId,
        sourceStoreId,
        targetStoreId,
        type,
        status,
        action,
        entityType,
        entityId,
        externalSourceId,
        externalTargetId,
        details,
        error
      });
      
      res.status(201).json(formatApiResponse({ 
        log 
      }, 'success', 'تم إنشاء سجل المزامنة بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء سجل المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * تنظيف سجلات المزامنة القديمة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async cleanupLogs(req, res, next) {
    try {
      // التحقق من صلاحيات المستخدم
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('غير مصرح لك بتنظيف سجلات المزامنة');
      }
      
      const { days = 30 } = req.body;
      
      // تنظيف سجلات المزامنة القديمة
      const deletedCount = await SyncLog.deleteOldLogs(parseInt(days));
      
      res.status(200).json(formatApiResponse({ 
        deletedCount 
      }, 'success', `تم حذف ${deletedCount} من سجلات المزامنة القديمة`));
    } catch (error) {
      logger.error('خطأ في تنظيف سجلات المزامنة:', error);
      next(error);
    }
  }
};

module.exports = logController;