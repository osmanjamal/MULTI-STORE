import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { useOrder } from '../../hooks/useOrder';
import FulfillmentForm from '../../components/orders/FulfillmentForm';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const { getOrder, updateOrderStatus, createFulfillment } = useOrder();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        setError('فشل تحميل تفاصيل الطلب');
        console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, getOrder]);

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`هل أنت متأكد من تغيير حالة الطلب إلى "${newStatus}"؟`)) {
      return;
    }
    
    try {
      setUpdateLoading(true);
      await updateOrderStatus(orderId, newStatus);
      
      // Actualizar el pedido en el estado
      setOrder(prev => ({
        ...prev,
        status: newStatus
      }));
    } catch (err) {
      setError('فشل تحديث حالة الطلب');
      console.error('Order status update error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFulfillment = async (fulfillmentData) => {
    try {
      setUpdateLoading(true);
      await createFulfillment(orderId, fulfillmentData);
      
      // Recargar el pedido para obtener los datos actualizados
      const updatedOrder = await getOrder(orderId);
      setOrder(updatedOrder);
      
      setShowFulfillmentModal(false);
    } catch (err) {
      setError('فشل إنشاء تسليم للطلب');
      console.error('Fulfillment creation error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!order && !loading) {
    return (
      <Layout>
        <div className="p-6">
          <Alert type="error" message="الطلب غير موجود" />
          <div className="mt-4">
            <Button onClick={() => navigate('/orders')}>
              العودة إلى قائمة الطلبات
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            تفاصيل الطلب #{order.orderNumber}
          </h1>
          <div className="flex space-x-3 space-x-reverse">
            <Button
              variant="secondary"
              onClick={() => navigate('/orders')}
            >
              العودة إلى القائمة
            </Button>
            
            {order.status !== 'cancelled' && (
              <Button
                variant="danger"
                onClick={() => handleStatusUpdate('cancelled')}
                loading={updateLoading}
                disabled={updateLoading}
              >
                إلغاء الطلب
              </Button>
            )}
            
            {order.status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate('processing')}
                loading={updateLoading}
                disabled={updateLoading}
              >
                بدء المعالجة
              </Button>
            )}
            
            {order.status === 'processing' && (
              <Button
                onClick={() => setShowFulfillmentModal(true)}
                loading={updateLoading}
                disabled={updateLoading}
              >
                شحن الطلب
              </Button>
            )}
            
            {order.status === 'shipped' && (
              <Button
                onClick={() => handleStatusUpdate('delivered')}
                loading={updateLoading}
                disabled={updateLoading}
              >
                تأكيد التسليم
              </Button>
            )}
          </div>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {/* Estado del pedido */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">حالة الطلب</h2>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                order.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : order.status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'shipped'
                  ? 'bg-indigo-100 text-indigo-800'
                  : order.status === 'delivered'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {order.status === 'pending'
                ? 'قيد الانتظار'
                : order.status === 'processing'
                ? 'قيد المعالجة'
                : order.status === 'shipped'
                ? 'تم الشحن'
                : order.status === 'delivered'
                ? 'تم التسليم'
                : 'ملغي'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">المتجر</p>
              <p className="font-medium">{order.store.name}</p>
            </div>
            <div>
              <p className="text-gray-600">تاريخ الطلب</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-600">رقم الطلب في المتجر</p>
              <p className="font-medium">{order.externalOrderId || 'غير محدد'}</p>
            </div>
          </div>
        </div>
        
        {/* Información del cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">معلومات العميل</h2>
            <div className="text-sm">
              <p className="mb-2">
                <span className="text-gray-600">الاسم:</span>{' '}
                <span className="font-medium">{order.customer.name}</span>
              </p>
              <p className="mb-2">
                <span className="text-gray-600">البريد الإلكتروني:</span>{' '}
                <span className="font-medium">{order.customer.email}</span>
              </p>
              <p className="mb-2">
                <span className="text-gray-600">الهاتف:</span>{' '}
                <span className="font-medium">{order.customer.phone || 'غير محدد'}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">معلومات الشحن</h2>
            <div className="text-sm">
              <p className="mb-2">
                <span className="text-gray-600">العنوان:</span>{' '}
                <span className="font-medium">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </span>
              </p>
              <p className="mb-2">
                <span className="text-gray-600">المدينة / البلد:</span>{' '}
                <span className="font-medium">
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </span>
              </p>
              <p className="mb-2">
                <span className="text-gray-600">الرمز البريدي:</span>{' '}
                <span className="font-medium">{order.shippingAddress.postalCode || 'غير محدد'}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Productos del pedido */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">المنتجات</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكمية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر الإفرادي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.product.sku}
                          </div>
                          {item.variantName && (
                            <div className="text-sm text-gray-500">
                              {item.variantName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.price, order.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.price * item.quantity, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="2" className="px-6 py-4 whitespace-nowrap"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    المجموع الفرعي
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.subtotalAmount, order.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="px-6 py-4 whitespace-nowrap"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    الضريبة
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.taxAmount, order.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="px-6 py-4 whitespace-nowrap"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    الشحن
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.shippingAmount, order.currency)}
                  </td>
                </tr>
                <tr>
                    <td colSpan="2" className="px-6 py-4 whitespace-nowrap"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        المجموع الكلي
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(order.totalAmount, order.currency)}
                    </td>
                    </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Información de envío si está enviado */}
        {order.fulfillments && order.fulfillments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">معلومات الشحن</h2>
            <div className="space-y-4">
              {order.fulfillments.map((fulfillment) => (
                <div key={fulfillment.id} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-gray-600 text-sm">رقم التتبع</p>
                      <p className="font-medium">{fulfillment.trackingNumber || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">شركة الشحن</p>
                      <p className="font-medium">{fulfillment.carrier || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">تاريخ الشحن</p>
                      <p className="font-medium">{formatDate(fulfillment.createdAt)}</p>
                    </div>
                  </div>
                  {fulfillment.trackingUrl && (
                    <div className="mt-2">
                      
                        href={fulfillment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        تتبع الشحنة
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Historial de cambios */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">سجل الحالة</h2>
            <div className="space-y-4">
              {order.statusHistory.map((statusChange, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-4 w-4 mt-1 rounded-full bg-blue-500"></div>
                  <div className="mr-4">
                    <p className="font-medium">
                      {statusChange.status === 'pending'
                        ? 'قيد الانتظار'
                        : statusChange.status === 'processing'
                        ? 'قيد المعالجة'
                        : statusChange.status === 'shipped'
                        ? 'تم الشحن'
                        : statusChange.status === 'delivered'
                        ? 'تم التسليم'
                        : 'ملغي'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(statusChange.timestamp)}
                    </p>
                    {statusChange.note && (
                      <p className="text-sm text-gray-600 mt-1">{statusChange.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de envío */}
      <Modal
        isOpen={showFulfillmentModal}
        onClose={() => setShowFulfillmentModal(false)}
        title="إنشاء شحنة"
      >
        <FulfillmentForm
          orderId={orderId}
          onSubmit={handleFulfillment}
          onCancel={() => setShowFulfillmentModal(false)}
          loading={updateLoading}
        />
      </Modal>
    </Layout>
  );
};

export default OrderDetail;