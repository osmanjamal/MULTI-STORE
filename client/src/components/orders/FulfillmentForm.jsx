import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOrder } from '../../hooks/useOrder';
import Button from '../common/Button';
import Alert from '../common/Alert';

const FulfillmentForm = ({ orderId, onSave, onCancel }) => {
  const { getOrder, createFulfillment } = useOrder();
  
  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    trackingCompany: '',
    trackingNumber: '',
    trackingUrl: '',
    items: [],
    status: 'success'
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // تحميل بيانات الطلب
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await getOrder(orderId);
        setOrder(orderData);
        
        // تهيئة قائمة العناصر مع تحديد كل العناصر وتعيين الكمية الكاملة
        const initialItems = orderData.order_items.map(item => ({
          orderItemId: item.id,
          title: item.title,
          sku: item.sku,
          quantity: item.quantity,
          maxQuantity: item.quantity,
          selected: true
        }));
        
        setFormData(prevData => ({
          ...prevData,
          items: initialItems
        }));
      } catch (err) {
        setError('فشل تحميل بيانات الطلب');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, getOrder]);
  
  // معالجة تغيير البيانات العامة
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // معالجة تحديد/إلغاء تحديد العنصر
  const handleItemSelection = (index) => {
    setFormData(prevData => {
      const updatedItems = [...prevData.items];
      updatedItems[index].selected = !updatedItems[index].selected;
      return {
        ...prevData,
        items: updatedItems
      };
    });
  };
  
  // معالجة تغيير كمية العنصر
  const handleItemQuantityChange = (index, value) => {
    const quantity = parseInt(value) || 0;
    setFormData(prevData => {
      const updatedItems = [...prevData.items];
      updatedItems[index].quantity = Math.min(quantity, updatedItems[index].maxQuantity);
      return {
        ...prevData,
        items: updatedItems
      };
    });
  };
  
  // إرسال نموذج إتمام الطلب
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaveLoading(true);
      setError(null);
      setSuccess(null);
      
      // تحضير بيانات العناصر المحددة فقط
      const selectedItems = formData.items
        .filter(item => item.selected)
        .map(item => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity
        }));
      
      if (selectedItems.length === 0) {
        setError('يجب تحديد عنصر واحد على الأقل للإتمام');
        setSaveLoading(false);
        return;
      }
      
      // إنشاء بيانات الإتمام
      const fulfillmentData = {
        orderId,
        trackingCompany: formData.trackingCompany,
        trackingNumber: formData.trackingNumber,
        trackingUrl: formData.trackingUrl,
        status: formData.status,
        items: selectedItems
      };
      
      // إرسال البيانات
      await createFulfillment(fulfillmentData);
      setSuccess('تم إنشاء إتمام الطلب بنجاح');
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء إتمام الطلب');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="loader"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4">
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        {/* معلومات الشحن */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات الشحن</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="mb-4">
              <label htmlFor="trackingCompany" className="block text-sm font-medium text-gray-700 mb-1">
                شركة الشحن
              </label>
              <input
                type="text"
                id="trackingCompany"
                name="trackingCompany"
                value={formData.trackingCompany}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                رقم التتبع
              </label>
              <input
                type="text"
                id="trackingNumber"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4 sm:col-span-2">
              <label htmlFor="trackingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                رابط التتبع
              </label>
              <input
                type="text"
                id="trackingUrl"
                name="trackingUrl"
                value={formData.trackingUrl}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* قائمة عناصر الطلب */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">عناصر الطلب</h3>
          
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={formData.items.every(item => item.selected)}
                      onChange={() => {
                        const allSelected = formData.items.every(item => item.selected);
                        setFormData(prevData => ({
                          ...prevData,
                          items: prevData.items.map(item => ({
                            ...item,
                            selected: !allSelected
                          }))
                        }));
                      }}
                      className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    تحديد
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المنتج
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    رمز المنتج
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الكمية
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleItemSelection(index)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {item.sku || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                        min="1"
                        max={item.maxQuantity}
                        disabled={!item.selected}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <span className="mr-2 text-gray-500">/ {item.maxQuantity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* أزرار الإجراءات */}
        <div className="flex justify-end mt-6 space-x-4 space-x-reverse">
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
            إتمام الطلب
          </Button>
        </div>
      </form>
    </div>
  );
};

FulfillmentForm.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSave: PropTypes.func,
  onCancel: PropTypes.func
};

export default FulfillmentForm;