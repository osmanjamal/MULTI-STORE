import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { useSync } from '../../hooks/useSync';

const SyncSettings = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [triggeringSyncNow, setTriggeringSyncNow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    syncEnabled: true,
    notifyOnError: true,
    notifyOnSuccess: false,
    notificationEmail: '',
    logRetentionDays: 30,
    maxConcurrentSyncs: 3,
    syncProducts: true,
    syncInventory: true,
    syncPrices: true,
    syncOrders: true,
  });
  
  const { getSyncSettings, updateSyncSettings, triggerSync } = useSync();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSyncSettings();
        setSettings(data);
      } catch (err) {
        setError('فشل تحميل إعدادات المزامنة');
        console.error('Sync settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getSyncSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      await updateSyncSettings(settings);
      setSuccess('تم تحديث إعدادات المزامنة بنجاح');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث إعدادات المزامنة. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerSync = async (syncType) => {
    try {
      setTriggeringSyncNow(true);
      setError('');
      setSuccess('');
      
      await triggerSync(syncType);
      setSuccess(`تم بدء مزامنة ${getSyncTypeName(syncType)} بنجاح`);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل بدء المزامنة. يرجى المحاولة مرة أخرى.');
    } finally {
      setTriggeringSyncNow(false);
    }
  };

  const getSyncTypeName = (type) => {
    switch (type) {
      case 'inventory':
        return 'المخزون';
      case 'products':
        return 'المنتجات';
      case 'prices':
        return 'الأسعار';
      case 'orders':
        return 'الطلبات';
      default:
        return type;
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إعدادات المزامنة</h1>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración general */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">الإعدادات العامة</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="syncEnabled"
                      name="syncEnabled"
                      checked={settings.syncEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={submitting}
                    />
                    <label htmlFor="syncEnabled" className="mr-2 block text-sm text-gray-900">
                      تمكين المزامنة التلقائية
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnError"
                      name="notifyOnError"
                      checked={settings.notifyOnError}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={submitting}
                    />
                    <label htmlFor="notifyOnError" className="mr-2 block text-sm text-gray-900">
                      إرسال إشعارات عند حدوث أخطاء
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnSuccess"
                      name="notifyOnSuccess"
                      checked={settings.notifyOnSuccess}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={submitting}
                    />
                    <label htmlFor="notifyOnSuccess" className="mr-2 block text-sm text-gray-900">
                      إرسال إشعارات عند نجاح المزامنة
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني للإشعارات
                    </label>
                    <input
                      type="email"
                      id="notificationEmail"
                      name="notificationEmail"
                      value={settings.notificationEmail}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="logRetentionDays" className="block text-sm font-medium text-gray-700 mb-1">
                      فترة الاحتفاظ بالسجلات (أيام)
                    </label>
                    <input
                      type="number"
                      id="logRetentionDays"
                      name="logRetentionDays"
                      value={settings.logRetentionDays}
                      onChange={handleChange}
                      min="1"
                      max="90"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="maxConcurrentSyncs" className="block text-sm font-medium text-gray-700 mb-1">
                      الحد الأقصى للمزامنات المتزامنة
                    </label>
                    <input
                      type="number"
                      id="maxConcurrentSyncs"
                      name="maxConcurrentSyncs"
                      value={settings.maxConcurrentSyncs}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={submitting}
                  >
                    حفظ الإعدادات
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Tipos de sincronización */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">أنواع المزامنة</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="syncProducts"
                        name="syncProducts"
                        checked={settings.syncProducts}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={submitting}
                      />
                      <label htmlFor="syncProducts" className="mr-2 block text-sm font-medium text-gray-900">
                        مزامنة المنتجات
                      </label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTriggerSync('products')}
                      loading={triggeringSyncNow}
                      disabled={triggeringSyncNow || !settings.syncProducts}
                    >
                      مزامنة الآن
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    مزامنة بيانات المنتجات الأساسية مثل الاسم والوصف والصور وتفاصيل المنتج.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="syncInventory"
                        name="syncInventory"
                        checked={settings.syncInventory}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={submitting}
                      />
                      <label htmlFor="syncInventory" className="mr-2 block text-sm font-medium text-gray-900">
                        مزامنة المخزون
                      </label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTriggerSync('inventory')}
                      loading={triggeringSyncNow}
                      disabled={triggeringSyncNow || !settings.syncInventory}
                    >
                      مزامنة الآن
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    مزامنة مستويات المخزون بين المتاجر المختلفة.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="syncPrices"
                        name="syncPrices"
                        checked={settings.syncPrices}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={submitting}
                      />
                      <label htmlFor="syncPrices" className="mr-2 block text-sm font-medium text-gray-900">
                        مزامنة الأسعار
                      </label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTriggerSync('prices')}
                      loading={triggeringSyncNow}
                      disabled={triggeringSyncNow || !settings.syncPrices}
                    >
                      مزامنة الآن
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    مزامنة الأسعار والتخفيضات وحملات العروض الخاصة.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="syncOrders"
                        name="syncOrders"
                        checked={settings.syncOrders}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={submitting}
                      />
                      <label htmlFor="syncOrders" className="mr-2 block text-sm font-medium text-gray-900">
                        مزامنة الطلبات
                      </label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTriggerSync('orders')}
                      loading={triggeringSyncNow}
                      disabled={triggeringSyncNow || !settings.syncOrders}
                    >
                      مزامنة الآن
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    مزامنة الطلبات وحالات الطلبات وبيانات الشحن.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SyncSettings;