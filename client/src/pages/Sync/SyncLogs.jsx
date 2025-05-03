import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { useSync } from '../../hooks/useSync';
import { useStore } from '../../hooks/useStore';

const SyncLogs = () => {
  const [syncLogs, setSyncLogs] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    storeId: '',
    syncType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  const { getSyncLogs } = useSync();
  const { getStores } = useStore();

  const fetchSyncLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getSyncLogs({
        page,
        limit: pagination.limit,
        storeId: filters.storeId || undefined,
        syncType: filters.syncType || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      
      setSyncLogs(response.data || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      });
    } catch (err) {
      setError('فشل تحميل سجلات المزامنة');
      console.error('Sync logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Obtener tiendas para el filtro
        const storesData = await getStores();
        setStores(storesData.data || storesData || []);
        
        // Obtener registros de sincronización
        await fetchSyncLogs();
      } catch (err) {
        setError('فشل تحميل البيانات');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [getStores]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    fetchSyncLogs(1);
  };

  const handlePageChange = (page) => {
    fetchSyncLogs(page);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            ناجح
          </span>
        );
      case 'error':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            خطأ
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            تحذير
          </span>
        );
      case 'pending':
        return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            قيد التنفيذ
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">سجلات المزامنة</h1>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المتجر</label>
              <select
                name="storeId"
                value={filters.storeId}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">جميع المتاجر</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع المزامنة</label>
              <select
                name="syncType"
                value={filters.syncType}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">جميع الأنواع</option>
                <option value="inventory">المخزون</option>
                <option value="products">المنتجات</option>
                <option value="prices">الأسعار</option>
                <option value="orders">الطلبات</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">جميع الحالات</option>
                <option value="success">ناجح</option>
                <option value="error">خطأ</option>
                <option value="warning">تحذير</option>
                <option value="pending">قيد التنفيذ</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              تطبيق الفلترة
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : syncLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">لا توجد سجلات مزامنة مطابقة للمعايير</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المتجر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع المزامنة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الرسالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {syncLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.store?.name || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getSyncTypeName(log.syncType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-md truncate">{log.message}</div>
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
    </Layout>
  );
};

export default SyncLogs;