const { logger } = require('../../utils/logger');
const Product = require('../../models/product');
const Variant = require('../../models/variant');
const shopifyService = require('../marketplace/shopifyService');
const woocommerceService = require('../marketplace/woocommerceService');
const lazadaService = require('../marketplace/lazadaService');
const shopeeService = require('../marketplace/shopeeService');

/**
 * تصدير منتج إلى متجر آخر
 */
exports.exportProduct = async (product, targetStore, options = {}) => {
  logger.info(`تصدير المنتج ${product.id} إلى متجر ${targetStore.name}`);
  
  try {
    // اختيار خدمة المتجر الهدف
    const targetService = getMarketplaceService(targetStore.type);
    
    // تحويل المنتج إلى التنسيق المناسب
    const transformedProduct = transformProductForTarget(product, targetStore.type, options);
    
    // إرسال المنتج إلى المتجر الهدف
    const result = await targetService.createProduct(targetStore, transformedProduct);
    
    // إضافة معلومات الربط
    await saveProductMapping(product.id, product.store_id, result.id, targetStore.id);
    
    logger.info(`تم تصدير المنتج ${product.id} بنجاح إلى المتجر ${targetStore.name}`);
    
    return result;
  } catch (error) {
    logger.error(`فشل تصدير المنتج ${product.id} إلى المتجر ${targetStore.name}:`, error);
    throw error;
  }
};

/**
 * تصدير مجموعة منتجات إلى متجر آخر
 */
exports.exportProducts = async (productIds, sourceStoreId, targetStore, options = {}) => {
  logger.info(`تصدير ${productIds.length} منتج من المتجر ${sourceStoreId} إلى المتجر ${targetStore.name}`);
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (const productId of productIds) {
    try {
      // الحصول على المنتج بكامل بياناته
      const product = await Product.findById(productId);
      if (!product) {
        results.failed.push({ id: productId, error: 'المنتج غير موجود' });
        continue;
      }
      
      // الحصول على المتغيرات
      const variants = await Variant.findByProductId(productId);
      product.variants = variants;
      
      // تصدير المنتج
      const exportedProduct = await this.exportProduct(product, targetStore, options);
      
      results.successful.push({ 
        id: productId, 
        externalId: exportedProduct.id,
        title: product.title
      });
    } catch (error) {
      logger.error(`فشل تصدير المنتج ${productId}:`, error);
      results.failed.push({ 
        id: productId, 
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * تحويل المنتج للتنسيق المناسب للمتجر الهدف
 */
function transformProductForTarget(product, targetType, options = {}) {
  switch (targetType) {
    case 'shopify':
      return transformForShopify(product, options);
    case 'woocommerce':
      return transformForWooCommerce(product, options);
    case 'lazada':
      return transformForLazada(product, options);
    case 'shopee':
      return transformForShopee(product, options);
    default:
      throw new Error(`نوع المتجر غير مدعوم: ${targetType}`);
  }
}

/**
 * حفظ معلومات ربط المنتج
 */
async function saveProductMapping(sourceProductId, sourceStoreId, targetProductId, targetStoreId) {
  const { pool } = require('../../config/database');
  
  await pool.query(
    `INSERT INTO product_mappings (
      source_product_id, source_store_id, target_product_id, target_store_id
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (source_product_id, target_store_id) DO UPDATE
    SET target_product_id = $3`,
    [sourceProductId, sourceStoreId, targetProductId, targetStoreId]
  );
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

// وظائف التحويل المتخصصة لكل متجر
function transformForShopify(product, options) {
  // تنفيذ التحويل...
  return {
    title: product.title,
    body_html: product.description,
    vendor: product.vendor,
    product_type: product.product_type,
    tags: product.tags,
    variants: product.variants.map(v => ({
      title: v.title,
      sku: v.sku,
      price: v.price,
      compare_at_price: v.compare_at_price,
      option1: v.options && v.options[0] ? v.options[0].value : null,
      option2: v.options && v.options[1] ? v.options[1].value : null,
      option3: v.options && v.options[2] ? v.options[2].value : null,
      barcode: v.barcode,
      weight: v.weight,
      weight_unit: v.weight_unit,
      inventory_management: v.inventory_management
    })),
    options: product.options,
    images: product.images,
    status: product.status
  };
}

function transformForWooCommerce(product, options) {
  // تنفيذ التحويل...
  return {
    name: product.title,
    description: product.description,
    short_description: product.description ? product.description.substring(0, 300) : '',
    categories: [],
    images: product.images.map(img => ({ src: img.src })),
    sku: product.sku,
    regular_price: String(product.variants[0]?.price || '0'),
    sale_price: '',
    attributes: product.options.map(option => ({
      name: option.name,
      position: 0,
      visible: true,
      variation: true,
      options: option.values
    })),
    variations: []
  };
}

function transformForLazada(product, options) {
  // تنفيذ التحويل...
  return {
    // تنفيذ التحويل المناسب لـ Lazada
  };
}

function transformForShopee(product, options) {
  // تنفيذ التحويل...
  return {
    // تنفيذ التحويل المناسب لـ Shopee
  };
}