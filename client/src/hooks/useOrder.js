import { useState, useCallback, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { orderService } from '../services/order';

/**
 * خطاف لإدارة الطلبات
 * يوفر وظائف وبيانات الطلبات
 * @returns {Object} كائن يحتوي على بيانات ووظائف الطلبات
 */
const useOrder = () => {
  const { activeStore } = useContext(StoreContext);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // all, pending, processing, completed, cancelled, refunded
    dateRange: { start: null, end: null },
    customer: '',
    sortBy: 'date', // date, order_id, customer, total
    sortDirection: 'desc',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25
  });

  /**
   * جلب قائمة الطلبات
   * @param {string} storeId - معرف المتجر (اختياري)
   * @param {number} page - رقم الصفحة
   * @param {Object} filterParams - معايير الفلترة
   * @returns {Object} البيانات مع معلومات الصفحات
   */
  const fetchOrders = useCallback(async (storeId = null, page = 1, filterParams = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب الطلبات');
      }
      
      // استخدام الفلاتر الحالية إذا لم يتم تحديد فلاتر
      const queryParams = filterParams || filters;
      
      // إضافة معلومات الصفحة
      const params = {
        ...queryParams,
        page,
        limit: pagination.itemsPerPage
      };
      
      const response = await orderService.getOrders(targetStoreId, params);
      
      setOrders(response.orders);
      setPagination(response.pagination);
      
      return response;
    } catch (err) {
      setError(err.message || 'فشل جلب الطلبات');
      return { orders: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 25 } };
    } finally {
      setLoading(false);
    }
  }, [activeStore, filters, pagination.itemsPerPage]);

  /**
   * جلب تفاصيل طلب واحد
   * @param {string} orderId - معرف الطلب
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} بيانات الطلب
   */
  const getOrderDetails = async (orderId, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب تفاصيل الطلب');
      }
      
      const order = await orderService.getOrderById(targetStoreId, orderId);
      return order;
    } catch (err) {
      setError(err.message || 'فشل جلب تفاصيل الطلب');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * تحديث حالة الطلب
   * @param {string} orderId - معرف الطلب
   * @param {string} status - الحالة الجديدة
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} البيانات المحدثة
   */
  const updateOrderStatus = async (orderId, status, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لتحديث حالة الطلب');
      }
      
      const updatedOrder = await orderService.updateOrderStatus(targetStoreId, orderId, status);
      
      // تحديث القائمة المحلية
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: updatedOrder.status } : order
      ));
      
      return updatedOrder;
    } catch (err) {
      setError(err.message || 'فشل تحديث حالة الطلب');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * إضافة ملاحظة للطلب
   * @param {string} orderId - معرف الطلب
   * @param {string} note - نص الملاحظة
   * @param {boolean} isPrivate - هل الملاحظة خاصة بالإدارة فقط
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} البيانات المحدثة
   */
  const addOrderNote = async (orderId, note, isPrivate = true, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لإضافة ملاحظة للطلب');
      }
      
      const updatedOrder = await orderService.addOrderNote(targetStoreId, orderId, note, isPrivate);
      return updatedOrder;
    } catch (err) {
      setError(err.message || 'فشل إضافة ملاحظة للطلب');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * تأكيد شحن الطلب
   * @param {string} orderId - معرف الطلب
   * @param {Object} shippingData - بيانات الشحن
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} بيانات الشحن
   */
  const fulfillOrder = async (orderId, shippingData, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لتأكيد شحن الطلب');
      }
      
      const fulfillment = await orderService.fulfillOrder(targetStoreId, orderId, shippingData);
      
      // تحديث القائمة المحلية
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: 'completed', fulfillment } : order
      ));
      
      return fulfillment;
    } catch (err) {
      setError(err.message || 'فشل تأكيد شحن الطلب');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * إلغاء الطلب
   * @param {string} orderId - معرف الطلب
   * @param {string} reason - سبب الإلغاء
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} البيانات المحدثة
   */
  const cancelOrder = async (orderId, reason, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لإلغاء الطلب');
      }
      
      const cancelledOrder = await orderService.cancelOrder(targetStoreId, orderId, reason);
      
      // تحديث القائمة المحلية
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      return cancelledOrder;
    } catch (err) {
      setError(err.message || 'فشل إلغاء الطلب');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * تصدير الطلبات
   * @param {string} format - صيغة التصدير (csv, pdf, excel)
   * @param {Object} exportFilters - معايير فلترة الطلبات المصدرة
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} رابط تحميل الملف المصدر
   */
  const exportOrders = async (format = 'csv', exportFilters = null, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لتصدير الطلبات');
      }
      
      // استخدام الفلاتر الحالية إذا لم يتم تحديد فلاتر
      const filterParams = exportFilters || filters;
      
      const exportResult = await orderService.exportOrders(targetStoreId, format, filterParams);
      return exportResult;
    } catch (err) {
      setError(err.message || 'فشل تصدير الطلبات');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * جلب إحصائيات الطلبات
   * @param {Object} dateRange - نطاق التاريخ
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} الإحصائيات
   */
  const getOrderStatistics = async (dateRange = { start: null, end: null }, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب إحصائيات الطلبات');
      }
      
      const statistics = await orderService.getOrderStatistics(targetStoreId, dateRange);
      return statistics;
    } catch (err) {
      setError(err.message || 'فشل جلب إحصائيات الطلبات');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * تحديث إعدادات الفلترة
   * @param {Object} newFilters - إعدادات الفلترة الجديدة
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  /**
   * تحديث الصفحة الحالية
   * @param {number} page - رقم الصفحة
   */
  const updateCurrentPage = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchOrders(activeStore?.id, page);
  };

  /**
   * تغيير عدد العناصر في الصفحة
   * @param {number} itemsPerPage - عدد العناصر في الصفحة
   */
  const updateItemsPerPage = (itemsPerPage) => {
    setPagination(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  };

  /**
   * مسح الخطأ
   */
  const clearError = () => setError(null);

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    fetchOrders,
    getOrderDetails,
    updateOrderStatus,
    addOrderNote,
    fulfillOrder,
    cancelOrder,
    exportOrders,
    getOrderStatistics,
    updateFilters,
    updateCurrentPage,
    updateItemsPerPage,
    clearError
  };
};

export default useOrder;