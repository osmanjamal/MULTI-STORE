import { get, post, put, del } from './api';

/**
 * خدمة المتاجر
 * توفر وظائف للتعامل مع المتاجر
 */
export const storeService = {
  /**
   * جلب قائمة المتاجر
   * @returns {Promise} وعد بقائمة المتاجر
   */
  async getStores() {
    try {
      const response = await get('/stores');
      return response.stores;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب متجر واحد بالمعرف
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد ببيانات المتجر
   */
  async getStoreById(storeId) {
    try {
      const response = await get(`/stores/${storeId}`);
      return response.store;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إنشاء متجر جديد
   * @param {Object} storeData - بيانات المتجر الجديد
   * @returns {Promise} وعد ببيانات المتجر الجديد
   */
  async createStore(storeData) {
    try {
      const response = await post('/stores', storeData);
      return response.store;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث بيانات متجر
   * @param {string} storeId - معرف المتجر
   * @param {Object} updatedData - البيانات المحدثة
   * @returns {Promise} وعد ببيانات المتجر المحدثة
   */
  async updateStore(storeId, updatedData) {
    try {
      const response = await put(`/stores/${storeId}`, updatedData);
      return response.store;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حذف متجر
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بنتيجة العملية
   */
  async deleteStore(storeId) {
    try {
      const response = await del(`/stores/${storeId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * اختبار اتصال المتجر
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بنتيجة الاختبار
   */
  async testConnection(storeId) {
    try {
      const response = await post(`/stores/${storeId}/test-connection`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب إحصائيات المتجر
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بإحصائيات المتجر
   */
  async getStoreStats(storeId) {
    try {
      const response = await get(`/stores/${storeId}/stats`);
      return response.stats;
    } catch (error) {
      throw error;
    }
  },

  /**
   * الحصول على رابط المصادقة لمنصة التجارة الإلكترونية
   * @param {string} platform - اسم المنصة (shopify, woocommerce, lazada, shopee)
   * @param {string} redirectUri - عنوان URL لإعادة التوجيه بعد المصادقة
   * @returns {Promise} وعد برابط المصادقة
   */
  async getAuthUrl(platform, redirectUri) {
    try {
      const response = await get('/stores/auth-url', {
        platform,
        redirectUri,
      });
      return response.authUrl;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إكمال عملية المصادقة مع منصة التجارة الإلكترونية
   * @param {string} platform - اسم المنصة
   * @param {string} code - رمز المصادقة
   * @param {string} state - حالة الطلب
   * @returns {Promise} وعد ببيانات المتجر الجديد
   */
  async completePlatformAuth(platform, code, state) {
    try {
      const response = await post('/stores/complete-auth', {
        platform,
        code,
        state,
      });
      return response.store;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إعادة مزامنة المتجر
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بنتيجة العملية
   */
  async refreshStore(storeId) {
    try {
      const response = await post(`/stores/${storeId}/refresh`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث بيانات الاعتماد للمتجر
   * @param {string} storeId - معرف المتجر
   * @param {Object} credentials - بيانات الاعتماد الجديدة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async updateCredentials(storeId, credentials) {
    try {
      const response = await put(`/stores/${storeId}/credentials`, credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب قائمة العملاء من المتجر
   * @param {string} storeId - معرف المتجر
   * @param {Object} params - معايير البحث والفلترة
   * @returns {Promise} وعد بقائمة العملاء
   */
  async getCustomers(storeId, params = {}) {
    try {
      const response = await get(`/stores/${storeId}/customers`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب قائمة طرق الدفع المدعومة في المتجر
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بقائمة طرق الدفع
   */
  async getPaymentMethods(storeId) {
    try {
      const response = await get(`/stores/${storeId}/payment-methods`);
      return response.paymentMethods;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب قائمة طرق الشحن المدعومة في المتجر
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بقائمة طرق الشحن
   */
  async getShippingMethods(storeId) {
    try {
      const response = await get(`/stores/${storeId}/shipping-methods`);
      return response.shippingMethods;
    } catch (error) {
      throw error;
    }
  }
};

export default storeService;