// marketplace/woocommerceService.js
const axios = require('axios');
const crypto = require('crypto');
const { MarketplaceApiError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const woocommerceConfig = require('../../config/marketplace/woocommerce');

// إنشاء مثيل axios مع الإعدادات الأساسية
const createClient = (store) => {
  return axios.create({
    baseURL: store.url,
    auth: {
      username: store.consumer_key,
      password: store.consumer_secret
    }
  });
};

// الحصول على المنتجات
exports.getProducts = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const { page = 1, limit = 50, ...params } = options;
    
    const response = await client.get(`${woocommerceConfig.endpoints.products}`, {
      params: {
        per_page: limit,
        page,
        ...params
      }
    });
    
    return response.data;
  } catch (error) {
    logger.error('فشل الحصول على منتجات WooCommerce:', error);
    throw new MarketplaceApiError(`فشل الحصول على منتجات WooCommerce: ${error.message}`);
  }
};

// الحصول على منتج واحد
exports.getProduct = async (store, productId) => {
  try {
    const client = createClient(store);
    const endpoint = woocommerceConfig.endpoints.product.replace('{id}', productId);
    
    const response = await client.get(endpoint);
    return response.data;
  } catch (error) {
    logger.error(`فشل الحصول على منتج WooCommerce (${productId}):`, error);
    throw new MarketplaceApiError(`فشل الحصول على منتج WooCommerce: ${error.message}`);
  }
};

// إنشاء منتج جديد
exports.createProduct = async (store, productData) => {
  try {
    const client = createClient(store);
    
    const response = await client.post(woocommerceConfig.endpoints.products, productData);
    
    return response.data;
  } catch (error) {
    logger.error('فشل إنشاء منتج WooCommerce:', error);
    throw new MarketplaceApiError(`فشل إنشاء منتج WooCommerce: ${error.message}`);
  }
};

// تحديث منتج
exports.updateProduct = async (store, productId, productData) => {
  try {
    const client = createClient(store);
    const endpoint = woocommerceConfig.endpoints.product.replace('{id}', productId);
    
    const response = await client.put(endpoint, productData);
    
    return response.data;
  } catch (error) {
    logger.error(`فشل تحديث منتج WooCommerce (${productId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث منتج WooCommerce: ${error.message}`);
  }
};

// تحديث متغيرات المنتج
exports.updateVariations = async (store, productId, variationId, variationData) => {
  try {
    const client = createClient(store);
    const endpoint = woocommerceConfig.endpoints.variations
      .replace('{id}', productId)
      .replace('{variation_id}', variationId);
    
    const response = await client.put(endpoint, variationData);
    
    return response.data;
  } catch (error) {
    logger.error(`فشل تحديث متغير منتج WooCommerce (${productId}/${variationId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث متغير منتج WooCommerce: ${error.message}`);
  }
};

// تحديث المخزون
exports.updateInventory = async (store, productId, variationId = null, quantity) => {
  try {
    const client = createClient(store);
    const endpoint = variationId 
      ? woocommerceConfig.endpoints.variations.replace('{id}', productId)
      : woocommerceConfig.endpoints.product.replace('{id}', productId);
    
    const updateData = {
      stock_quantity: quantity,
      manage_stock: true
    };
    
    const response = await client.put(endpoint, updateData);
    
    return response.data;
  } catch (error) {
    logger.error(`فشل تحديث مخزون WooCommerce (${productId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث مخزون WooCommerce: ${error.message}`);
  }
};

// الحصول على الطلبات
exports.getOrders = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const { page = 1, limit = 50, status = 'any', ...params } = options;
    
    const response = await client.get(woocommerceConfig.endpoints.orders, {
      params: {
        per_page: limit,
        page,
        status,
        ...params
      }
    });
    
    return response.data;
  } catch (error) {
    logger.error('فشل الحصول على طلبات WooCommerce:', error);
    throw new MarketplaceApiError(`فشل الحصول على طلبات WooCommerce: ${error.message}`);
  }
};

// إنشاء ويب هوك
exports.setupWebhooks = async (store, topics, address) => {
  try {
    const client = createClient(store);
    const webhooks = [];
    
    for (const topic of topics) {
      const response = await client.post('/wp-json/wc/v3/webhooks', {
        name: `Multi-Store Sync - ${topic}`,
        topic,
        delivery_url: address,
        secret: crypto.randomBytes(16).toString('hex')
      });
      
      webhooks.push(response.data);
    }
    
    return webhooks;
  } catch (error) {
    logger.error('فشل إعداد الويب هوك لـ WooCommerce:', error);
    throw new MarketplaceApiError(`فشل إعداد الويب هوك لـ WooCommerce: ${error.message}`);
  }
};