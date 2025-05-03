import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { useInventory } from '../../hooks/useInventory';
import { useStore } from '../../hooks/useStore';
import { useProduct } from '../../hooks/useProduct';

const AdjustStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId');
  const storeId = queryParams.get('storeId');

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    productId: productId || '',
    storeId: storeId || '',
    quantity: '',
    adjustmentType: 'set',
    reason: '',
  });
  
  const { adjustStock, getInventoryItem } = useInventory();
  const { getStores } = useStore();
  const { getProducts } = useProduct();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener tiendas y productos para los selectores
        const [storesData, productsData] = await Promise.all([
          getStores(),
          getProducts({ limit: 100 }),
        ]);
        
        setStores(storesData.data || storesData || []);
        setProducts(productsData.data || productsData || []);
        
        // Si se proporcionaron productId y storeId, obtener la cantidad actual
        if (productId && storeId) {
          const inventoryItem = await getInventoryItem(productId, storeId);
          if (inventoryItem) {
            setFormData(prev => ({
              ...prev,
              quantity: inventoryItem.quantity.toString()
            }));
          }
        }
      } catch (err) {
        setError('فشل تحميل البيانات اللازمة');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getStores, getProducts, getInventoryItem, productId, storeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.storeId || !formData.quantity) {
      return setError('يرجى ملء جميع الحقول المطلوبة');
    }

    try {
      setError('');
      setSuccess('');
      setSubmitting(true);
      
      await adjustStock({
        productId: formData.productId,
        storeId: formData.storeId,
        quantity: parseInt(formData.quantity),
        adjustmentType: formData.adjustmentType,
        reason: formData.reason,
      });
      
      setSuccess('تم تعديل المخزون بنجاح');
      
      // Resetear el formulario si no vino de un enlace directo
      if (!productId || !storeId) {
        setFormData({
          productId: '',
          storeId: '',
          quantity: '',
          adjustmentType: 'set',
          reason: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تعديل المخزون. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">تعديل المخزون</h1>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">
                    المتجر <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="storeId"
                    name="storeId"
                    value={formData.storeId}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    disabled={submitting || (productId && storeId)}
                  >
                    <option value="">اختر متجرًا</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                    المنتج <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    disabled={submitting || (productId && storeId)}
                  >
                    <option value="">اختر منتجًا</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                <label htmlFor="adjustmentType" className="block text-sm font-medium text-gray-700 mb-1">
                    نوع التعديل <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="adjustmentType"
                    name="adjustmentType"
                    value={formData.adjustmentType}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    disabled={submitting}
                  >
                    <option value="set">تعيين الكمية</option>
                    <option value="add">إضافة للمخزون</option>
                    <option value="subtract">خصم من المخزون</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    الكمية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    سبب التعديل
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={submitting}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/inventory')}
                  disabled={submitting}
                >
                  إلغاء
                </Button>
                
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                >
                  حفظ التعديل
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdjustStock;