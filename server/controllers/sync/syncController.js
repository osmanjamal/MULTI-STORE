const SyncRule = require('../../models/syncRule');
const SyncLog = require('../../models/syncLog');
const Store = require('../../models/store');
const Product = require('../../models/product');
const Variant = require('../../models/variant');
const Inventory = require('../../models/inventory');
const { NotFoundError, ValidationError, ForbiddenError, SyncError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في المزامنة
 */
const syncController = {
  /**
   * مزامنة منتج بين متجرين
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async syncProduct(req, res, next) {
    try {
      const { sourceStoreId, targetStoreId, productId } = req.params;
      
      // التحقق من وجود المتاجر وملكيتها
      const sourceStore = await Store.findById(sourceStoreId);
      const targetStore = await Store.findById(targetStoreId);
      
      if (!sourceStore || !targetStore) {
        throw new NotFoundError('أحد المتاجر غير موجود');
      }
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بمزامنة المنتجات بين هذه المتاجر');
      }
      
      // التحقق من وجود المنتج
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      if (product.store_id !== parseInt(sourceStoreId)) {
        throw new ValidationError('المنتج لا ينتمي إلى المتجر المصدر');
      }
      
      // الحصول على المتغيرات
      const variants = await Variant.findByProductId(productId);
      
      // إضافة المتغيرات للمنتج
      product.variants = variants;
      
      // مزامنة المنتج - هذا يتطلب خدمة مزامنة تفصيلية
      // يتم استدعاء واجهة برمجة تطبيقات شوبيفاي أو غيرها من المتاجر
      
      // هنا نقوم بإنشاء سجل مزامنة فقط
      const log = await SyncLog.create({
        syncRuleId: null, // مزامنة يدوية
        sourceStoreId: parseInt(sourceStoreId),
        targetStoreId: parseInt(targetStoreId),
        type: 'product',
        status: 'pending', // يتم تحديثه لاحقاً بواسطة خدمة المزامنة
        action: 'sync',
        entityType: 'product',
        entityId: product.id,
        externalSourceId: product.external_id,
        externalTargetId: null, // يتم تحديده بعد المزامنة
        details: {
          productTitle: product.title,
          variantsCount: variants.length
        },
        error: null
      });
      
      res.status(202).json(formatApiResponse({ 
        log,
        message: 'تم بدء مزامنة المنتج'
      }, 'success', 'تم بدء عملية مزامنة المنتج'));
    } catch (error) {
      logger.error('خطأ في مزامنة المنتج:', error);
      next(error);
    }
  },
  
  /**
   * مزامنة المخزون بين متجرين
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async syncInventory(req, res, next) {
    try {
      const { sourceStoreId, targetStoreId, productId } = req.params;
      const { variantId } = req.query;
      
      // التحقق من وجود المتاجر وملكيتها
      const sourceStore = await Store.findById(sourceStoreId);
      const targetStore = await Store.findById(targetStoreId);
      
      if (!sourceStore || !targetStore) {
        throw new NotFoundError('أحد المتاجر غير موجود');
      }
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بمزامنة المخزون بين هذه المتاجر');
      }
      
      // التحقق من وجود المنتج
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      if (product.store_id !== parseInt(sourceStoreId)) {
        throw new ValidationError('المنتج لا ينتمي إلى المتجر المصدر');
      }
      
      // البحث عن المخزون المناسب
      let inventoryItems;
      
      if (variantId) {
        // البحث عن مخزون متغير محدد
        const variant = await Variant.findById(variantId);
        
        if (!variant) {
          throw new NotFoundError('متغير المنتج غير موجود');
        }
        
        if (variant.product_id !== parseInt(productId)) {
          throw new ValidationError('متغير المنتج لا ينتمي إلى المنتج المحدد');
        }
        
        inventoryItems = await Inventory.findByVariantId(variantId, parseInt(sourceStoreId));
      } else {
        // البحث عن مخزون جميع متغيرات المنتج
        inventoryItems = await Inventory.findByProductId(productId, parseInt(sourceStoreId));
      }
      
      if (!inventoryItems || inventoryItems.length === 0) {
        throw new NotFoundError('لا يوجد مخزون للمزامنة');
      }
      
      // مزامنة المخزون - هذا يتطلب خدمة مزامنة تفصيلية
      // يتم استدعاء واجهة برمجة تطبيقات شوبيفاي أو غيرها من المتاجر
      
      // هنا نقوم بإنشاء سجل مزامنة فقط
      const log = await SyncLog.create({
        syncRuleId: null, // مزامنة يدوية
        sourceStoreId: parseInt(sourceStoreId),
        targetStoreId: parseInt(targetStoreId),
        type: 'inventory',
        status: 'pending', // يتم تحديثه لاحقاً بواسطة خدمة المزامنة
        action: 'sync',
        entityType: 'product',
        entityId: product.id,
        externalSourceId: product.external_id,
        externalTargetId: null, // يتم تحديده بعد المزامنة
        details: {
          productTitle: product.title,
          inventoryItemsCount: inventoryItems.length,
          variantId: variantId || null
        },
        error: null
      });
      
      res.status(202).json(formatApiResponse({ 
        log,
        message: 'تم بدء مزامنة المخزون'
      }, 'success', 'تم بدء عملية مزامنة المخزون'));
    } catch (error) {
      logger.error('خطأ في مزامنة المخزون:', error);
      next(error);
    }
  },
  
  /**
   * تشغيل قاعدة مزامنة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async runSyncRule(req, res, next) {
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
        throw new ForbiddenError('غير مصرح لك بتشغيل هذه القاعدة');
      }
      
      // تشغيل قاعدة المزامنة - هذا يتطلب خدمة مزامنة تفصيلية
      // يمكن استدعاء خدمة المزامنة من هنا
      
      // هنا نقوم بإنشاء سجل مزامنة فقط
      const log = await SyncLog.create({
        syncRuleId: parseInt(id),
        sourceStoreId: syncRule.source_store_id,
        targetStoreId: syncRule.target_store_id,
        type: syncRule.type,
        status: 'pending', // يتم تحديثه لاحقاً بواسطة خدمة المزامنة
        action: 'run',
        entityType: 'sync_rule',
        entityId: syncRule.id,
        externalSourceId: null,
        externalTargetId: null,
        details: {
          ruleName: syncRule.name,
          ruleType: syncRule.type
        },
        error: null
      });
      
      res.status(202).json(formatApiResponse({ 
        log,
        message: 'تم بدء تشغيل قاعدة المزامنة'
      }, 'success', 'تم بدء عملية تشغيل قاعدة المزامنة'));
    } catch (error) {
      logger.error('خطأ في تشغيل قاعدة المزامنة:', error);
      next(error);
    }
  },
  
  /**
   * مزامنة جميع المنتجات بين متجرين
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async syncAllProducts(req, res, next) {
    try {
      const { sourceStoreId, targetStoreId } = req.params;
      
      // التحقق من وجود المتاجر وملكيتها
      const sourceStore = await Store.findById(sourceStoreId);
      const targetStore = await Store.findById(targetStoreId);
      
      if (!sourceStore || !targetStore) {
        throw new NotFoundError('أحد المتاجر غير موجود');
      }
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بمزامنة المنتجات بين هذه المتاجر');
      }
      
      // هنا نقوم بإنشاء سجل مزامنة فقط
      const log = await SyncLog.create({
        syncRuleId: null, // مزامنة يدوية
        sourceStoreId: parseInt(sourceStoreId),
        targetStoreId: parseInt(targetStoreId),
        type: 'product',
        status: 'pending', // يتم تحديثه لاحقاً بواسطة خدمة المزامنة
        action: 'sync_all',
        entityType: 'store',
        entityId: sourceStoreId,
        externalSourceId: null,
        externalTargetId: null,
        details: {
          sourceStoreName: sourceStore.name,
          targetStoreName: targetStore.name
        },
        error: null
      });
      
      res.status(202).json(formatApiResponse({ 
        log,
        message: 'تم بدء مزامنة جميع المنتجات'
      }, 'success', 'تم بدء عملية مزامنة جميع المنتجات'));
    } catch (error) {
      logger.error('خطأ في مزامنة جميع المنتجات:', error);
      next(error);
    }
  },
  
  /**
   * مزامنة جميع المخزون بين متجرين
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async syncAllInventory(req, res, next) {
    try {
      const { sourceStoreId, targetStoreId } = req.params;
      
      // التحقق من وجود المتاجر وملكيتها
      const sourceStore = await Store.findById(sourceStoreId);
      const targetStore = await Store.findById(targetStoreId);
      
      if (!sourceStore || !targetStore) {
        throw new NotFoundError('أحد المتاجر غير موجود');
      }
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بمزامنة المخزون بين هذه المتاجر');
      }
      
      // هنا نقوم بإنشاء سجل مزامنة فقط
      const log = await SyncLog.create({
        syncRuleId: null, // مزامنة يدوية
        sourceStoreId: parseInt(sourceStoreId),
        targetStoreId: parseInt(targetStoreId),
        type: 'inventory',
        status: 'pending', // يتم تحديثه لاحقاً بواسطة خدمة المزامنة
        action: 'sync_all',
        entityType: 'store',
        entityId: sourceStoreId,
        externalSourceId: null,
        externalTargetId: null,
        details: {
          sourceStoreName: sourceStore.name,
          targetStoreName: targetStore.name
        },
        error: null
      });
      
      res.status(202).json(formatApiResponse({ 
        log,
        message: 'تم بدء مزامنة جميع المخزون'
      }, 'success', 'تم بدء عملية مزامنة جميع المخزون'));
    } catch (error) {
      logger.error('خطأ في مزامنة جميع المخزون:', error);
      next(error);
    }
  }
};

module.exports = syncController;