import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useSync } from '../../hooks/useSync';
import { useStore } from '../../hooks/useStore';

const SyncRules = () => {
  const [syncRules, setSyncRules] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    sourceStoreId: '',
    targetStoreId: '',
    syncType: 'inventory',
    mode: 'one-way',
    status: 'active',
    interval: 60, // en minutos
    filters: {},
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  
  const { getSyncRules, createSyncRule, updateSyncRule, deleteSyncRule } = useSync();
  const { getStores } = useStore();

  const fetchSyncRules = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await getSyncRules({
        page,
        limit: pagination.limit,
      });
      
      setSyncRules(response.data || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      });
    } catch (err) {
      setError('فشل تحميل قواعد المزامنة');
      console.error('Sync rules fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Obtener tiendas para el formulario
        const storesData = await getStores();
        setStores(storesData.data || storesData || []);
        
        // Obtener reglas de sincronización
        await fetchSyncRules();
      } catch (err) {
        setError('فشل تحميل البيانات');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [getStores]);

  const handlePageChange = (page) => {
    fetchSyncRules(page);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.sourceStoreId) {
      errors.sourceStoreId = 'يرجى اختيار المتجر المصدر';
    }
    
    if (!formData.targetStoreId) {
      errors.targetStoreId = 'يرجى اختيار المتجر الهدف';
    }
    
    if (formData.sourceStoreId === formData.targetStoreId) {
      errors.targetStoreId = 'يجب أن يكون المتجر الهدف مختلفًا عن المتجر المصدر';
    }
    
    if (!formData.syncType) {
      errors.syncType = 'يرجى اختيار نوع المزامنة';
    }
    
    if (!formData.interval || formData.interval < 5) {
      errors.interval = 'يجب أن يكون الفاصل الزمني 5 دقائق على الأقل';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      if (editingRuleId) {
        await updateSyncRule(editingRuleId, formData);
        setSuccess('تم تحديث قاعدة المزامنة بنجاح');
      } else {
        await createSyncRule(formData);
        setSuccess('تم إنشاء قاعدة المزامنة بنجاح');
      }
      
      // Actualizar la lista y cerrar el modal
      await fetchSyncRules(pagination.page);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ قاعدة المزامنة. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف قاعدة المزامنة هذه؟')) {
      return;
    }
    
    try {
      await deleteSyncRule(ruleId);
      setSuccess('تم حذف قاعدة المزامنة بنجاح');
      await fetchSyncRules(pagination.page);
    } catch (err) {
      setError('فشل حذف قاعدة المزامنة');
      console.error('Sync rule delete error:', err);
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      sourceStoreId: rule.sourceStoreId,
      targetStoreId: rule.targetStoreId,
      syncType: rule.syncType,
      mode: rule.mode,
      status: rule.status,
      interval: rule.interval,
      filters: rule.filters || {},
    });
    setEditingRuleId(rule.id);
    setShowFormModal(true);
  };

  const resetForm = () => {
    setFormData({
      sourceStoreId: '',
      targetStoreId: '',
      syncType: 'inventory',
      mode: 'one-way',
      status: 'active',
      interval: 60,
      filters: {},
    });
    setFormErrors({});
    setEditingRuleId(null);
    setShowFormModal(false);
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

  const getModeName = (mode) => {
    switch (mode) {
      case 'one-way':
        return 'أحادي الاتجاه';
      case 'two-way':
        return 'ثنائي الاتجاه';
      default:
        return mode;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            نشط
          </span>
        );
      case 'paused':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            متوقف مؤقتًا
          </span>
        );
      case 'error':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            خطأ
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">قواعد المزامنة</h1>
          <Button onClick={() => setShowFormModal(true)}>
            <span className="mr-2">+</span>
            إضافة قاعدة مزامنة
          </Button>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : syncRules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">لا توجد قواعد مزامنة حالية</p>
            <Button onClick={() => setShowFormModal(true)}>
              إضافة قاعدة مزامنة
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المتجر المصدر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المتجر الهدف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع المزامنة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوضع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الفاصل الزمني (دقائق)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {syncRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.sourceStore?.name || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.targetStore?.name || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getSyncTypeName(rule.syncType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getModeName(rule.mode)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.interval}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(rule.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-blue-600 hover:text-blue-900 ml-4"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de formulario */}
      <Modal
        isOpen={showFormModal}
        onClose={resetForm}
        title={editingRuleId ? 'تعديل قاعدة المزامنة' : 'إضافة قاعدة مزامنة جديدة'}
      >
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="sourceStoreId" className="block text-sm font-medium text-gray-700 mb-1">
                  المتجر المصدر <span className="text-red-500">*</span>
                </label>
                <select
                  id="sourceStoreId"
                  name="sourceStoreId"
                  value={formData.sourceStoreId}
                  onChange={handleInputChange}
                  className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                    formErrors.sourceStoreId ? 'border-red-500' : ''
                  }`}
                  disabled={submitting}
                >
                  <option value="">اختر المتجر المصدر</option>
                  {stores.map((store) => (
                    <option 
                      key={store.id} 
                      value={store.id}
                      disabled={store.id === formData.targetStoreId}
                    >
                      {store.name}
                    </option>
                  ))}
                </select>
                {formErrors.sourceStoreId && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.sourceStoreId}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="targetStoreId" className="block text-sm font-medium text-gray-700 mb-1">
                  المتجر الهدف <span className="text-red-500">*</span>
                </label>
                <select
                  id="targetStoreId"
                  name="targetStoreId"
                  value={formData.targetStoreId}
                  onChange={handleInputChange}
                  className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                    formErrors.targetStoreId ? 'border-red-500' : ''
                  }`}
                  disabled={submitting}
                >
                  <option value="">اختر المتجر الهدف</option>
                  {stores.map((store) => (
                    <option 
                      key={store.id} 
                      value={store.id}
                      disabled={store.id === formData.sourceStoreId}
                    >
                      {store.name}
                    </option>
                  ))}
                </select>
                {formErrors.targetStoreId && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.targetStoreId}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="syncType" className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المزامنة <span className="text-red-500">*</span>
                </label>
                <select
                  id="syncType"
                  name="syncType"
                  value={formData.syncType}
                  onChange={handleInputChange}
                  className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                    formErrors.syncType ? 'border-red-500' : ''
                  }`}
                  disabled={submitting}
                >
                  <option value="inventory">المخزون</option>
                  <option value="products">المنتجات</option>
                  <option value="prices">الأسعار</option>
                  <option value="orders">الطلبات</option>
                </select>
                {formErrors.syncType && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.syncType}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                  وضع المزامنة
                </label>
                <select
                  id="mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={submitting}
                >
                  <option value="one-way">أحادي الاتجاه (المصدر → الهدف)</option>
                  <option value="two-way">ثنائي الاتجاه (المصدر ↔ الهدف)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                  الفاصل الزمني (دقائق) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="interval"
                  name="interval"
                  value={formData.interval}
                  onChange={handleInputChange}
                  min="5"
                  className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                    formErrors.interval ? 'border-red-500' : ''
                  }`}
                  disabled={submitting}
                />
                {formErrors.interval && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.interval}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={submitting}
                >
                  <option value="active">نشط</option>
                  <option value="paused">متوقف مؤقتًا</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={submitting}
              >
                إلغاء
              </Button>
              
              <Button
                type="submit"
                loading={submitting}
                disabled={submitting}
              >
                {editingRuleId ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </Layout>
  );
};

export default SyncRules;