import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Select, Table, Spinner, Tag, Alert } from '../common';
import { useProduct } from '../../hooks/useProduct';
import { useStore } from '../../hooks/useStore';
import { useSync } from '../../hooks/useSync';

const ProductMapping = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getProduct, 
    loading: productLoading, 
    searchExternalProducts
  } = useProduct();
  const { stores, loading: storesLoading } = useStore();
  const { 
    syncProduct, 
    getProductMappings, 
    loading: syncLoading 
  } = useSync();
  
  const [product, setProduct] = useState(null);
  const [sourceStore, setSourceStore] = useState(null);
  const [targetStore, setTargetStore] = useState(null);
  const [externalProducts, setExternalProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mappings, setMappings] = useState([]);
  const [message, setMessage] = useState(null);
  
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData);
        setSourceStore(stores.find(store => store.id === productData.store_id) || null);
      } catch (error) {
        console.error('فشل في جلب بيانات المنتج:', error);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id, stores, getProduct]);
  
  useEffect(() => {
    const fetchMappings = async () => {
      if (product) {
        try {
          const mappingsData = await getProductMappings(product.id);
          setMappings(mappingsData);
        } catch (error) {
          console.error('فشل في جلب روابط المنتج:', error);
        }
      }
    };
    
    fetchMappings();
  }, [product, getProductMappings]);
  
  const handleTargetStoreChange = (e) => {
    const storeId = parseInt(e.target.value);
    const store = stores.find(s => s.id === storeId);
    
    setTargetStore(store);
    setExternalProducts([]);
  };
  
  const handleSearch = async () => {
    if (!targetStore) {
      setMessage({
        type: 'error',
        text: 'يرجى اختيار متجر هدف أولاً'
      });
      return;
    }
    
    setSearching(true);
    
    try {
      const results = await searchExternalProducts(
        targetStore.id, 
        product.title
      );
      
      setExternalProducts(results);
      
      if (results.length === 0) {
        setMessage({
          type: 'info',
          text: 'لم يتم العثور على منتجات مشابهة في المتجر المحدد'
        });
      } else {
        setMessage(null);
      }
    } catch (error) {
      console.error('فشل في البحث عن المنتجات:', error);
      setMessage({
        type: 'error',
        text: 'حدث خطأ أثناء البحث عن المنتجات'
      });
    } finally {
      setSearching(false);
    }
  };
  
  const handleCreateMapping = async (externalProductId) => {
    if (!targetStore || !product) {
      return;
    }
    
    try {
      await syncProduct(product.id, product.store_id, targetStore.id, externalProductId);
      
      setMessage({
        type: 'success',
        text: 'تم ربط المنتج بنجاح'
      });
      
      // تحديث روابط المنتج
      const updatedMappings = await getProductMappings(product.id);
      setMappings(updatedMappings);
    } catch (error) {
      console.error('فشل في ربط المنتج:', error);
      setMessage({
        type: 'error',
        text: 'حدث خطأ أثناء ربط المنتج'
      });
    }
  };
  
  const handleSyncProduct = async (targetStoreId) => {
    try {
      await syncProduct(product.id, product.store_id, targetStoreId);
      
      setMessage({
        type: 'success',
        text: 'تم بدء مزامنة المنتج بنجاح'
      });
    } catch (error) {
      console.error('فشل في مزامنة المنتج:', error);
      setMessage({
        type: 'error',
        text: 'حدث خطأ أثناء مزامنة المنتج'
      });
    }
  };
  
  if (productLoading || storesLoading || !product) {
    return (
      <Card title="ربط المنتج">
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }
  
  // تصفية المتاجر المتاحة (باستثناء المتجر الحالي)
  const availableStores = stores.filter(store => store.id !== product.store_id);
  
  return (
    <Card title={`ربط المنتج: ${product.title}`}>
      {message && (
        <div className="mb-4">
          <Alert type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">تفاصيل المصدر</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <dl className="grid grid-cols-2 gap-4">
            <dt className="text-gray-500">اسم المنتج:</dt>
            <dd>{product.title}</dd>
            
            <dt className="text-gray-500">المتجر المصدر:</dt>
            <dd>{sourceStore?.name || 'غير معروف'}</dd>
            
            <dt className="text-gray-500">نوع المتجر:</dt>
            <dd className="capitalize">{sourceStore?.type || 'غير معروف'}</dd>
            
            <dt className="text-gray-500">رمز المنتج:</dt>
            <dd>{product.sku || 'غير محدد'}</dd>
            
            <dt className="text-gray-500">عدد المتغيرات:</dt>
            <dd>{product.variants?.length || 0}</dd>
          </dl>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">روابط المنتج الحالية</h2>
        
        {mappings.length > 0 ? (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>المتجر</Table.HeaderCell>
                <Table.HeaderCell>نوع المتجر</Table.HeaderCell>
                <Table.HeaderCell>المعرف الخارجي</Table.HeaderCell>
                <Table.HeaderCell>آخر مزامنة</Table.HeaderCell>
                <Table.HeaderCell>الإجراءات</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {mappings.map(mapping => {
                const mappedStore = stores.find(s => s.id === mapping.target_store_id);
                
                return (
                  <Table.Row key={mapping.id}>
                    <Table.Cell>{mappedStore?.name || 'غير معروف'}</Table.Cell>
                    <Table.Cell className="capitalize">{mappedStore?.type || 'غير معروف'}</Table.Cell>
                    <Table.Cell>{mapping.target_product_id}</Table.Cell>
                    <Table.Cell>{mapping.last_sync_date || 'لم تتم مزامنة'}</Table.Cell>
                    <Table.Cell>
                      <Button 
                        size="sm" 
                        color="primary"
                        loading={syncLoading}
                        onClick={() => handleSyncProduct(mapping.target_store_id)}
                      >
                        مزامنة
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p>لم يتم ربط هذا المنتج بأي متجر آخر بعد</p>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">ربط المنتج بمتجر آخر</h2>
        
        {availableStores.length > 0 ? (
          <div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full md:w-1/3">
                <Select 
                  value={targetStore?.id || ''} 
                  onChange={handleTargetStoreChange}
                  placeholder="اختر متجر الهدف"
                  className="w-full"
                >
                  <option value="" disabled>اختر متجر الهدف</option>
                  {availableStores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <Button 
                  color="primary"
                  onClick={handleSearch}
                  loading={searching}
                  disabled={!targetStore}
                >
                  بحث عن منتجات مشابهة
                </Button>
              </div>
              
              <div>
                <Button
                  color="success"
                  onClick={() => handleSyncProduct(targetStore?.id)}
                  disabled={!targetStore}
                  loading={syncLoading}
                >
                  إنشاء منتج جديد في المتجر الهدف
                </Button>
              </div>
            </div>
            
            {externalProducts.length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-2">نتائج البحث</h3>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>اسم المنتج</Table.HeaderCell>
                      <Table.HeaderCell>رمز المنتج</Table.HeaderCell>
                      <Table.HeaderCell>عدد المتغيرات</Table.HeaderCell>
                      <Table.HeaderCell>الحالة</Table.HeaderCell>
                      <Table.HeaderCell>الإجراءات</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {externalProducts.map(externalProduct => (
                      <Table.Row key={externalProduct.id}>
                        <Table.Cell>{externalProduct.title}</Table.Cell>
                        <Table.Cell>{externalProduct.sku || '-'}</Table.Cell>
                        <Table.Cell>{externalProduct.variants_count || 0}</Table.Cell>
                        <Table.Cell>
                          <Tag color={externalProduct.status === 'active' ? 'green' : 'gray'}>
                            {externalProduct.status}
                          </Tag>
                        </Table.Cell>
                        <Table.Cell>
                          <Button 
                            size="sm" 
                            color="primary"
                            onClick={() => handleCreateMapping(externalProduct.id)}
                            loading={syncLoading}
                          >
                            ربط المنتج
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p>لا توجد متاجر أخرى متاحة للربط</p>
            <div className="mt-2">
              <Button 
                color="secondary"
                onClick={() => navigate('/stores/add')}
              >
                إضافة متجر جديد
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          color="secondary"
          onClick={() => navigate(`/products/${id}`)}
        >
          العودة إلى تفاصيل المنتج
        </Button>
      </div>
    </Card>
  );
};

export default ProductMapping;