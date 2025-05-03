import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import StoreForm from '../../components/stores/StoreForm';
import { Alert } from '../../components/common/Alert';
import { useStore } from '../../hooks/useStore';

const AddStore = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addStore } = useStore();
  const navigate = useNavigate();

  const handleAddStore = async (storeData) => {
    try {
      setError('');
      setLoading(true);
      await addStore(storeData);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إضافة المتجر. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">إضافة متجر جديد</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <StoreForm onSubmit={handleAddStore} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default AddStore;