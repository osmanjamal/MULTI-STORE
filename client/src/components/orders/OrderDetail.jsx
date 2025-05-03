import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOrder } from '../../hooks/useOrder';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import FulfillmentForm from './FulfillmentForm';

const OrderDetail = ({ orderId }) => {
  const { getOrder, updateOrder } = useOrder();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  
  // تحميل بيانات الطلب
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await getOrder(orderId);
        setOrder(orderData);
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
  
  // تحديث بيانات الطلب
  const fetchUpdatedOrder = async () => {
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error(err);
    }
  };
  
  // معالجة تغيير حالة الطلب
  const handleStatusChange = async (status) => {
    try {
      setLoading(true);
      await updateOrder(orderId, { financialStatus: status });
      await fetchUpdatedOrder();
    } catch (err) {
      setError('فشل تحديث حالة الطلب');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // الحصول على لون حالة الطلب المالية
  const getFinancialStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // الحصول على لون حالة إتمام الطلب
  const getFulfillmentStatusColor = (status) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'unfulfilled':
        return 'bg-yellow-100 text-yellow-800';
      case 'returned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // تنسيق السعر
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };
  
  if (loading && !order) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader text="جاري تحميل بيانات الطلب..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert type="error" message={error} />
    );
  }
  
  if (!order) {
    return (
      <Alert type="warning" message="لم يتم العثور على بيانات الطلب" />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* معلومات رأس الطلب */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            طلب #{order.order_number}
          </h1>
          <p className="text-sm text-gray-500">
            {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button
            variant="primary"
            onClick={() => setShowFulfillmentModal(true)}
            disabled={order.fulfillment_status === 'fulfilled'}
          >
            إتمام الطلب
          </Button>
        </div>
      </div>
      
      {/* حالة الطلب */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="حالة الطلب">
          <div className="flex flex-col space-y-4">
            <div>
              <span className="text-sm text-gray-500">الحالة المالية:</span>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFinancialStatusColor(order.financial_status)}`}>
                  {order.financial_status === 'paid' ? 'مدفوع' :
                   order.financial_status === 'pending' ? 'قيد الانتظار' :
                   order.financial_status === 'refunded' ? 'مسترد' :
                   order.financial_status === 'failed' ? 'فشل الدفع' :
                   order.financial_status}
                </span>
                
                {/* قائمة إجراءات تغيير الحالة المالية */}
                <div className="mr-2 relative inline-block text-right">
                  <div>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                      id="financial-status-menu"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onClick={() => {
                        const menu = document.getElementById('financial-status-dropdown');
                        menu.classList.toggle('hidden');
                      }}
                    >
                      تغيير
                      <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div
                    className="hidden origin-top-left absolute left-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                    id="financial-status-dropdown"
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="financial-status-menu">
                      <button
                        onClick={() => {
                          handleStatusChange('paid');
                          document.getElementById('financial-status-dropdown').classList.add('hidden');
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-right"
                        role="menuitem"
                      >
                        مدفوع
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange('pending');
                          document.getElementById('financial-status-dropdown').classList.add('hidden');
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-right"
                        role="menuitem"
                      >
                        قيد الانتظار
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange('refunded');
                          document.getElementById('financial-status-dropdown').classList.add('hidden');
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-right"
                        role="menuitem"
                      >
                        مسترد
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange('failed');
                          document.getElementById('financial-status-dropdown').classList.add('hidden');
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-right"
                        role="menuitem"
                      >
                        فشل الدفع
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">حالة الإتمام:</span>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFulfillmentStatusColor(order.fulfillment_status)}`}>
                  {order.fulfillment_status === 'fulfilled' ? 'تم الإتمام' :
                   order.fulfillment_status === 'partial' ? 'إتمام جزئي' :
                   order.fulfillment_status === 'unfulfilled' ? 'غير منجز' :
                   order.fulfillment_status === 'returned' ? 'مرتجع' :
                   order.fulfillment_status}
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">طريقة الدفع:</span>
              <div className="mt-1 font-medium text-gray-900">
                {order.payment_method || 'غير محدد'}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">طريقة الشحن:</span>
              <div className="mt-1 font-medium text-gray-900">
                {order.shipping_method || 'غير محدد'}
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="معلومات العميل">
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">اسم العميل:</span>
              <div className="mt-1 font-medium text-gray-900">
                {order.first_name} {order.last_name}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">البريد الإلكتروني:</span>
              <div className="mt-1 font-medium text-gray-900">
                {order.email || 'غير متوفر'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">عنوان الفوترة</h3>
                {order.billing_address ? (
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{order.billing_address.name}</p>
                    <p>{order.billing_address.address1}</p>
                    {order.billing_address.address2 && <p>{order.billing_address.address2}</p>}
                    <p>
                      {order.billing_address.city}{order.billing_address.city && order.billing_address.province && ', '}
                      {order.billing_address.province}
                    </p>
                    <p>{order.billing_address.zip} {order.billing_address.country}</p>
                    {order.billing_address.phone && <p>{order.billing_address.phone}</p>}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">غير متوفر</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">عنوان الشحن</h3>
                {order.shipping_address ? (
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.address1}</p>
                    {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                    <p>
                      {order.shipping_address.city}{order.shipping_address.city && order.shipping_address.province && ', '}
                      {order.shipping_address.province}
                    </p>
                    <p>{order.shipping_address.zip} {order.shipping_address.country}</p>
                    {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">غير متوفر</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* عناصر الطلب */}
      <Card title="عناصر الطلب">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتج
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكمية
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجمالي
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    {item.variant_title && (
                      <div className="text-sm text-gray-500">{item.variant_title}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sku || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(item.price, order.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(item.price * item.quantity, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-6 py-3 text-sm font-medium text-gray-900 text-left">
                  المجموع الفرعي
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {formatPrice(order.subtotal_price, order.currency)}
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="px-6 py-3 text-sm font-medium text-gray-900 text-left">
                  الشحن
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {formatPrice(order.total_shipping, order.currency)}
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="px-6 py-3 text-sm font-medium text-gray-900 text-left">
                  الضريبة
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {formatPrice(order.total_tax, order.currency)}
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="px-6 py-3 text-sm font-medium text-gray-900 text-left">
                  الخصم
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  -{formatPrice(order.total_discounts, order.currency)}
                </td>
              </tr>
              <tr className="border-t border-gray-200">
                <td colSpan="4" className="px-6 py-3 text-base font-bold text-gray-900 text-left">
                  الإجمالي
                </td>
                <td className="px-6 py-3 text-base font-bold text-gray-900">
                  {formatPrice(order.total_price, order.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
      
      {/* نافذة إضافة إتمام الطلب */}
      <Modal
        isOpen={showFulfillmentModal}
        onClose={() => setShowFulfillmentModal(false)}
        title="إتمام الطلب"
        size="lg"
      >
        <FulfillmentForm
          orderId={orderId}
          onSave={() => {
            setShowFulfillmentModal(false);
            fetchUpdatedOrder();
          }}
          onCancel={() => setShowFulfillmentModal(false)}
        />
      </Modal>
    </div>
  );
};

OrderDetail.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default OrderDetail;