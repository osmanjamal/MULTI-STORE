import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ProductForm from '../../components/products/ProductForm';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { useProduct } from '../../hooks/useProduct';
import { useStore } from '../../hooks/useStore';

const AddProduct = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { addProduct } = useProduct();
  const { getStores } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const storesData = await getStores();
        setStores(storesData.data || storesData || []);
        
        if ((storesData.data || storesData || []).length === 0) {
          setError('يجب إضافة متجر واحد على الأقل قبل إضافة المنتجات');
        }
      } catch (err) {
        setError('فشل تحميل قائمة المتاجر');
        console.error('Stores fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [getStores]);

  const handleAddProduct = async (productData) => {
    try {
      setError('');
      setSubmitting(true);
      await addProduct(productData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إضافة المنتج. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إضافة منتج جديد</h1>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">يجب إضافة متجر واحد على الأقل قبل إضافة المنتجات</p>
            <Link to="/stores/add" className="btn btn-primary">
              إضافة متجر
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ProductForm
              stores={stores}
              onSubmit={handleAddProduct}
              loading={submitting}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddProduct;