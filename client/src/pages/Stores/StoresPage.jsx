import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import StoreList from '../../components/stores/StoreList';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { useStore } from '../../hooks/useStore';

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const { getStores, deleteStore } = useStore();

  const fetchStores = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await getStores({
        page,
        limit: pagination.limit,
      });
      
      setStores(response.data || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      });
    } catch (err) {
      setError('فشل تحميل قائمة المتاجر');
      console.error('Stores fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handlePageChange = (page) => {
    fetchStores(page);
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المتجر؟')) {
      return;
    }
    
    try {
      await deleteStore(storeId);
      fetchStores(pagination.page);
    } catch (err) {
      setError('فشل حذف المتجر');
      console.error('Store delete error:', err);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">المتاجر</h1>
          <Link to="/stores/add">
            <Button>
              <span className="mr-2">+</span>
              إضافة متجر جديد
            </Button>
          </Link>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">لا توجد متاجر متصلة حالياً</p>
            <Link to="/stores/add">
              <Button>إضافة متجر جديد</Button>
            </Link>
          </div>
        ) : (
          <>
            <StoreList
              stores={stores}
              onDelete={handleDeleteStore}
            />
            
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                /><Pagination
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

export default StoresPage;