const { logger } = require('../../utils/logger');
const Webhook = require('../../models/webhook');
const shopifyService = require('../marketplace/shopifyService');
const woocommerceService = require('../marketplace/woocommerceService');
const lazadaService = require('../marketplace/lazadaService');
const shopeeService = require('../marketplace/shopeeService');
const syncService = require('./syncService');
const Store = require('../../models/store');

/**
 * إنشاء روابط الويب هوك لمتجر
 */
exports.setupWebhooks = async (storeId, topics, callbackUrl) => {
  const store = await Store.findByIdWithCredentials(storeId);
  if (!store) {
    throw new Error('المتجر غير موجود');
  }
  
  logger.info(`إعداد الويب هوك للمتجر ${store.name}`);
  
  // اختيار خدمة المتجر المناسبة
  const marketplaceService = getMarketplaceService(store.type);
  
  // الحصول على جميع الويب هوك الحالية للمتجر
  const existingWebhooks = await Webhook.findByStoreId(storeId);
  
  const results = {
    created: [],
    failed: []
  };
  
  // إنشاء الويب هوك لكل موضوع
  for (const topic of topics) {
    try {
      // فحص ما إذا كان الويب هوك موجوداً بالفعل
      const existingWebhook = existingWebhooks.find(webhook => webhook.topic === topic);
      
      if (existingWebhook) {
        logger.info(`الويب هوك للموضوع ${topic} موجود بالفعل`);
        results.created.push(existingWebhook);
        continue;
      }
      
      // إنشاء الويب هوك في المتجر
      const webhookResult = await marketplaceService.setupWebhooks(store, [topic], callbackUrl);
      
      // حفظ معلومات الويب هوك
      for (const webhook of webhookResult) {
        const savedWebhook = await Webhook.create({
          storeId,
          externalId: webhook.id,
          topic: webhook.topic,
          address: webhook.address,
          format: webhook.format,
          apiVersion: webhook.api_version
        });
        
        results.created.push(savedWebhook);
      }
    } catch (error) {
      logger.error(`فشل إنشاء الويب هوك للموضوع ${topic}:`, error);
      results.failed.push({
        topic,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * معالجة طلب الويب هوك
 */
exports.handleWebhook = async (storeType, topic, data, headers) => {
  logger.info(`معالجة الويب هوك: ${storeType}, ${topic}`);
  
  // معالجة طلب الويب هوك حسب نوع المتجر والموضوع
  switch (storeType) {
    case 'shopify':
      return await handleShopifyWebhook(topic, data, headers);
    case 'woocommerce':
      return await handleWooCommerceWebhook(topic, data, headers);
    case 'lazada':
      return await handleLazadaWebhook(topic, data, headers);
    case 'shopee':
      return await handleShopeeWebhook(topic, data, headers);
    default:
      throw new Error(`نوع المتجر غير مدعوم: ${storeType}`);
  }
};

/**
 * معالجة ويب هوك Shopify
 */
async function handleShopifyWebhook(topic, data, headers) {
  // الحصول على معرف المتجر من الرأس
  const shopDomain = headers['x-shopify-shop-domain'];
  
  // البحث عن المتجر
  const { pool } = require('../../config/database');
  const storeResult = await pool.query(
    'SELECT id FROM stores WHERE url LIKE $1',
    [`%${shopDomain}%`]
  );
  
  if (storeResult.rows.length === 0) {
    throw new Error(`لم يتم العثور على متجر بالنطاق: ${shopDomain}`);
  }
  
  const storeId = storeResult.rows[0].id;
  
  // معالجة الويب هوك حسب الموضوع
  switch (topic) {
    case 'products/create':
    case 'products/update':
      return await handleProductUpdate(storeId, data);
    case 'products/delete':
      return await handleProductDelete(storeId, data);
    case 'inventory_levels/update':
      return await handleInventoryUpdate(storeId, data);
    case 'orders/create':
    case 'orders/updated':
      return await handleOrderUpdate(storeId, data);
    default:
      logger.warn(`موضوع الويب هوك غير مدعوم: ${topic}`);
      return { status: 'ignored', message: 'موضوع غير مدعوم' };
  }
}

/**
 * معالجة ويب هوك WooCommerce
 */
async function handleWooCommerceWebhook(topic, data, headers) {
  // تنفيذ معالجة ويب هوك WooCommerce
  return { status: 'success' };
}

/**
 * معالجة ويب هوك Lazada
 */
async function handleLazadaWebhook(topic, data, headers) {
  // تنفيذ معالجة ويب هوك Lazada
  return { status: 'success' };
}

/**
 * معالجة ويب هوك Shopee
 */
async function handleShopeeWebhook(topic, data, headers) {
  // تنفيذ معالجة ويب هوك Shopee
  return { status: 'success' };
}

/**
 * معالجة تحديث المنتج
 */
async function handleProductUpdate(storeId, data) {
  logger.info(`معالجة تحديث المنتج: ${data.id}`);
  
  try {
    // الحصول على قواعد المزامنة للمتجر
    const { pool } = require('../../config/database');
    const rulesResult = await pool.query(
      `SELECT r.* FROM sync_rules r
       WHERE r.source_store_id = $1 AND r.type = 'product' AND r.is_active = true`,
      [storeId]
    );
    
    if (rulesResult.rows.length === 0) {
      logger.info(`لا توجد قواعد مزامنة نشطة للمتجر: ${storeId}`);
      return { status: 'ignored', message: 'لا توجد قواعد مزامنة نشطة' };
    }
    
    // تحديث المنتج في قاعدة البيانات المحلية
    const store = await Store.findById(storeId);
    const productService = require('../product/productService');
    
    // الحصول على المنتج من الخدمة المناسبة
    const marketplaceService = getMarketplaceService(store.type);
    const productDetails = await marketplaceService.getProduct(store, data.id);
    
    // البحث عن المنتج المحلي
    const existingProduct = await productService.getProductByExternalId(data.id, storeId);
    
    // تحويل المنتج إلى النموذج الداخلي
    const internalProduct = marketplaceService.transformToInternalProduct(productDetails);
    
    if (existingProduct) {
      // تحديث المنتج الموجود
      await productService.updateProduct(existingProduct.id, internalProduct);
    } else {
      // إنشاء منتج جديد
      await productService.createProduct({
        ...internalProduct,
        storeId
      });
    }
    
    // مزامنة المنتج إلى المتاجر المرتبطة
    for (const rule of rulesResult.rows) {
      const targetStore = await Store.findById(rule.target_store_id);
      
      // مزامنة المنتج
      await syncService.syncProducts(store, targetStore, rule);
    }
    
    return { status: 'success', message: 'تمت مزامنة المنتج بنجاح' };
  } catch (error) {
    logger.error(`فشل معالجة تحديث المنتج: ${data.id}`, error);
    return { status: 'error', message: error.message };
  }
}

/**
 * معالجة حذف المنتج
 */
async function handleProductDelete(storeId, data) {
  // تنفيذ معالجة حذف المنتج
  return { status: 'success' };
}

/**
 * معالجة تحديث المخزون
 */
async function handleInventoryUpdate(storeId, data) {
  // تنفيذ معالجة تحديث المخزون
  return { status: 'success' };
}

/**
 * معالجة تحديث الطلب
 */
async function handleOrderUpdate(storeId, data) {
  // تنفيذ معالجة تحديث الطلب
  return { status: 'success' };
}

/**
 * الحصول على خدمة المتجر المناسبة
 */
function getMarketplaceService(storeType) {
  switch (storeType) {
    case 'shopify':
      return shopifyService;
    case 'woocommerce':
      return woocommerceService;
    case 'lazada':
      return lazadaService;
    case 'shopee':
      return shopeeService;
    default:
      throw new Error(`نوع المتجر غير مدعوم: ${storeType}`);
  }
}