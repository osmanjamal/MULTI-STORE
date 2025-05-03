import { get, post, put } from './api';

/**
 * خدمة المخزون
 * توفر وظائف للتعامل مع المخزون
 */
export const inventoryService = {
  /**
   * جلب بيانات المخزون
   * @param {string} storeId - معرف المتجر
   * @param {Object} params - معايير البحث والفلترة
   * @returns {Promise} وعد ببيانات المخزون ومعلومات الصفحات
   */
  async getInventory(storeId, params = {}) {
    try {
      const response = await get(`/stores/${storeId}/inventory`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب مخزون منتج محدد
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @returns {Promise} وعد ببيانات مخزون المنتج
   */
  async getProductInventory(storeId, productId) {
    try {
      const response = await get(
        `/stores/${storeId}/inventory/product/${productId}`
      );
      return response.inventory;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث كمية المخزون
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {number} quantity - الكمية الجديدة
   * @param {string} variantId - معرف المتغير (اختياري)
   * @returns {Promise} وعد ببيانات المخزون المحدثة
   */
  async updateQuantity(storeId, productId, quantity, variantId = null) {
    try {
      const response = await put(`/stores/${storeId}/inventory/quantity`, {
        productId,
        variantId,
        quantity,
      });
      return response.inventory;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تعديل المخزون (إضافة أو سحب)
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {number} adjustmentQuantity - كمية التعديل (موجبة للإضافة، سالبة للسحب)
   * @param {string} reason - سبب التعديل
   * @param {string} variantId - معرف المتغير (اختياري)
   * @returns {Promise} وعد ببيانات التعديل
   */
  async adjustInventory(
    storeId,
    productId,
    adjustmentQuantity,
    reason,
    variantId = null
  ) {
    try {
      const response = await post(`/stores/${storeId}/inventory/adjust`, {
        productId,
        variantId,
        adjustmentQuantity,
        reason,
      });
      return response.adjustment;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب سجل تعديلات المخزون
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج (اختياري)
   * @returns {Promise} وعد بسجل التعديلات
   */
  async getInventoryHistory(storeId, productId = null) {
    try {
      const params = productId ? { productId } : {};
      const response = await get(
        `/stores/${storeId}/inventory/history`,
        params
      );
      return response.history;
    } catch (error) {
      throw error;
    }
  },

  /**
   * مزامنة المخزون بين متجرين
   * @param {string} sourceStoreId - معرف المتجر المصدر
   * @param {string} targetStoreId - معرف المتجر الهدف
   * @param {Object} options - خيارات المزامنة
   * @returns {Promise} وعد بنتيجة المزامنة
   */
  async syncInventory(sourceStoreId, targetStoreId, options = {}) {
    try {
      const response = await post('/inventory/sync', {
        sourceStoreId,
        targetStoreId,
        options,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب المنتجات منخفضة المخزون
   * @param {string} storeId - معرف المتجر
   * @param {number} threshold - حد المخزون المنخفض
   * @returns {Promise} وعد بقائمة المنتجات
   */
  async getLowStockProducts(storeId, threshold = 5) {
    try {
      const response = await get(`/stores/${storeId}/inventory/low-stock`, {
        threshold,
      });
      return response.products;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب المنتجات التي نفذت من المخزون
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بقائمة المنتجات
   */
  async getOutOfStockProducts(storeId) {
    try {
      const response = await get(`/stores/${storeId}/inventory/out-of-stock`);
      return response.products;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تعيين مستوى التنبيه للمخزون المنخفض
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {number} threshold - حد التنبيه
   * @param {string} variantId - معرف المتغير (اختياري)
   * @returns {Promise} وعد بالبيانات المحدثة
   */
  async setLowStockAlert(storeId, productId, threshold, variantId = null) {
    try {
      const response = await put(
        `/stores/${storeId}/inventory/low-stock-alert`,
        {
          productId,
          variantId,
          threshold,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب تقارير المخزون
   * @param {string} storeId - معرف المتجر
   * @param {string} reportType - نوع التقرير (stock_value, turnover, movements)
   * @param {Object} params - معايير التقرير
   * @returns {Promise} وعد ببيانات التقرير
   */
  async getInventoryReport(storeId, reportType, params = {}) {
    try {
      const response = await get(
        `/stores/${storeId}/inventory/reports/${reportType}`,
        params
      );
      return response.report;
    } catch (error) {
      throw error;
    }
  },

  /**
   * الحصول على قيمة المخزون الإجمالية
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بقيمة المخزون
   */
  async getTotalStockValue(storeId) {
    try {
      const response = await get(`/stores/${storeId}/inventory/total-value`);
      return response.value;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث إعدادات المخزون
   * @param {string} storeId - معرف المتجر
   * @param {Object} settings - الإعدادات الجديدة
   * @returns {Promise} وعد بالإعدادات المحدثة
   */
  async updateInventorySettings(storeId, settings) {
    try {
      const response = await put(
        `/stores/${storeId}/inventory/settings`,
        settings
      );
      return response.settings;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب إعدادات المخزون
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بإعدادات المخزون
   */
  async getInventorySettings(storeId) {
    try {
      const response = await get(`/stores/${storeId}/inventory/settings`);
      return response.settings;
    } catch (error) {
      throw error;
    }
  }
};

export default inventoryService;