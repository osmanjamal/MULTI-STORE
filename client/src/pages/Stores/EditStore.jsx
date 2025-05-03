import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import StoreForm from '../../components/stores/StoreForm';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { useStore } from '../../hooks/useStore';

const EditStore = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { getStore, updateStore } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const storeData = await getStore(storeId);
        setStore(storeData);
      } catch (err) {
        setError('فشل تحميل بيانات المتجر');
        console.error('Store fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId, getStore]);

  const handleUpdateStore = async (storeData) => {
    try {
      setError('');
      setUpdating(true);
      await updateStore(storeId, storeData);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث المتجر. يرجى المحاولة مرة أخرى.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  if (!store && !loading) {
    return (
      <Layout>
        <div className="p-6">
          <Alert type="error" message="المتجر غير موجود" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">تعديل المتجر</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <StoreForm
            initialData={store}
            onSubmit={handleUpdateStore}
            loading={updating}
            isEdit={true}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditStore;