const axios = require('axios');
const crypto = require('crypto');
const { MarketplaceApiError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const shopeeConfig = require('../../config/marketplace/shopee');

// إنشاء توقيع Shopee
const createSignature = (partnerId, partnerKey, path, timestamp) => {
  const baseString = `${partnerId}${path}${timestamp}`;
  return crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');
};

// إنشاء مثيل axios مع الإعدادات الأساسية
const createClient = (store) => {
  return axios.create({
    baseURL: shopeeConfig.endpoints.base,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// إضافة الرأس والتوقيع
const addAuthHeaders = (path, store) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createSignature(
    store.partner_id,
    store.partner_key,
    path,
    timestamp
  );
  
  return {
    'Authorization': signature,
    'X-Shopee-Partner-Id': store.partner_id,
    'X-Shopee-Timestamp': timestamp
  };
};

// الحصول على المنتجات
exports.getProducts = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const path = shopeeConfig.endpoints.products;
    
    const headers = addAuthHeaders(path, store);
    const response = await client.get(path, {
      headers,
      params: {
        shop_id: store.shop_id,
        offset: options.offset || 0,
        page_size: options.limit || 50,
        ...options
      }
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'حدث خطأ أثناء جلب المنتجات');
    }
    
    return response.data.response;
  } catch (error) {
    logger.error('فشل الحصول على منتجات Shopee:', error);
    throw new MarketplaceApiError(`فشل الحصول على منتجات Shopee: ${error.message}`);
  }
};

// الحصول على تفاصيل منتج
exports.getProductDetail = async (store, productId) => {
  try {
    const client = createClient(store);
    const path = shopeeConfig.endpoints.product_detail;
    
    const headers = addAuthHeaders(path, store);
    const response = await client.get(path, {
      headers,
      params: {
        shop_id: store.shop_id,
        item_id: productId
      }
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'حدث خطأ أثناء جلب تفاصيل المنتج');
    }
    
    return response.data.response;
  } catch (error) {
    logger.error(`فشل الحصول على تفاصيل منتج Shopee (${productId}):`, error);
    throw new MarketplaceApiError(`فشل الحصول على تفاصيل منتج Shopee: ${error.message}`);
  }
};

// إنشاء منتج جديد
exports.createProduct = async (store, productData) => {
  try {
    const client = createClient(store);
    const path = shopeeConfig.endpoints.create_product;
    
    const headers = addAuthHeaders(path, store);
    const response = await client.post(path, {
      shop_id: store.shop_id,
      ...productData
    }, { headers });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'حدث خطأ أثناء إنشاء المنتج');
    }
    
    return response.data.response;
  } catch (error) {
    logger.error('فشل إنشاء منتج Shopee:', error);
    throw new MarketplaceApiError(`فشل إنشاء منتج Shopee: ${error.message}`);
  }
};

// تحديث منتج
exports.updateProduct = async (store, productId, productData) => {
  try {
    const client = createClient(store);
    const path = shopeeConfig.endpoints.update_product;
    
    const headers = addAuthHeaders(path, store);
    const response = await client.put(path, {
      shop_id: store.shop_id,
      item_id: productId,
      ...productData
    }, { headers });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'حدث خطأ أثناء تحديث المنتج');
    }
    
    return response.data.response;
  } catch (error) {
    logger.error(`فشل تحديث منتج Shopee (${productId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث منتج Shopee: ${error.message}`);
  }
};

// تحديث المخزون
exports.updateInventory = async (store, productId, variationId, quantity) => {
  try {
    const client = createClient(store);
    const path = shopeeConfig.endpoints.inventory;
    
    const headers = addAuthHeaders(path, store);
    const requestData = {
      shop_id: store.shop_id,
      item_id: productId,
      stock_list: [{
        model_id: variationId || 0,
        normal_stock: quantity
      }]
    };
    
    const response = await client.post(path, requestData, { headers });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'حدث خطأ أثناء تحديث المخزون');
    }
    
    return response.data.response;
  } catch (error) {
    logger.error(`فشل تحديث مخزون Shopee (${productId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث مخزون Shopee: ${error.message}`);
  }
};

// الحصول على الطلبات
exports.getOrders = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const path = shopeeConfig.endpoints.orders;
    
    const headers = addAuthHeaders(path, store);
    const response = await client.get(path, {
      headers,
      params: {
        shop_id: store.shop_id,
        time_range_field: options.timeRangeField || 'create_time',
        time_from: options.timeFrom || Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
        time_to: options.timeTo || Math.floor(Date.now() / 1000),
        page_size: options.limit || 50,
        cursor: options.cursor,
        order_status: options.status || 'ALL',
        ...options
      }
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'حدث خطأ أثناء جلب الطلبات');
    }
    
    return response.data.response;
  } catch (error) {
    logger.error('فشل الحصول على طلبات Shopee:', error);
    throw new MarketplaceApiError(`فشل الحصول على طلبات Shopee: ${error.message}`);
  }
};