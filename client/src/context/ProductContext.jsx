import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { productService } from '../services/product';
import { StoreContext } from './StoreContext';

// إنشاء سياق المنتجات
export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { activeStore } = useContext(StoreContext);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productMappings, setProductMappings] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'all',
    priceRange: { min: 0, max: 0 },
    stockStatus: 'all',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25
  });
  
  // وظيفة جلب المنتجات
  const fetchProducts = useCallback(async (storeId = null, page = 1, filterParams = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لجلب المنتجات');
        setError('يرجى تحديد متجر لعرض المنتجات.');
        return { products: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 25 } };
      }
      
      // استخدام الفلاتر الحالية إذا لم يتم تحديد فلاتر
      const queryParams = filterParams || filters;
      
      // إضافة معلومات الصفحة
      const params = {
        ...queryParams,
        page,
        limit: pagination.itemsPerPage
      };
      
      const response = await productService.getProducts(targetStoreId, params);
      
      setProducts(response.products);
      setPagination(response.pagination);
      
      return response;
    } catch (err) {
      console.error('فشل جلب المنتجات:', err);
      setError(err.message || 'فشل جلب المنتجات. يرجى المحاولة مرة أخرى.');
      return { products: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 25 } };
    } finally {
      setLoading(false);
    }
  }, [activeStore, filters, pagination.itemsPerPage]);
  
  // جلب المنتجات عند تغيير المتجر النشط
  useEffect(() => {
    if (activeStore) {
      fetchProducts(activeStore.id);
      fetchCategories(activeStore.id);
    }
  }, [activeStore, fetchProducts]);
  
  // وظيفة جلب فئات المنتجات
  const fetchCategories = async (storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لجلب الفئات');
        setError('يرجى تحديد متجر لعرض فئات المنتجات.');
        return [];
      }
      
      const categoriesList = await productService.getCategories(targetStoreId);
      setCategories(categoriesList);
      
      return categoriesList;
    } catch (err) {
      console.error('فشل جلب فئات المنتجات:', err);
      setError(err.message || 'فشل جلب فئات المنتجات. يرجى المحاولة مرة أخرى.');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة جلب منتج واحد بالمعرف
  const getProduct = async (productId, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لجلب المنتج');
        setError('يرجى تحديد متجر لعرض المنتج.');
        return null;
      }
      
      const product = await productService.getProductById(targetStoreId, productId);
      return product;
    } catch (err) {
      console.error(`فشل جلب المنتج (المعرف: ${productId}):`, err);
      setError(err.message || 'فشل جلب بيانات المنتج. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة إضافة منتج جديد
  const addProduct = async (productData, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لإضافة المنتج');
        setError('يرجى تحديد متجر لإضافة المنتج.');
        return null;
      }
      
      const newProduct = await productService.createProduct(targetStoreId, productData);
      
      // تحديث القائمة
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      return newProduct;
    } catch (err) {
      console.error('فشل إضافة المنتج:', err);
      setError(err.message || 'فشل إضافة المنتج. يرجى التحقق من البيانات والمحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تحديث منتج
  const updateProduct = async (productId, updatedData, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لتحديث المنتج');
        setError('يرجى تحديد متجر لتحديث المنتج.');
        return null;
      }
      
      const updatedProduct = await productService.updateProduct(targetStoreId, productId, updatedData);
      
      // تحديث القائمة
      setProducts(prevProducts => prevProducts.map(product => 
        product.id === productId ? updatedProduct : product
      ));
      
      return updatedProduct;
    } catch (err) {
      console.error(`فشل تحديث المنتج (المعرف: ${productId}):`, err);
      setError(err.message || 'فشل تحديث بيانات المنتج. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة حذف منتج
  const deleteProduct = async (productId, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لحذف المنتج');
        setError('يرجى تحديد متجر لحذف المنتج.');
        return false;
      }
      
      await productService.deleteProduct(targetStoreId, productId);
      
      // تحديث القائمة
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      
      return true;
    } catch (err) {
      console.error(`فشل حذف المنتج (المعرف: ${productId}):`, err);
      setError(err.message || 'فشل حذف المنتج. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تحديث الفلاتر
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // إعادة الصفحة إلى البداية عند تغيير الفلاتر
  };
  
  // وظيفة تحديث حجم الصفحة
  const updateItemsPerPage = (itemsPerPage) => {
    setPagination(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  };
  
  // وظيفة تحديث الصفحة الحالية
  const updateCurrentPage = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchProducts(activeStore?.id, page);
  };
  
  // وظيفة استيراد المنتجات
  const importProducts = async (fileData, options, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لاستيراد المنتجات');
        setError('يرجى تحديد متجر لاستيراد المنتجات.');
        return null;
      }
      
      const result = await productService.importProducts(targetStoreId, fileData, options);
      
      // إعادة تحميل المنتجات
      fetchProducts(targetStoreId);
      
      return result;
    } catch (err) {
      console.error('فشل استيراد المنتجات:', err);
      setError(err.message || 'فشل استيراد المنتجات. يرجى التحقق من الملف والمحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تصدير المنتجات
  const exportProducts = async (options, storeId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام المتجر النشط إذا لم يتم تحديد متجر
      const targetStoreId = storeId || (activeStore ? activeStore.id : null);
      
      if (!targetStoreId) {
        console.error('لم يتم تحديد متجر لتصدير المنتجات');
        setError('يرجى تحديد متجر لتصدير المنتجات.');
        return null;
      }
      
      const result = await productService.exportProducts(targetStoreId, options);
      return result;
    } catch (err) {
      console.error('فشل تصدير المنتجات:', err);
      setError(err.message || 'فشل تصدير المنتجات. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة جلب روابط المنتجات بين المتاجر
  const fetchProductMappings = async (sourceStoreId, targetStoreId) => {
    try {
      setLoading(true);
      setError(null);
      
      const mappings = await productService.getProductMappings(sourceStoreId, targetStoreId);
      setProductMappings(mappings);
      
      return mappings;
    } catch (err) {
      console.error('فشل جلب روابط المنتجات:', err);
      setError(err.message || 'فشل جلب روابط المنتجات بين المتاجر. يرجى المحاولة مرة أخرى.');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة إنشاء ربط بين منتجين
  const createProductMapping = async (sourceProductId, targetProductId, sourceStoreId, targetStoreId) => {
    try {
      setLoading(true);
      setError(null);
      
      const mapping = await productService.createProductMapping(sourceProductId, targetProductId, sourceStoreId, targetStoreId);
      
      // تحديث القائمة
      setProductMappings(prevMappings => [...prevMappings, mapping]);
      
      return mapping;
    } catch (err) {
      console.error('فشل إنشاء ربط بين المنتجات:', err);
      setError(err.message || 'فشل إنشاء ربط بين المنتجات. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة حذف ربط بين منتجين
  const deleteProductMapping = async (mappingId) => {
    try {
      setLoading(true);
      setError(null);
      
      await productService.deleteProductMapping(mappingId);
      
      // تحديث القائمة
      setProductMappings(prevMappings => prevMappings.filter(mapping => mapping.id !== mappingId));
      
      return true;
    } catch (err) {
      console.error(`فشل حذف ربط المنتج (المعرف: ${mappingId}):`, err);
      setError(err.message || 'فشل حذف ربط المنتج. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // القيم التي سيتم توفيرها من خلال السياق
  const contextValue = {
    products,
    categories,
    loading,
    error,
    filters,
    pagination,
    productMappings,
    fetchProducts,
    fetchCategories,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    updateFilters,
    updateItemsPerPage,
    updateCurrentPage,
    importProducts,
    exportProducts,
    fetchProductMappings,
    createProductMapping,
    deleteProductMapping,
    clearError: () => setError(null)
  };
  
  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;