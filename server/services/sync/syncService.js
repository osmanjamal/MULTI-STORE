// sync/syncService.js
const { pool } = require('../../config/database');
const { logger } = require('../../utils/logger');
const SyncLog = require('../../models/syncLog');
const Product = require('../../models/product');
const Inventory = require('../../models/inventory');
const Order = require('../../models/order');
const { SyncError } = require('../../utils/errors');

// خدمات المتاجر
const shopifyService = require('../marketplace/shopifyService');
const woocommerceService = require('../marketplace/woocommerceService');
const lazadaService = require('../marketplace/lazadaService');
const shopeeService = require('../marketplace/shopeeService');

// خدمة المطابقة
const matchingService = require('./matchingService');

/**
 * مزامنة المنتجات بين متجرين
 */
exports.syncProducts = async (sourceStore, targetStore, rule) => {
  logger.info(`بدء مزامنة المنتجات من ${sourceStore.name} إلى ${targetStore.name}`);
  
  // إحصائيات المزامنة
  const stats = {
    totalProducts: 0,
    createdProducts: 0,
    updatedProducts: 0,
    skippedProducts: 0,
    failedProducts: 0
  };
  
  try {
    // اختيار خدمة المتجر المصدر
    const sourceService = getMarketplaceService(sourceStore.type);
    const targetService = getMarketplaceService(targetStore.type);
    
    // الحصول على المنتجات من المتجر المصدر
    const sourceProducts = await sourceService.getProducts(sourceStore);
    stats.totalProducts = sourceProducts.length;
    
    // تحويل المنتجات
    for (const sourceProduct of sourceProducts) {
      try {
        // فحص شروط المزامنة
        if (rule.conditions && !matchingService.checkProductConditions(sourceProduct, rule.conditions)) {
          stats.skippedProducts++;
          continue;
        }
        
        // تحويل المنتج إلى النموذج الداخلي
        const internalProduct = sourceService.transformToInternalProduct(sourceProduct);
        
        // البحث عن المنتج في المتجر الهدف
        const existingProduct = await Product.findByExternalId(sourceProduct.id, sourceStore.id);
        
        // تطبيق التحويلات المخصصة إذا وجدت
        const transformedProduct = rule.transformations && Object.keys(rule.transformations).length > 0
          ? matchingService.applyProductTransformations(internalProduct, rule.transformations)
          : internalProduct;
        
        // تحويل المنتج إلى تنسيق المتجر الهدف
        const targetProduct = targetService.transformFromInternalProduct(transformedProduct);
        
        if (existingProduct) {
          // تحديث المنتج في المتجر الهدف
          await targetService.updateProduct(targetStore, existingProduct.external_id, targetProduct);
          stats.updatedProducts++;
        } else {
          // إنشاء المنتج في المتجر الهدف
          const newProduct = await targetService.createProduct(targetStore, targetProduct);
          
          // حفظ ربط المنتج
          await pool.query(
            `INSERT INTO product_mappings (source_store_id, target_store_id, source_product_id, target_product_id, sync_rule_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [sourceStore.id, targetStore.id, sourceProduct.id, newProduct.id, rule.id]
          );
          
          stats.createdProducts++;
        }
      } catch (error) {
        logger.error(`فشل مزامنة المنتج: ${sourceProduct.id}`, error);
        stats.failedProducts++;
      }
    }
    
    return stats;
  } catch (error) {
    logger.error(`فشل مزامنة المنتجات من ${sourceStore.name} إلى ${targetStore.name}:`, error);
    throw new SyncError(`فشل مزامنة المنتجات: ${error.message}`);
  }
};

/**
 * مزامنة المخزون بين متجرين
 */
exports.syncInventory = async (sourceStore, targetStore, rule) => {
  logger.info(`بدء مزامنة المخزون من ${sourceStore.name} إلى ${targetStore.name}`);
  
  // إحصائيات المزامنة
  const stats = {
    totalItems: 0,
    syncedItems: 0,
    skippedItems: 0,
    failedItems: 0
  };
  
  try {
    // اختيار خدمة المتجر المصدر
    const sourceService = getMarketplaceService(sourceStore.type);
    const targetService = getMarketplaceService(targetStore.type);
    
    // الحصول على المخزون من المتجر المصدر
    const sourceInventory = await sourceService.getInventory(sourceStore);
    stats.totalItems = sourceInventory.length;
    
    // مزامنة المخزون
    for (const sourceItem of sourceInventory) {
      try {
        // فحص شروط المزامنة
        if (rule.conditions && !matchingService.checkInventoryConditions(sourceItem, rule.conditions)) {
          stats.skippedItems++;
          continue;
        }
        
        // البحث عن ربط المنتج
        const mappingResult = await pool.query(
          `SELECT * FROM product_mappings WHERE source_store_id = $1 AND target_store_id = $2 AND source_product_id = $3`,
          [sourceStore.id, targetStore.id, sourceItem.product_id]
        );
        
        if (mappingResult.rows.length === 0) {
          stats.skippedItems++;
          continue;
        }
        
        const mapping = mappingResult.rows[0];
        
        // تحديث المخزون في المتجر الهدف
        await targetService.updateInventory(
          targetStore,
          mapping.target_product_id,
          sourceItem.variant_id ? mapping.target_variant_id : null,
          sourceItem.quantity
        );
        
        stats.syncedItems++;
      } catch (error) {
        logger.error(`فشل مزامنة المخزون: ${sourceItem.id}`, error);
        stats.failedItems++;
      }
    }
    
    return stats;
  } catch (error) {
    logger.error(`فشل مزامنة المخزون من ${sourceStore.name} إلى ${targetStore.name}:`, error);
    throw new SyncError(`فشل مزامنة المخزون: ${error.message}`);
  }
};

/**
 * مزامنة الطلبات بين متجرين
 */
exports.syncOrders = async (sourceStore, targetStore, rule) => {
  logger.info(`بدء مزامنة الطلبات من ${sourceStore.name} إلى ${targetStore.name}`);
  
  // إحصائيات المزامنة
  const stats = {
    totalOrders: 0,
    createdOrders: 0,
    updatedOrders: 0,
    skippedOrders: 0,
    failedOrders: 0
  };
  
  try {
    // اختيار خدمة المتجر المصدر
    const sourceService = getMarketplaceService(sourceStore.type);
    const targetService = getMarketplaceService(targetStore.type);
    
    // الحصول على الطلبات من المتجر المصدر
    const sourceOrders = await sourceService.getOrders(sourceStore, { status: 'any', limit: 50 });
    stats.totalOrders = sourceOrders.length;
    
    // مزامنة الطلبات
    for (const sourceOrder of sourceOrders) {
      try {
        // فحص شروط المزامنة
        if (rule.conditions && !matchingService.checkOrderConditions(sourceOrder, rule.conditions)) {
          stats.skippedOrders++;
          continue;
        }
        
        // تحويل الطلب إلى النموذج الداخلي
        const internalOrder = sourceService.transformToInternalOrder(sourceOrder);
        
        // البحث عن الطلب في المتجر الهدف
        const existingOrder = await Order.findByExternalId(sourceOrder.id, sourceStore.id);
        
        // تطبيق التحويلات المخصصة إذا وجدت
        const transformedOrder = rule.transformations && Object.keys(rule.transformations).length > 0
          ? matchingService.applyOrderTransformations(internalOrder, rule.transformations)
          : internalOrder;
        
        // تحويل الطلب إلى تنسيق المتجر الهدف
        const targetOrder = targetService.transformFromInternalOrder(transformedOrder);
        
        if (existingOrder) {
          // تحديث الطلب في المتجر الهدف
          await targetService.updateOrder(targetStore, existingOrder.external_id, targetOrder);
          stats.updatedOrders++;
        } else {
          // إنشاء الطلب في المتجر الهدف
          const newOrder = await targetService.createOrder(targetStore, targetOrder);
          
          // حفظ ربط الطلب
          await pool.query(
            `INSERT INTO order_mappings (source_store_id, target_store_id, source_order_id, target_order_id, sync_rule_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [sourceStore.id, targetStore.id, sourceOrder.id, newOrder.id, rule.id]
          );
          
          stats.createdOrders++;
        }
      } catch (error) {
        logger.error(`فشل مزامنة الطلب: ${sourceOrder.id}`, error);
        stats.failedOrders++;
      }
    }
    
    return stats;
  } catch (error) {
    logger.error(`فشل مزامنة الطلبات من ${sourceStore.name} إلى ${targetStore.name}:`, error);
    throw new SyncError(`فشل مزامنة الطلبات: ${error.message}`);
  }
};

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