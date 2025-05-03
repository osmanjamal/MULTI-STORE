// marketplace/lazadaService.js
const axios = require('axios');
const crypto = require('crypto');
const { MarketplaceApiError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const lazadaConfig = require('../../config/marketplace/lazada');

// إنشاء توقيع Lazada
const createSignature = (apiKey, apiPath, params) => {
  // ترتيب المعلمات أبجدياً
  const sortedParams = Object.keys(params).sort().reduce((result, key) => {
    result[key] = params[key];
    return result;
  }, {});
  
  // إنشاء سلسلة التوقيع
  let signString = apiPath;
  for (const [key, value] of Object.entries(sortedParams)) {
    signString += key + value;
  }
  
  // إنشاء التوقيع باستخدام HMAC-SHA256
  return crypto.createHmac('sha256', apiKey).update(signString).digest('hex').toUpperCase();
};

// إنشاء مثيل axios مع الإعدادات الأساسية
const createClient = (store) => {
  return axios.create({
    baseURL: lazadaConfig.endpoints.base,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// إضافة معلمات التوثيق إلى الطلب
const addAuthParams = (params, store, apiPath) => {
  const timestamp = Date.now().toString();
  const commonParams = {
    app_key: store.api_key,
    timestamp,
    sign_method: 'sha256'
  };
  
  const allParams = { ...commonParams, ...params };
  const signature = createSignature(store.api_secret, apiPath, allParams);
  
  return { ...allParams, sign: signature };
};

// الحصول على المنتجات
exports.getProducts = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const apiPath = lazadaConfig.endpoints.products;
    
    const { offset = 0, limit = 50, ...otherOptions } = options;
    
    const params = addAuthParams({
      access_token: store.access_token,
      offset,
      limit,
      ...otherOptions
    }, store, apiPath);
    
    const response = await client.get(apiPath, { params });
    
    if (response.data.code !== '0') {
      throw new Error(response.data.message || 'حدث خطأ أثناء جلب المنتجات');
    }
    
    return response.data.data;
  } catch (error) {
    logger.error('فشل الحصول على منتجات Lazada:', error);
    throw new MarketplaceApiError(`فشل الحصول على منتجات Lazada: ${error.message}`);
  }
};

// إنشاء منتج جديد
exports.createProduct = async (store, productData) => {
  try {
    const client = createClient(store);
    const apiPath = lazadaConfig.endpoints.create_product;
    
    const params = addAuthParams({
      access_token: store.access_token
    }, store, apiPath);
    
    const response = await client.post(apiPath, {
      product_data: JSON.stringify(productData)
    }, { params });
    
    if (response.data.code !== '0') {
      throw new Error(response.data.message || 'حدث خطأ أثناء إنشاء المنتج');
    }
    
    return response.data.data;
  } catch (error) {
    logger.error('فشل إنشاء منتج Lazada:', error);
    throw new MarketplaceApiError(`فشل إنشاء منتج Lazada: ${error.message}`);
  }
};

// تحديث المخزون
exports.updateInventory = async (store, productId, skuId, quantity) => {
  try {
    const client = createClient(store);
    const apiPath = lazadaConfig.endpoints.inventory;
    
    const params = addAuthParams({
      access_token: store.access_token
    }, store, apiPath);
    
    const response = await client.post(apiPath, {
      seller_sku: skuId,
      quantity
    }, { params });
    
    if (response.data.code !== '0') {
      throw new Error(response.data.message || 'حدث خطأ أثناء تحديث المخزون');
    }
    
    return response.data.data;
  } catch (error) {
    logger.error(`فشل تحديث مخزون Lazada (${skuId}):`, error);
    throw new MarketplaceApiError(`فشل تحديث مخزون Lazada: ${error.message}`);
  }
};

// الحصول على الطلبات
exports.getOrders = async (store, options = {}) => {
  try {
    const client = createClient(store);
    const apiPath = lazadaConfig.endpoints.orders;
    
    const { offset = 0, limit = 50, status = 'all', ...otherOptions } = options;
    const params = addAuthParams({
      access_token: store.access_token,
      offset,
      limit,
      status,
      ...otherOptions
    }, store, apiPath);
    
    const response = await client.get(apiPath, { params });
    
    if (response.data.code !== '0') {
      throw new Error(response.data.message || 'حدث خطأ أثناء جلب الطلبات');
    }
    
    return response.data.data;
  } catch (error) {
    logger.error('فشل الحصول على طلبات Lazada:', error);
    throw new MarketplaceApiError(`فشل الحصول على طلبات Lazada: ${error.message}`);
  }
};