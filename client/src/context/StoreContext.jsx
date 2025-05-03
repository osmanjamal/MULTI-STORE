import React, { createContext, useState, useEffect, useCallback } from 'react';
import { storeService } from '../services/store';

// إنشاء سياق المتاجر
export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  
  // وظيفة جلب قائمة المتاجر
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storesList = await storeService.getStores();
      setStores(storesList);
      
      // إعداد حالة الاتصال لكل متجر
      const statusMap = {};
      storesList.forEach(store => {
        statusMap[store.id] = store.isConnected;
      });
      setConnectionStatus(statusMap);
      
      // تحديد المتجر النشط إذا لم يكن محدداً
      if (!activeStore && storesList.length > 0) {
        setActiveStore(storesList[0]);
      }
      
      return storesList;
    } catch (err) {
      console.error('فشل جلب المتاجر:', err);
      setError(err.message || 'فشل جلب قائمة المتاجر. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [activeStore]);
  
  // جلب المتاجر عند تحميل الصفحة
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);
  
  // وظيفة جلب متجر واحد بالمعرف
  const getStore = async (storeId) => {
    try {
      setLoading(true);
      setError(null);
      
      const store = await storeService.getStoreById(storeId);
      return store;
    } catch (err) {
      console.error(`فشل جلب المتجر (المعرف: ${storeId}):`, err);
      setError(err.message || 'فشل جلب بيانات المتجر. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة إضافة متجر جديد
  const addStore = async (storeData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newStore = await storeService.createStore(storeData);
      
      // تحديث القائمة
      setStores(prevStores => [...prevStores, newStore]);
      
      // تحديث حالة الاتصال
      setConnectionStatus(prevStatus => ({
        ...prevStatus,
        [newStore.id]: newStore.isConnected
      }));
      
      return newStore;
    } catch (err) {
      console.error('فشل إضافة المتجر:', err);
      setError(err.message || 'فشل إضافة المتجر. يرجى التحقق من البيانات والمحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تحديث متجر
  const updateStore = async (storeId, updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedStore = await storeService.updateStore(storeId, updatedData);
      
      // تحديث القائمة
      setStores(prevStores => prevStores.map(store => 
        store.id === storeId ? updatedStore : store
      ));
      
      // تحديث المتجر النشط إذا كان هو المتجر المحدث
      if (activeStore && activeStore.id === storeId) {
        setActiveStore(updatedStore);
      }
      
      // تحديث حالة الاتصال
      setConnectionStatus(prevStatus => ({
        ...prevStatus,
        [storeId]: updatedStore.isConnected
      }));
      
      return updatedStore;
    } catch (err) {
      console.error(`فشل تحديث المتجر (المعرف: ${storeId}):`, err);
      setError(err.message || 'فشل تحديث بيانات المتجر. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة حذف متجر
  const deleteStore = async (storeId) => {
    try {
      setLoading(true);
      setError(null);
      
      await storeService.deleteStore(storeId);
      
      // تحديث القائمة
      setStores(prevStores => prevStores.filter(store => store.id !== storeId));
      
      // إعادة تعيين المتجر النشط إذا كان هو المتجر المحذوف
      if (activeStore && activeStore.id === storeId) {
        const remainingStores = stores.filter(store => store.id !== storeId);
        setActiveStore(remainingStores.length > 0 ? remainingStores[0] : null);
      }
      
      // تحديث حالة الاتصال
      setConnectionStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        delete newStatus[storeId];
        return newStatus;
      });
      
      return true;
    } catch (err) {
      console.error(`فشل حذف المتجر (المعرف: ${storeId}):`, err);
      setError(err.message || 'فشل حذف المتجر. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تحديد المتجر النشط
  const setActiveStoreById = async (storeId) => {
    if (!storeId) {
      setActiveStore(null);
      return;
    }
    
    // البحث عن المتجر في القائمة الحالية
    let store = stores.find(s => s.id === storeId);
    
    // إذا لم يتم العثور على المتجر، جلبه من الخادم
    if (!store) {
      store = await getStore(storeId);
    }
    
    setActiveStore(store);
  };
  
  // وظيفة اختبار اتصال المتجر
  const testStoreConnection = async (storeId) => {
    try {
      setLoading(true);
      setError(null);
      
      const connectionResult = await storeService.testConnection(storeId);
      
      // تحديث حالة الاتصال
      setConnectionStatus(prevStatus => ({
        ...prevStatus,
        [storeId]: connectionResult.isConnected
      }));
      
      // تحديث المتجر في القائمة
      setStores(prevStores => prevStores.map(store => 
        store.id === storeId ? { ...store, isConnected: connectionResult.isConnected } : store
      ));
      
      return connectionResult;
    } catch (err) {
      console.error(`فشل اختبار اتصال المتجر (المعرف: ${storeId}):`, err);
      setError(err.message || 'فشل اختبار اتصال المتجر. يرجى المحاولة مرة أخرى.');
      
      // تحديث حالة الاتصال في حالة الفشل
      setConnectionStatus(prevStatus => ({
        ...prevStatus,
        [storeId]: false
      }));
      
      return { isConnected: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة جلب الإحصائيات
  const getStoreStats = async (storeId) => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await storeService.getStoreStats(storeId);
      return stats;
    } catch (err) {
      console.error(`فشل جلب إحصائيات المتجر (المعرف: ${storeId}):`, err);
      setError(err.message || 'فشل جلب إحصائيات المتجر. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة الحصول على رمز المصادقة من منصة التجارة الإلكترونية
  const authenticateWithPlatform = async (platform, redirectUri) => {
    try {
      setLoading(true);
      setError(null);
      
      const authUrl = await storeService.getAuthUrl(platform, redirectUri);
      return authUrl;
    } catch (err) {
      console.error(`فشل توليد رابط المصادقة للمنصة (${platform}):`, err);
      setError(err.message || 'فشل إعداد المصادقة مع المنصة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة معالجة إعادة التوجيه من منصة التجارة الإلكترونية
  const handlePlatformCallback = async (platform, code, state) => {
    try {
      setLoading(true);
      setError(null);
      
      const newStore = await storeService.completePlatformAuth(platform, code, state);
      
      // تحديث القائمة
      setStores(prevStores => [...prevStores, newStore]);
      
      // تحديث حالة الاتصال
      setConnectionStatus(prevStatus => ({
        ...prevStatus,
        [newStore.id]: true
      }));
      
      return newStore;
    } catch (err) {
      console.error(`فشل إكمال المصادقة مع المنصة (${platform}):`, err);
      setError(err.message || 'فشل إكمال المصادقة مع المنصة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // القيم التي سيتم توفيرها من خلال السياق
  const contextValue = {
    stores,
    activeStore,
    loading,
    error,
    connectionStatus,
    fetchStores,
    getStore,
    addStore,
    updateStore,
    deleteStore,
    setActiveStore: setActiveStoreById,
    testStoreConnection,
    getStoreStats,
    authenticateWithPlatform,
    handlePlatformCallback,
    clearError: () => setError(null)
  };
  
  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;