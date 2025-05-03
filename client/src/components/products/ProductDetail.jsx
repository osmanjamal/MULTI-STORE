import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Tab, Table, Spinner, Tag } from '../common';
import { useProduct } from '../../hooks/useProduct';
import { useInventory } from '../../hooks/useInventory';
import { formatDate, formatPrice } from '../../utils/formatters';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading: productLoading, getProduct, deleteProduct } = useProduct();
  const { loading: inventoryLoading, getInventoryByProduct } = useInventory();
  
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData);
        
        // جلب معلومات المخزون
        const inventoryData = await getInventoryByProduct(productData.id, productData.store_id);
        setInventory(inventoryData);
      } catch (error) {
        console.error('فشل في جلب بيانات المنتج:', error);
      }
    };
    
    fetchProductData();
  }, [id, getProduct, getInventoryByProduct]);
  
  const handleDelete = async () => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${product.title}"؟`)) {
      await deleteProduct(id);
      navigate('/products');
    }
  };
  
  if (productLoading || !product) {
    return (
      <Card title="تفاصيل المنتج">
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }
  
  const getStatusTag = (status) => {
    switch(status) {
      case 'active':
        return <Tag color="green">فعّال</Tag>;
      case 'draft':
        return <Tag color="gray">مسودة</Tag>;
      case 'archived':
        return <Tag color="orange">مؤرشف</Tag>;
      default:
        return <Tag color="blue">{status}</Tag>;
    }
  };
  
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-500">رمز المنتج: {product.sku || 'غير محدد'}</p>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/products/mapping/${product.id}`}>
            <Button color="info">ربط المنتج</Button>
          </Link>
          <Link to={`/products/edit/${product.id}`}>
            <Button color="secondary">تعديل</Button>
          </Link>
          <Button color="danger" onClick={handleDelete}>حذف</Button>
        </div>
      </div>
      
      <div className="mb-6">
        <Tab
          tabs={[
            { id: 'details', label: 'تفاصيل المنتج' },
            { id: 'variants', label: 'المتغيرات' },
            { id: 'inventory', label: 'المخزون' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {product.images && product.images.length > 0 && (
                <img 
                  src={product.images[0].src} 
                  alt={product.title} 
                  className="w-full h-64 object-contain border rounded-lg"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">معلومات أساسية</h3>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="text-gray-500">الحالة:</dt>
                  <dd>{getStatusTag(product.status)}</dd>
                  
                  <dt className="text-gray-500">المتجر:</dt>
                  <dd>{product.store_name}</dd>
                  
                  <dt className="text-gray-500">المعرف الخارجي:</dt>
                  <dd>{product.external_id || 'غير محدد'}</dd>
                  
                  <dt className="text-gray-500">تاريخ الإنشاء:</dt>
                  <dd>{formatDate(product.created_at)}</dd>
                  
                  <dt className="text-gray-500">آخر تحديث:</dt>
                  <dd>{formatDate(product.updated_at)}</dd>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">تفاصيل إضافية</h3>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="text-gray-500">المورد:</dt>
                  <dd>{product.vendor || 'غير محدد'}</dd>
                  
                  <dt className="text-gray-500">نوع المنتج:</dt>
                  <dd>{product.product_type || 'غير محدد'}</dd>
                  
                  <dt className="text-gray-500">الباركود:</dt>
                  <dd>{product.barcode || 'غير محدد'}</dd>
                  
                  <dt className="text-gray-500">العلامات:</dt>
                  <dd>
                    {Array.isArray(product.tags) && product.tags.length > 0 
                      ? product.tags.join(', ') 
                      : 'غير محدد'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">الوصف</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              {product.description 
                ? <div dangerouslySetInnerHTML={{ __html: product.description }} /> 
                : <p className="text-gray-500">لا يوجد وصف</p>
              }
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'variants' && (
        <div>
          {product.variants && product.variants.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>المتغير</Table.HeaderCell>
                  <Table.HeaderCell>رمز المنتج</Table.HeaderCell>
                  <Table.HeaderCell>الخيارات</Table.HeaderCell>
                  <Table.HeaderCell>السعر</Table.HeaderCell>
                  <Table.HeaderCell>سعر المقارنة</Table.HeaderCell>
                  <Table.HeaderCell>الباركود</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {product.variants.map(variant => (
                  <Table.Row key={variant.id}>
                    <Table.Cell>{variant.title}</Table.Cell>
                    <Table.Cell>{variant.sku || '-'}</Table.Cell>
                    <Table.Cell>
                      {variant.options && Object.entries(variant.options)
                        .filter(([_, value]) => value)
                        .map(([key, value]) => `${value}`)
                        .join(' / ') || '-'
                      }
                    </Table.Cell>
                    <Table.Cell>{formatPrice(variant.price, product.currency || 'USD')}</Table.Cell>
                    <Table.Cell>
                      {variant.compare_at_price 
                        ? formatPrice(variant.compare_at_price, product.currency || 'USD')
                        : '-'
                      }
                    </Table.Cell>
                    <Table.Cell>{variant.barcode || '-'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p>لا توجد متغيرات لهذا المنتج</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'inventory' && (
        <div>
          {inventoryLoading ? (
            <div className="flex justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : inventory && inventory.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>المتغير</Table.HeaderCell>
                  <Table.HeaderCell>رمز المنتج</Table.HeaderCell>
                  <Table.HeaderCell>الموقع</Table.HeaderCell>
                  <Table.HeaderCell>الكمية</Table.HeaderCell>
                  <Table.HeaderCell>آخر تحديث</Table.HeaderCell>
                  <Table.HeaderCell>الإجراءات</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {inventory.map(item => (
                  <Table.Row key={item.id}>
                    <Table.Cell>{item.variant_title || 'الافتراضي'}</Table.Cell>
                    <Table.Cell>{item.sku || '-'}</Table.Cell>
                    <Table.Cell>{item.location_id || 'الافتراضي'}</Table.Cell>
                    <Table.Cell>{item.quantity}</Table.Cell>
                    <Table.Cell>{formatDate(item.updated_at)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link to={`/inventory/${item.id}`}>
                          <Button size="sm" color="secondary">تعديل</Button>
                        </Link>
                        <Link to={`/inventory/adjust/${item.id}`}>
                          <Button size="sm" color="info">تعديل المخزون</Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p>لا يوجد مخزون لهذا المنتج</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProductDetail;