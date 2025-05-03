import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import ProductMapping from '../../components/products/ProductMapping';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { useProduct } from '../../hooks/useProduct';
import { useStore } from '../../hooks/useStore';

const ProductMappingPage = () => {
  const [stores, setStores] = useState([]);
  const [sourceStoreId, setSourceStoreId] = useState('');
  const [targetStoreId, setTargetStoreId] = useState('');
  const [sourceProducts, setSourceProducts] = useState([]);
  const [targetProducts, setTargetProducts] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { getStores } = useStore();
  const { getProducts, getProductMappings, saveProductMappings } = useProduct();

  // Cargar tiendas
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const storesData = await getStores();
        setStores(storesData.data || storesData || []);
      } catch (err) {
        setError('فشل تحميل قائمة المتاجر');
        console.error('Stores fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [getStores]);

  // Cargar productos cuando se seleccionan las tiendas
  useEffect(() => {
    const fetchProducts = async () => {
      if (!sourceStoreId || !targetStoreId) return;
      
      try {
        setProductsLoading(true);
        setError('');
        
        // Obtener productos de ambas tiendas en paralelo
        const [sourceProductsData, targetProductsData, existingMappings] = await Promise.all([
          getProducts({ storeId: sourceStoreId, limit: 100 }),
          getProducts({ storeId: targetStoreId, limit: 100 }),
          getProductMappings(sourceStoreId, targetStoreId)
        ]);
        
        setSourceProducts(sourceProductsData.data || []);
        setTargetProducts(targetProductsData.data || []);
        setMappings(existingMappings || []);
      } catch (err) {
        setError('فشل تحميل بيانات المنتجات');
        console.error('Products fetch error:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    if (sourceStoreId && targetStoreId) {
      fetchProducts();
    }
  }, [sourceStoreId, targetStoreId, getProducts, getProductMappings]);

  const handleStoreChange = (type, storeId) => {
    if (type === 'source') {
      setSourceStoreId(storeId);
    } else {
      setTargetStoreId(storeId);
    }
    
    // Resetear los mapeos si cualquiera de las tiendas cambia
    setMappings([]);
  };

  const handleMappingChange = (sourceProductId, targetProductId) => {
    // Actualizar o añadir un nuevo mapeo
    setMappings(prevMappings => {
      // Verificar si ya existe un mapeo para este producto de origen
      const existingIndex = prevMappings.findIndex(
        mapping => mapping.sourceProductId === sourceProductId
      );
      
      if (existingIndex !== -1) {
        // Actualizar el mapeo existente
        const updatedMappings = [...prevMappings];
        
        if (targetProductId) {
          updatedMappings[existingIndex] = {
            ...updatedMappings[existingIndex],
            targetProductId
          };
        } else {
          // Si targetProductId es null, eliminar el mapeo
          updatedMappings.splice(existingIndex, 1);
        }
        
        return updatedMappings;
      } else if (targetProductId) {
        // Añadir un nuevo mapeo
        return [
          ...prevMappings,
          {
            sourceStoreId,
            targetStoreId,
            sourceProductId,
            targetProductId
          }
        ];
      }
      
      return prevMappings;
    });
  };

  const handleSaveMappings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await saveProductMappings(sourceStoreId, targetStoreId, mappings);
      setSuccess('تم حفظ ربط المنتجات بنجاح');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ ربط المنتجات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">ربط المنتجات بين المتاجر</h1>
          <p className="text-gray-600 mt-2">
            قم بربط المنتجات بين متجرين لتمكين المزامنة التلقائية للمخزون والأسعار.
          </p>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : stores.length < 2 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              يجب إضافة متجرين على الأقل لتمكين ربط المنتجات.
            </p>
            <Link to="/stores/add" className="btn btn-primary">
              إضافة متجر
            </Link>
          </div>
        ) : (
          <>
            {/* Selección de tiendas */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المتجر المصدر
                  </label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={sourceStoreId}
                    onChange={(e) => handleStoreChange('source', e.target.value)}
                    disabled={productsLoading || saving}
                  >
                    <option value="">اختر المتجر المصدر</option>
                    {stores.map((store) => (
                      <option 
                        key={store.id} 
                        value={store.id}
                        disabled={store.id === targetStoreId}
                      >
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المتجر الهدف
                  </label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={targetStoreId}
                    onChange={(e) => handleStoreChange('target', e.target.value)}
                    disabled={productsLoading || saving}
                  >
                    <option value="">اختر المتجر الهدف</option>
                    {stores.map((store) => (
                      <option 
                        key={store.id} 
                        value={store.id}
                        disabled={store.id === sourceStoreId}
                      >
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Mapeo de productos */}
            {sourceStoreId && targetStoreId ? (
              productsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader size="lg" />
                </div>
              ) : (
                <>
                  <ProductMapping
                    sourceProducts={sourceProducts}
                    targetProducts={targetProducts}
                    mappings={mappings}
                    onChange={handleMappingChange}
                    disabled={saving}
                  />
                  
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleSaveMappings}
                      loading={saving}
                      disabled={saving}
                    >
                      حفظ ربط المنتجات
                    </Button>
                  </div>
                </>
              )
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">
                  يرجى اختيار المتجر المصدر والمتجر الهدف لبدء ربط المنتجات.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProductMappingPage;