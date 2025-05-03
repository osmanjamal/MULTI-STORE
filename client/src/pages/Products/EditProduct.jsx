import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ProductForm from '../../components/products/ProductForm';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { useProduct } from '../../hooks/useProduct';
import { useStore } from '../../hooks/useStore';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { getProduct, updateProduct } = useProduct();
  const { getStores } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener el producto y las tiendas en paralelo
        const [productData, storesData] = await Promise.all([
          getProduct(productId),
          getStores()
        ]);
        
        setProduct(productData);
        setStores(storesData.data || storesData || []);
      } catch (err) {
        setError('فشل تحميل بيانات المنتج');
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, getProduct, getStores]);

  const handleUpdateProduct = async (productData) => {
    try {
      setError('');
      setSubmitting(true);
      await updateProduct(productId, productData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث المنتج. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
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

  if (!product && !loading) {
    return (
      <Layout>
        <div className="p-6">
          <Alert type="error" message="المنتج غير موجود" />
          <div className="mt-4">
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              العودة إلى قائمة المنتجات
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">تعديل المنتج</h1>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <ProductForm
            initialData={product}
            stores={stores}
            onSubmit={handleUpdateProduct}
            loading={submitting}
            isEdit={true}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditProduct;