import { useState, useCallback, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { inventoryService } from '../services/inventory';

/**
 * خطاف لإدارة المخزون
 * يوفر وظائف وبيانات المخزون
 * @returns {Object} كائن يحتوي على بيانات ووظائف المخزون
 */
const useInventory = () => {
  const { activeStore } = useContext(StoreContext);
  
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    productId: '',
    stockStatus: 'all', // all, in_stock, low_stock, out_of_stock
    sortBy: 'name', // name, sku, quantity, last_updated
    sortDirection: 'asc',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25
  });

  /**
   * جلب بيانات المخزون
   * @param {string} storeId - معرف المتجر (اختياري)
   * @param {number} page - رقم الصفحة
   * @param {Object} filterParams - معايير الفلترة
   * @returns {Object} البيانات مع معلومات الصفحات
   */
  const fetchInventory = useCallback(async (storeId = null, page = 1, filterParams = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب المخزون');
      }
      
      // استخدام الفلاتر الحالية إذا لم يتم تحديد فلاتر
      const queryParams = filterParams || filters;
      
      // إضافة معلومات الصفحة
      const params = {
        ...queryParams,
        page,
        limit: pagination.itemsPerPage
      };
      
      const response = await inventoryService.getInventory(targetStoreId, params);
      
      setInventory(response.inventory);
      setPagination(response.pagination);
      
      return response;
    } catch (err) {
      setError(err.message || 'فشل جلب بيانات المخزون');
      return { inventory: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 25 } };
    } finally {
      setLoading(false);
    }
  }, [activeStore, filters, pagination.itemsPerPage]);

  /**
   * جلب تفاصيل مخزون منتج واحد
   * @param {string} productId - معرف المنتج
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} بيانات مخزون المنتج
   */
  const getProductInventory = async (productId, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب مخزون المنتج');
      }
      
      const productInventory = await inventoryService.getProductInventory(targetStoreId, productId);
      return productInventory;
    } catch (err) {
      setError(err.message || 'فشل جلب بيانات مخزون المنتج');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * تحديث كمية المخزون
   * @param {string} productId - معرف المنتج
   * @param {number} quantity - الكمية الجديدة
   * @param {string} variantId - معرف المتغير (اختياري)
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} البيانات المحدثة
   */
  const updateInventoryQuantity = async (productId, quantity, variantId = null, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لتحديث المخزون');
      }
      
      const updatedInventory = await inventoryService.updateQuantity(
        targetStoreId, 
        productId, 
        quantity, 
        variantId
      );
      
      // تحديث البيانات المحلية
      setInventory(prevInventory => prevInventory.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: updatedInventory.quantity };
        }
        return item;
      }));
      
      return updatedInventory;
    } catch (err) {
      setError(err.message || 'فشل تحديث كمية المخزون');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * إجراء تعديل على المخزون (إضافة أو سحب)
   * @param {string} productId - معرف المنتج
   * @param {number} adjustmentQuantity - كمية التعديل (موجبة للإضافة، سالبة للسحب)
   * @param {string} reason - سبب التعديل
   * @param {string} variantId - معرف المتغير (اختياري)
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Object} بيانات التعديل
   */
  const adjustInventory = async (productId, adjustmentQuantity, reason, variantId = null, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لتعديل المخزون');
      }
      
      const adjustment = await inventoryService.adjustInventory(
        targetStoreId,
        productId,
        adjustmentQuantity,
        reason,
        variantId
      );
      
      // إعادة تحميل المخزون لتحديث البيانات
      fetchInventory(targetStoreId, pagination.currentPage);
      
      return adjustment;
    } catch (err) {
      setError(err.message || 'فشل تعديل المخزون');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * جلب سجل تعديلات المخزون
   * @param {string} productId - معرف المنتج (اختياري)
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Array} سجل التعديلات
   */
  const getInventoryHistory = async (productId = null, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب سجل المخزون');
      }
      
      const history = await inventoryService.getInventoryHistory(targetStoreId, productId);
      return history;
    } catch (err) {
      setError(err.message || 'فشل جلب سجل تعديلات المخزون');
      return [];
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
    fetchInventory(activeStore?.id, page);
  };

  /**
   * تغيير عدد العناصر في الصفحة
   * @param {number} itemsPerPage - عدد العناصر في الصفحة
   */
  const updateItemsPerPage = (itemsPerPage) => {
    setPagination(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  };

  /**
   * جلب منتجات منخفضة المخزون
   * @param {string} storeId - معرف المتجر (اختياري)
   * @param {number} threshold - حد المخزون المنخفض
   * @returns {Array} قائمة المنتجات
   */
  const getLowStockProducts = async (storeId = null, threshold = 5) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب المنتجات منخفضة المخزون');
      }
      
      const products = await inventoryService.getLowStockProducts(targetStoreId, threshold);
      return products;
    } catch (err) {
      setError(err.message || 'فشل جلب المنتجات منخفضة المخزون');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * جلب منتجات نفذت من المخزون
   * @param {string} storeId - معرف المتجر (اختياري)
   * @returns {Array} قائمة المنتجات
   */
  const getOutOfStockProducts = async (storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        throw new Error('لم يتم تحديد متجر لجلب المنتجات التي نفذت من المخزون');
      }
      
      const products = await inventoryService.getOutOfStockProducts(targetStoreId);
      return products;
    } catch (err) {
      setError(err.message || 'فشل جلب المنتجات التي نفذت من المخزون');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * مسح الخطأ
   */
  const clearError = () => setError(null);

  return {
    inventory,
    loading,
    error,
    filters,
    pagination,
    fetchInventory,
    getProductInventory,
    updateInventoryQuantity,
    adjustInventory,
    getInventoryHistory,
    updateFilters,
    updateCurrentPage,
    updateItemsPerPage,
    getLowStockProducts,
    getOutOfStockProducts,
    clearError
  };
};

export default useInventory;