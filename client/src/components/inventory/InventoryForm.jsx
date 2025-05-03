import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useInventory } from '../../hooks/useInventory';
import { useProduct } from '../../hooks/useProduct';
import Button from '../common/Button';
import Alert from '../common/Alert';

const InventoryForm = ({ inventoryId, storeId, onSave, onCancel }) => {
  const { getInventory, createInventory, updateInventory } = useInventory();
  const { getProducts } = useProduct();
  
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    locationId: '1', // القيمة الافتراضية
    quantity: 0,
    sku: '',
    inventoryItemId: '',
    externalId: '',
    metadata: {}
  });
  
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // تحميل المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ storeId });
        setProducts(response.products);
      } catch (err) {
        setError('فشل تحميل المنتجات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (storeId) {
      fetchProducts();
    }
  }, [storeId, getProducts]);
  
  // تحميل المخزون في حالة التعديل
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const inventory = await getInventory(inventoryId);
        
        setFormData({
          productId: inventory.product_id,
          variantId: inventory.variant_id || '',
          locationId: inventory.location_id || '1',
          quantity: inventory.quantity,
          sku: inventory.sku || '',
          inventoryItemId: inventory.inventory_item_id || '',
          externalId: inventory.external_id || '',
          metadata: inventory.metadata || {}
        });
        
        // تحميل متغيرات المنتج
        if (inventory.product_id) {
          const productIndex = products.findIndex(p => p.id === inventory.product_id);
          if (productIndex !== -1) {
            const product = products[productIndex];
            if (product.variants) {
              setVariants(product.variants);
            }
          }
        }
      } catch (err) {
        setError('فشل تحميل بيانات المخزون');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (inventoryId) {
      fetchInventory();
    }
  }, [inventoryId, getInventory, products]);
  
  // تحميل متغيرات المنتج عند تغيير المنتج
  useEffect(() => {
    const loadVariants = async () => {
      const productId = formData.productId;
      if (!productId) {
        setVariants([]);
        return;
      }
      
      const product = products.find(p => p.id === parseInt(productId));
      if (product && product.variants) {
        setVariants(product.variants);
        
        // إذا كان هناك متغير واحد فقط، اختره تلقائيًا
        if (product.variants.length === 1) {
          setFormData(prevData => ({
            ...prevData,
            variantId: product.variants[0].id,
            sku: product.variants[0].sku || prevData.sku
          }));
        } else {
          // إعادة تعيين المتغير إذا تم تغيير المنتج
          setFormData(prevData => ({
            ...prevData,
            variantId: '',
            sku: product.sku || ''
          }));
        }
      } else {
        setVariants([]);
      }
    };
    
    loadVariants();
  }, [formData.productId, products]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
    
    // تحديث رقم SKU عند تغيير المتغير
    if (name === 'variantId' && value) {
      const variant = variants.find(v => v.id === parseInt(value));
      if (variant && variant.sku) {
        setFormData(prevData => ({
          ...prevData,
          sku: variant.sku
        }));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaveLoading(true);
      setError(null);
      setSuccess(null);
      
      const inventoryData = {
        storeId: parseInt(storeId),
        productId: parseInt(formData.productId),
        variantId: formData.variantId ? parseInt(formData.variantId) : null,
        locationId: parseInt(formData.locationId),
        quantity: formData.quantity,
        sku: formData.sku,
        inventoryItemId: formData.inventoryItemId,
        externalId: formData.externalId,
        metadata: formData.metadata
      };
      
      if (inventoryId) {
        await updateInventory(inventoryId, inventoryData);
        setSuccess('تم تحديث المخزون بنجاح');
      } else {
        await createInventory(inventoryData);
        setSuccess('تم إضافة المخزون بنجاح');
      }
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ المخزون');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };
  
  if (loading && inventoryId) {
    return (
      <div className="flex justify-center p-4">
        <div className="loader"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg">
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="mb-4">
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
              المنتج <span className="text-red-500">*</span>
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={loading || inventoryId}
            >
              <option value="">اختر المنتج</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="variantId" className="block text-sm font-medium text-gray-700 mb-1">
              متغير المنتج
            </label>
            <select
              id="variantId"
              name="variantId"
              value={formData.variantId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={loading || !formData.productId || variants.length === 0 || inventoryId}
            >
              <option value="">اختر المتغير</option>
              {variants.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
              رمز المنتج (SKU)
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">
              الموقع
            </label>
            <input
              type="text"
              id="locationId"
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="inventoryItemId" className="block text-sm font-medium text-gray-700 mb-1">
              معرف عنصر المخزون (Shopify)
            </label>
            <input
              type="text"
              id="inventoryItemId"
              name="inventoryItemId"
              value={formData.inventoryItemId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="externalId" className="block text-sm font-medium text-gray-700 mb-1">
              المعرف الخارجي
            </label>
            <input
              type="text"
              id="externalId"
              name="externalId"
              value={formData.externalId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-4 space-x-reverse">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              إلغاء
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={saveLoading}
          >
            {inventoryId ? 'تحديث المخزون' : 'إضافة المخزون'}
          </Button>
        </div>
      </form>
    </div>
  );
};

InventoryForm.propTypes = {
  inventoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSave: PropTypes.func,
  onCancel: PropTypes.func
};

export default InventoryForm;