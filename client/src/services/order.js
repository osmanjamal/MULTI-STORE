import { get, post, put, download } from './api';

/**
 * خدمة الطلبات
 * توفر وظائف للتعامل مع الطلبات
 */
export const orderService = {
  /**
   * جلب قائمة الطلبات
   * @param {string} storeId - معرف المتجر
   * @param {Object} params - معايير البحث والفلترة
   * @returns {Promise} وعد بقائمة الطلبات ومعلومات الصفحات
   */
  async getOrders(storeId, params = {}) {
    try {
      const response = await get(`/stores/${storeId}/orders`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب تفاصيل طلب محدد
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @returns {Promise} وعد ببيانات الطلب
   */
  async getOrderById(storeId, orderId) {
    try {
      const response = await get(`/stores/${storeId}/orders/${orderId}`);
      return response.order;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث حالة الطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @param {string} status - الحالة الجديدة
   * @returns {Promise} وعد ببيانات الطلب المحدثة
   */
  async updateOrderStatus(storeId, orderId, status) {
    try {
      const response = await put(
        `/stores/${storeId}/orders/${orderId}/status`,
        { status }
      );
      return response.order;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إضافة ملاحظة للطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @param {string} note - نص الملاحظة
   * @param {boolean} isPrivate - هل الملاحظة خاصة بالإدارة فقط
   * @returns {Promise} وعد ببيانات الطلب المحدثة
   */
  async addOrderNote(storeId, orderId, note, isPrivate = true) {
    try {
      const response = await post(
        `/stores/${storeId}/orders/${orderId}/notes`,
        { note, isPrivate }
      );
      return response.order;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تأكيد شحن الطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @param {Object} shippingData - بيانات الشحن
   * @returns {Promise} وعد ببيانات الشحن
   */
  async fulfillOrder(storeId, orderId, shippingData) {
    try {
      const response = await post(
        `/stores/${storeId}/orders/${orderId}/fulfill`,
        shippingData
      );
      return response.fulfillment;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إلغاء الطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @param {string} reason - سبب الإلغاء
   * @returns {Promise} وعد ببيانات الطلب المحدثة
   */
  async cancelOrder(storeId, orderId, reason) {
    try {
      const response = await post(
        `/stores/${storeId}/orders/${orderId}/cancel`,
        { reason }
      );
      return response.order;
    } catch (error) {
      throw error;
    }
  },

  /**
   * استرداد مبلغ الطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @param {Object} refundData - بيانات الاسترداد
   * @returns {Promise} وعد ببيانات الاسترداد
   */
  async refundOrder(storeId, orderId, refundData) {
    try {
      const response = await post(
        `/stores/${storeId}/orders/${orderId}/refund`,
        refundData
      );
      return response.refund;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب فواتير الطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @returns {Promise} وعد بقائمة الفواتير
   */
  async getOrderInvoices(storeId, orderId) {
    try {
      const response = await get(
        `/stores/${storeId}/orders/${orderId}/invoices`
      );
      return response.invoices;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إنشاء فاتورة جديدة للطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @param {Object} invoiceData - بيانات الفاتورة
   * @returns {Promise} وعد ببيانات الفاتورة الجديدة
   */
  async createOrderInvoice(storeId, orderId, invoiceData) {
    try {
      const response = await post(
        `/stores/${storeId}/orders/${orderId}/invoices`,
        invoiceData
      );
      return response.invoice;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تنزيل فاتورة الطلب
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @param {string} invoiceId - معرف الفاتورة
   * @param {string} format - صيغة التنزيل (pdf, html)
   * @returns {Promise} وعد برابط تنزيل الفاتورة
   */
  async downloadInvoice(storeId, orderId, invoiceId, format = 'pdf') {
    try {
      const response = await download(
        `/stores/${storeId}/orders/${orderId}/invoices/${invoiceId}/download`,
        { format },
        `invoice_${orderId}_${invoiceId}.${format}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إرسال تأكيد الطلب بالبريد الإلكتروني
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @returns {Promise} وعد بنتيجة العملية
   */
  async sendOrderConfirmation(storeId, orderId) {
    try {
      const response = await post(
        `/stores/${storeId}/orders/${orderId}/send-confirmation`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تصدير الطلبات
   * @param {string} storeId - معرف المتجر
   * @param {string} format - صيغة التصدير (csv, pdf, excel)
   * @param {Object} params - معايير الفلترة
   * @returns {Promise} وعد برابط تنزيل الملف المصدر
   */
  async exportOrders(storeId, format = 'csv', params = {}) {
    try {
      const response = await download(
        `/stores/${storeId}/orders/export`,
        { format, ...params },
        `orders_export_${new Date().toISOString()}.${format}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب إحصائيات الطلبات
   * @param {string} storeId - معرف المتجر
   * @param {Object} dateRange - نطاق التاريخ
   * @returns {Promise} وعد بإحصائيات الطلبات
   */
  async getOrderStatistics(storeId, dateRange = {}) {
    try {
      const response = await get(`/stores/${storeId}/orders/statistics`, dateRange);
      return response.statistics;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب أكثر المنتجات مبيعاً
   * @param {string} storeId - معرف المتجر
   * @param {Object} params - معايير الفلترة
   * @returns {Promise} وعد بقائمة المنتجات
   */
  async getTopSellingProducts(storeId, params = {}) {
    try {
      const response = await get(`/stores/${storeId}/orders/top-products`, params);
      return response.products;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب أكثر العملاء شراءً
   * @param {string} storeId - معرف المتجر
   * @param {Object} params - معايير الفلترة
   * @returns {Promise} وعد بقائمة العملاء
   */
  async getTopCustomers(storeId, params = {}) {
    try {
      const response = await get(`/stores/${storeId}/orders/top-customers`, params);
      return response.customers;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب بيانات المبيعات حسب الفترة
   * @param {string} storeId - معرف المتجر
   * @param {string} interval - الفترة (day, week, month, year)
   * @param {Object} dateRange - نطاق التاريخ
   * @returns {Promise} وعد ببيانات المبيعات
   */
  async getSalesByPeriod(storeId, interval = 'day', dateRange = {}) {
    try {
      const response = await get(`/stores/${storeId}/orders/sales-by-period`, {
        interval,
        ...dateRange,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * طباعة فاتورة شحن
   * @param {string} storeId - معرف المتجر
   * @param {string} orderId - معرف الطلب
   * @returns {Promise} وعد برابط تنزيل فاتورة الشحن
   */
  async printShippingLabel(storeId, orderId) {
    try {
      const response = await download(
        `/stores/${storeId}/orders/${orderId}/shipping-label`,
        {},
        `shipping_label_${orderId}.pdf`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * مزامنة الطلبات بين متجرين
   * @param {string} sourceStoreId - معرف المتجر المصدر
   * @param {string} targetStoreId - معرف المتجر الهدف
   * @param {Object} options - خيارات المزامنة
   * @returns {Promise} وعد بنتيجة المزامنة
   */
  async syncOrders(sourceStoreId, targetStoreId, options = {}) {
    try {
      const response = await post('/orders/sync', {
        sourceStoreId,
        targetStoreId,
        options,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;