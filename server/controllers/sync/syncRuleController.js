const SyncRule = require('../../models/syncRule');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في قواعد المزامنة
 */
const syncRuleController = {
  /**
   * الحصول على جميع قواعد المزامنة للمستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getSyncRules(req, res, next) {
    try {
      // الحصول على قواعد المزامنة
      const syncRules = await SyncRule.findByUserId(req.user.id);
      
      res.status(200).json(formatApiResponse({ syncRules }));
    } catch (error) {
      logger.error('خطأ في الحصول على قواعد المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على قاعدة مزامنة بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getSyncRuleById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على قاعدة المزامنة
      const syncRule = await SyncRule.findById(id);
      
      if (!syncRule) {
        throw new NotFoundError('قاعدة المزامنة غير موجودة');
      }
      
      //// التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(syncRule.source_store_id);
      const targetStore = await Store.findById(syncRule.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذه القاعدة');
      }
      
      res.status(200).json(formatApiResponse({ syncRule }));
    } catch (error) {
      logger.error('خطأ في الحصول على قاعدة المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على قواعد المزامنة للمتجر المصدر
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getSourceStoreSyncRules(req, res, next) {
    try {
      const { storeId } = req.params;
      const { type } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على قواعد المزامنة النشطة للمتجر المصدر
      const syncRules = await SyncRule.findActiveBySourceStore(parseInt(storeId), type);
      
      res.status(200).json(formatApiResponse({ syncRules }));
    } catch (error) {
      logger.error('خطأ في الحصول على قواعد المزامنة للمتجر المصدر:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على قواعد المزامنة للمتجر الهدف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getTargetStoreSyncRules(req, res, next) {
    try {
      const { storeId } = req.params;
      const { type } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على قواعد المزامنة النشطة للمتجر الهدف
      const syncRules = await SyncRule.findActiveByTargetStore(parseInt(storeId), type);
      
      res.status(200).json(formatApiResponse({ syncRules }));
    } catch (error) {
      logger.error('خطأ في الحصول على قواعد المزامنة للمتجر الهدف:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء قاعدة مزامنة جديدة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createSyncRule(req, res, next) {
    try {
      const {
        name,
        sourceStoreId,
        targetStoreId,
        type,
        conditions,
        transformations,
        isActive,
        schedule
      } = req.body;
      
      // التحقق من توفير المتاجر
      if (!sourceStoreId || !targetStoreId) {
        throw new ValidationError('يرجى توفير معرفات المتاجر المصدر والهدف');
      }
      
      // التحقق من أن المتاجر مختلفة
      if (parseInt(sourceStoreId) === parseInt(targetStoreId)) {
        throw new ValidationError('لا يمكن إنشاء قاعدة مزامنة بين نفس المتجر');
      }
      
      // التحقق من صحة النوع
      const validTypes = ['product', 'inventory', 'order'];
      if (!type || !validTypes.includes(type)) {
        throw new ValidationError('نوع قاعدة المزامنة غير صالح');
      }
      
      // التحقق من اسم القاعدة
      if (!name || name.trim() === '') {
        throw new ValidationError('يرجى توفير اسم قاعدة المزامنة');
      }
      
      // إنشاء قاعدة المزامنة
      const syncRule = await SyncRule.create({
        name,
        sourceStoreId: parseInt(sourceStoreId),
        targetStoreId: parseInt(targetStoreId),
        type,
        conditions,
        transformations,
        isActive: isActive !== false,
        schedule
      }, req.user.id);
      
      res.status(201).json(formatApiResponse({ 
        syncRule 
      }, 'success', 'تم إنشاء قاعدة المزامنة بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء قاعدة المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * تحديث قاعدة مزامنة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateSyncRule(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        conditions,
        transformations,
        isActive,
        schedule
      } = req.body;
      
      // الحصول على قاعدة المزامنة
      const syncRule = await SyncRule.findById(id);
      
      if (!syncRule) {
        throw new NotFoundError('قاعدة المزامنة غير موجودة');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(syncRule.source_store_id);
      const targetStore = await Store.findById(syncRule.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذه القاعدة');
      }
      
      // تحديث قاعدة المزامنة
      const updatedSyncRule = await SyncRule.update(id, {
        name,
        conditions,
        transformations,
        isActive,
        schedule
      }, req.user.id);
      
      res.status(200).json(formatApiResponse({ 
        syncRule: updatedSyncRule 
      }, 'success', 'تم تحديث قاعدة المزامنة بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث قاعدة المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * حذف قاعدة مزامنة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteSyncRule(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على قاعدة المزامنة
      const syncRule = await SyncRule.findById(id);
      
      if (!syncRule) {
        throw new NotFoundError('قاعدة المزامنة غير موجودة');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(syncRule.source_store_id);
      const targetStore = await Store.findById(syncRule.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذه القاعدة');
      }
      
      // حذف قاعدة المزامنة
      await SyncRule.delete(id, req.user.id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف قاعدة المزامنة بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف قاعدة المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * تفعيل أو تعطيل قاعدة مزامنة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async toggleSyncRule(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      // الحصول على قاعدة المزامنة
      const syncRule = await SyncRule.findById(id);
      
      if (!syncRule) {
        throw new NotFoundError('قاعدة المزامنة غير موجودة');
      }
      
      // التحقق من ملكية المتاجر
      const sourceStore = await Store.findById(syncRule.source_store_id);
      const targetStore = await Store.findById(syncRule.target_store_id);
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذه القاعدة');
      }
      
      // تحديث حالة قاعدة المزامنة
      const updatedSyncRule = await SyncRule.update(id, {
        isActive: isActive !== false
      }, req.user.id);
      
      const statusMessage = updatedSyncRule.is_active ? 'تم تفعيل قاعدة المزامنة بنجاح' : 'تم تعطيل قاعدة المزامنة بنجاح';
      
      res.status(200).json(formatApiResponse({ 
        syncRule: updatedSyncRule 
      }, 'success', statusMessage));
    } catch (error) {
      logger.error('خطأ في تفعيل/تعطيل قاعدة المزامنة:', error);
      next(error);
    }
  }
};

module.exports = syncRuleController;