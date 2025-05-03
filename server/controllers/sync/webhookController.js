const Webhook = require('../../models/webhook');
const Store = require('../../models/store');
const Product = require('../../models/product');
const Inventory = require('../../models/inventory');
const Order = require('../../models/order');
const SyncLog = require('../../models/syncLog');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في الويب هوك
 */
const webhookController = {
  /**
   * الحصول على جميع الويب هوك لمتجر
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getWebhooks(req, res, next) {
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
      
      // الحصول على الويب هوك
      const webhooks = await Webhook.findByStoreId(parseInt(storeId));
      
      res.status(200).json(formatApiResponse({ webhooks }));
    } catch (error) {
      logger.error('خطأ في الحصول على الويب هوك:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على ويب هوك بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getWebhookById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على الويب هوك
      const webhook = await Webhook.findById(id);
      
      if (!webhook) {
        throw new NotFoundError('الويب هوك غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(webhook.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا الويب هوك');
      }
      
      res.status(200).json(formatApiResponse({ webhook }));
    } catch (error) {
      logger.error('خطأ في الحصول على الويب هوك:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء ويب هوك جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createWebhook(req, res, next) {
    try {
      const { storeId } = req.params;
      const {
        externalId,
        topic,
        address,
        format = 'json',
        apiVersion,
        fields,
        metafields,
        metadata
      } = req.body;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // التحقق من توفير الموضوع والعنوان
      if (!topic || !address) {
        throw new ValidationError('يرجى توفير موضوع وعنوان الويب هوك');
      }
      
      // إنشاء الويب هوك
      const webhook = await Webhook.create({
        storeId: parseInt(storeId),
        externalId,
        topic,
        address,
        format,
        apiVersion,
        fields,
        metafields,
        metadata
      });
      
      res.status(201).json(formatApiResponse({ 
        webhook 
      }, 'success', 'تم إنشاء الويب هوك بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء الويب هوك:', error);
      next(error);
    }
  },
  
  /**
   * تحديث ويب هوك
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateWebhook(req, res, next) {
    try {
      const { id } = req.params;
      const {
        address,
        format,
        apiVersion,
        fields,
        metafields,
        metadata
      } = req.body;
      
      // الحصول على الويب هوك
      const webhook = await Webhook.findById(id);
      
      if (!webhook) {
        throw new NotFoundError('الويب هوك غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(webhook.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا الويب هوك');
      }
      
      // تحديث الويب هوك
      const updatedWebhook = await Webhook.update(id, {
        address,
        format,
        apiVersion,
        fields,
        metafields,
        metadata
      });
      
      res.status(200).json(formatApiResponse({ 
        webhook: updatedWebhook 
      }, 'success', 'تم تحديث الويب هوك بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث الويب هوك:', error);
      next(error);
    }
  },
  
  /**
   * حذف ويب هوك
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteWebhook(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على الويب هوك
      const webhook = await Webhook.findById(id);
      
      if (!webhook) {
        throw new NotFoundError('الويب هوك غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(webhook.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذا الويب هوك');
      }
      
      // حذف الويب هوك
      await Webhook.delete(id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف الويب هوك بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف الويب هوك:', error);
      next(error);
    }
  },
  
  /**
   * معالجة طلبات الويب هوك الواردة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async handleWebhook(req, res, next) {
    try {
      const { type, storeId } = req.params;
      const payload = req.body;
      
      // سجل الطلب الوارد
      logger.info(`تم استلام ويب هوك ${type} لمتجر ${storeId}`, {
        type,
        storeId,
        topic: payload.topic || payload.event_type || 'unknown'
      });
      
      // الاستجابة السريعة للطلب
      res.status(200).json({ status: 'success', message: 'تم استلام الويب هوك بنجاح' });
      
      // معالجة الطلب في الخلفية
      // هذا يعتمد على نوع المتجر والمعالجة المطلوبة
      
      // معالجة أنواع الويب هوك المختلفة
      switch (type) {
        case 'shopify':
          await handleShopifyWebhook(storeId, payload);
          break;
        case 'lazada':
          await handleLazadaWebhook(storeId, payload);
          break;
        case 'shopee':
          await handleShopeeWebhook(storeId, payload);
          break;
        case 'woocommerce':
          await handleWooCommerceWebhook(storeId, payload);
          break;
        default:
          logger.warn('نوع ويب هوك غير معروف', { type, storeId });
      }
    } catch (error) {
      // سجل الخطأ ولكن لا ترسل استجابة خطأ
      // لأننا قد نكون قد أرسلنا بالفعل استجابة ناجحة
      logger.error('خطأ في معالجة الويب هوك:', error);
    }
  }
};

/**
 * معالجة ويب هوك شوبيفاي
 * @param {number} storeId - معرف المتجر
 * @param {Object} payload - محتوى الطلب
 */
async function handleShopifyWebhook(storeId, payload) {
  try {
    const topic = payload.topic || '';
    const externalId = payload.id?.toString() || '';
    
    // معالجة موضوعات مختلفة
    if (topic.startsWith('products/')) {
      // معالجة ويب هوك المنتج
      if (topic === 'products/create' || topic === 'products/update') {
        // تحديث/إنشاء المنتج
        // يتطلب معالجة تفصيلية
      } else if (topic === 'products/delete') {
        // حذف المنتج
        // يتطلب معالجة تفصيلية
      }
    } else if (topic.startsWith('inventory_levels/')) {
      // معالجة ويب هوك المخزون
      if (topic === 'inventory_levels/update') {
        // تحديث المخزون
        // يتطلب معالجة تفصيلية
      }
    } else if (topic.startsWith('orders/')) {
      // معالجة ويب هوك الطلبات
      if (topic === 'orders/create' || topic === 'orders/updated') {
        // تحديث/إنشاء الطلب
        // يتطلب معالجة تفصيلية
      } else if (topic === 'orders/cancelled' || topic === 'orders/delete') {
        // إلغاء/حذف الطلب
        // يتطلب معالجة تفصيلية
      } else if (topic === 'orders/fulfilled' || topic === 'orders/partially_fulfilled') {
        // إتمام الطلب
        // يتطلب معالجة تفصيلية
      }
    }
    
    // تسجيل معالجة الويب هوك
    logger.info('تم معالجة ويب هوك شوبيفاي بنجاح', {
      topic,
      storeId,
      externalId
    });
  } catch (error) {
    logger.error('خطأ في معالجة ويب هوك شوبيفاي:', error);
    
    // إنشاء سجل مزامنة للخطأ
    await SyncLog.create({
      syncRuleId: null,
      sourceStoreId: parseInt(storeId),
      targetStoreId: null,
      type: 'webhook',
      status: 'error',
      action: 'process_webhook',
      entityType: 'store',
      entityId: storeId,
      externalSourceId: null,
      externalTargetId: null,
      details: {
        topic: payload.topic || '',
        webhook_id: payload.id || ''
      },
      error: error.message
    });
  }
}

/**
 * معالجة ويب هوك لازادا
 * @param {number} storeId - معرف المتجر
 * @param {Object} payload - محتوى الطلب
 */
async function handleLazadaWebhook(storeId, payload) {
  // تنفيذ معالجة ويب هوك لازادا
  // مماثل لمعالجة شوبيفاي ولكن مع اختلافات في الهيكل
}

/**
 * معالجة ويب هوك شوبي
 * @param {number} storeId - معرف المتجر
 * @param {Object} payload - محتوى الطلب
 */
async function handleShopeeWebhook(storeId, payload) {
  // تنفيذ معالجة ويب هوك شوبي
  // مماثل لمعالجة شوبيفاي ولكن مع اختلافات في الهيكل
}

/**
 * معالجة ويب هوك ووكومرس
 * @param {number} storeId - معرف المتجر
 * @param {Object} payload - محتوى الطلب
 */
async function handleWooCommerceWebhook(storeId, payload) {
  // تنفيذ معالجة ويب هوك ووكومرس
  // مماثل لمعالجة شوبيفاي ولكن مع اختلافات في الهيكل
}

module.exports = webhookController;