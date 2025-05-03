const { logger } = require('../../utils/logger');
const Product = require('../../models/product');
const Variant = require('../../models/variant');
const shopifyService = require('../marketplace/shopifyService');
const woocommerceService = require('../marketplace/woocommerceService');
const lazadaService = require('../marketplace/lazadaService');
const shopeeService = require('../marketplace/shopeeService');

/**
 * استيراد منتجات من متجر خارجي
 */
exports.importProducts = async (sourceStore, targetStoreId, options = {}) => {
  logger.info(`استيراد المنتجات من المتجر ${sourceStore.name} إلى المتجر ${targetStoreId}`);
  
  try {
    // اختيار خدمة المتجر المصدر
    const sourceService = getMarketplaceService(sourceStore.type);
    
    // جلب المنتجات من المتجر المصدر
    const { products, hasMore, nextPage } = await sourceService.getProducts(
      sourceStore, 
      { limit: options.limit || 50, page: options.page || 1 }
    );
    
    logger.info(`تم العثور على ${products.length} منتج في المتجر ${sourceStore.name}`);
    
    const result = {
      totalProducts: products.length,
      importedProducts: 0,
      failedProducts: 0,
      hasMore,
      nextPage,
      importedIds: [],
      failedIds: []
    };
    
    // معالجة المنتجات
    for (const sourceProduct of products) {
      try {
        // تحويل المنتج إلى النموذج الداخلي
        const internalProduct = transformToInternalProduct(sourceProduct, sourceStore.type);
        
        // إضافة المتجر المستهدف
        internalProduct.storeId = targetStoreId;
        
        // فحص ما إذا كان المنتج موجوداً بالفعل
        const existingProduct = await Product.findByExternalId(sourceProduct.id, targetStoreId);
        
        if (existingProduct && !options.forceUpdate) {
          logger.info(`تخطي المنتج ${sourceProduct.id} لأنه موجود بالفعل`);
          continue;
        }
        
        if (existingProduct) {
          // تحديث المنتج الموجود
          await Product.update(existingProduct.id, internalProduct);
          
          // تحديث المتغيرات
          if (internalProduct.variants && internalProduct.variants.length > 0) {
            for (const variant of internalProduct.variants) {
              const existingVariant = await Variant.findByExternalId(variant.externalId, existingProduct.id);
              
              if (existingVariant) {
                await Variant.update(existingVariant.id, { ...variant, productId: existingProduct.id });
              } else {
                await Variant.create({ ...variant, productId: existingProduct.id });
              }
            }
          }
          
          result.importedProducts++;
          result.importedIds.push(existingProduct.id);
        } else {
          // إنشاء منتج جديد
          const newProduct = await Product.create(internalProduct);
          
          // إنشاء المتغيرات
          if (internalProduct.variants && internalProduct.variants.length > 0) {
            for (const variant of internalProduct.variants) {
              await Variant.create({ ...variant, productId: newProduct.id });
            }
          }
          
          result.importedProducts++;
          result.importedIds.push(newProduct.id);
          
          // حفظ ربط المنتج
          await saveProductMapping(sourceProduct.id, sourceStore.id, newProduct.id, targetStoreId);
        }
      } catch (error) {
        logger.error(`فشل استيراد المنتج ${sourceProduct.id}:`, error);
        result.failedProducts++;
        result.failedIds.push(sourceProduct.id);
      }
    }
    
    logger.info(`تم استيراد ${result.importedProducts} منتج بنجاح من ${sourceStore.name}`);
    
    return result;
  } catch (error) {
    logger.error(`فشل استيراد المنتجات من المتجر ${sourceStore.name}:`, error);
    throw error;
  }
};

/**
 * تحويل المنتج من المتجر المصدر إلى النموذج الداخلي
 */
function transformToInternalProduct(sourceProduct, sourceType) {
  switch (sourceType) {
    case 'shopify':
      return transformFromShopify(sourceProduct);
    case 'woocommerce':
      return transformFromWooCommerce(sourceProduct);
    case 'lazada':
      return transformFromLazada(sourceProduct);
    case 'shopee':
      return transformFromShopee(sourceProduct);
    default:
      throw new Error(`نوع المتجر غير مدعوم: ${sourceType}`);
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
function transformFromShopify(product) {
  return {
    externalId: product.id,
    title: product.title,
    description: product.body_html,
    sku: product.variants[0]?.sku || '',
    barcode: product.variants[0]?.barcode || '',
    vendor: product.vendor,
    productType: product.product_type,
    tags: product.tags,
    status: product.status === 'active' ? 'active' : 'draft',
    options: product.options || [],
    images: product.images || [],
    variants: product.variants.map(v => ({
      externalId: v.id,
      title: v.title,
      sku: v.sku,
      barcode: v.barcode,
      price: parseFloat(v.price) || 0,
      compareAtPrice: parseFloat(v.compare_at_price) || 0,
      weight: parseFloat(v.weight) || 0,
      weightUnit: v.weight_unit || 'kg',
      inventoryItemId: v.inventory_item_id,
      inventoryManagement: v.inventory_management === 'shopify' ? 'tracked' : 'not_tracked',
      options: {
        option1: v.option1,
        option2: v.option2,
        option3: v.option3
      }
    }))
  };
}

function transformFromWooCommerce(product) {
  return {
    externalId: product.id,
    title: product.name,
    description: product.description,
    sku: product.sku,
    barcode: '',
    vendor: '',
    productType: product.categories[0]?.name || '',
    tags: product.tags?.map(t => t.name).join(', ') || '',
    status: product.status === 'publish' ? 'active' : 'draft',
    options: product.attributes?.map(a => ({
      name: a.name,
      values: a.options
    })) || [],
    images: product.images?.map(img => ({
      src: img.src,
      position: img.position || 1
    })) || [],
    variants: product.variations?.length > 0 ? 
      product.variations.map(v => ({
        externalId: v.id,
        title: v.attributes?.map(a => a.option).join(' / ') || '',
        sku: v.sku,
        barcode: '',
        price: parseFloat(v.price) || 0,
        compareAtPrice: parseFloat(v.regular_price) || 0,
        weight: parseFloat(v.weight) || 0,
        weightUnit: 'kg',
        inventoryManagement: v.manage_stock ? 'tracked' : 'not_tracked',
        options: product.attributes?.reduce((acc, a, i) => {
          acc[`option${i+1}`] = v.attributes.find(va => va.name === a.name)?.option || '';
          return acc;
        }, {})
      })) : 
      [{
        externalId: product.id,
        title: 'Default',
        sku: product.sku,
        barcode: '',
        price: parseFloat(product.price) || 0,
        compareAtPrice: parseFloat(product.regular_price) || 0,
        weight: parseFloat(product.weight) || 0,
        weightUnit: 'kg',
        inventoryManagement: product.manage_stock ? 'tracked' : 'not_tracked',
        options: {}
      }]
  };
}

function transformFromLazada(product) {
  // تنفيذ التحويل المناسب من Lazada
  return {};
}

function transformFromShopee(product) {
  // تنفيذ التحويل المناسب من Shopee
  return {};
}