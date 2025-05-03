const axios = require('axios');
const { MarketplaceApiError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const shopifyConfig = require('../../config/marketplace/shopify');

// إنشاء مثيل axios مع الإعدادات الأساسية
const createClient = (store) => {
  return axios.create({
    baseURL: store.url,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': store.access_token
    }
  });
};

// الحصول على المنتجات
exports.getProducts = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const { page = 1, limit = 50, ...params } = options;
    
    const response = await client.get(`${shopifyConfig.endpoints.products}`, {
      params: {
        limit,
        page,
        ...params
      }
    });
    
    return response.data.products;
  } catch (error) {
    logger.error('فشل الحصول على منتجات Shopify:', error);
    throw new MarketplaceApiError(`فشل الحصول على منتجات Shopify: ${error.message}`);
  }
};

// الحصول على منتج واحد
exports.getProduct = async (store, productId) => {
  try {
    const client = createClient(store);
    const endpoint = shopifyConfig.endpoints.product.replace('{id}', productId);
    
    const response = await client.get(endpoint);
    return response.data.product;
  } catch (error) {
    logger.error(`فشل الحصول على منتج Shopify (${productId}):`, error);
    throw new MarketplaceApiError(`فشل الحصول على منتج Shopify: ${error.message}`);
  }
};

// إنشاء منتج جديد
exports.createProduct = async (store, productData) => {
  try {
    const client = createClient(store);
    
    const response = await client.post(shopifyConfig.endpoints.products, {
      product: productData
    });
    
    return response.data.product;
  } catch (error) {
    logger.error('فشل إنشاء منتج Shopify:', error);
    throw new MarketplaceApiError(`فشل إنشاء منتج Shopify: ${error.message}`);
  }
};

// تحديث منتج
exports.updateProduct = async (store, productId, productData) => {
  try {
    const client = createClient(store);
    const endpoint = shopifyConfig.endpoints.product.replace('{id}', productId);
    
    const response = await client.put(endpoint, {
      product: productData
    });
    
    return response.data.product;
  } catch (error) {
    logger.error(`فشل تحديث منتج Shopify (${productId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث منتج Shopify: ${error.message}`);
  }
};

// تحديث المخزون
exports.updateInventory = async (store, inventoryItemId, locationId, quantity) => {
  try {
    const client = createClient(store);
    
    const response = await client.post(shopifyConfig.endpoints.inventory_levels, {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available: quantity
    });
    
    return response.data.inventory_level;
  } catch (error) {
    logger.error(`فشل تحديث مخزون Shopify (${inventoryItemId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث مخزون Shopify: ${error.message}`);
  }
};

// الحصول على الطلبات
exports.getOrders = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const { page = 1, limit = 50, status = 'any', ...params } = options;
    
    const response = await client.get(shopifyConfig.endpoints.orders, {
      params: {
        limit,
        page,
        status,
        ...params
      }
    });
    
    return response.data.orders;
  } catch (error) {
    logger.error('فشل الحصول على طلبات Shopify:', error);
    throw new MarketplaceApiError(`فشل الحصول على طلبات Shopify: ${error.message}`);
  }
};

// إعداد الويب هوك
exports.setupWebhooks = async (store, topics, address) => {
  try {
    const client = createClient(store);
    const webhooks = [];
    
    for (const topic of topics) {
      const response = await client.post(shopifyConfig.endpoints.webhooks, {
        webhook: {
          topic,
          address,
          format: 'json'
        }
      });
      
      webhooks.push(response.data.webhook);
    }
    
    return webhooks;
  } catch (error) {
    logger.error('فشل إعداد الويب هوك لـ Shopify:', error);
    throw new MarketplaceApiError(`فشل إعداد الويب هوك لـ Shopify: ${error.message}`);
  }
};