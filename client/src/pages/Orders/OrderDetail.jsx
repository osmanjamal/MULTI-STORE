import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useOrder from '../../hooks/useOrder';
import Layout from '../../components/layout/Layout';
import { Loader, Alert } from '../../components/common';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FiArrowRight, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder, updateOrderStatus, getOrderShipment } = useOrder();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderData, shipmentData] = await Promise.all([
        getOrder(id),
        getOrderShipment(id)
      ]);
      setOrder(orderData);
      setShipment(shipmentData);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل تفاصيل الطلب');
      console.error('Error fetching order details:', err);
      toast.error('فشل في تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setActionLoading(true);
      await updateOrderStatus(id, newStatus);
      await fetchOrderDetails();
      toast.success('تم تحديث حالة الطلب بنجاح');
    } catch (err) {
      toast.error('فشل في تحديث حالة الطلب');
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغى',
      returned: 'مرتجع'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <Loader text="جاري تحميل تفاصيل الطلب..." />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <Alert variant="error" title="خطأ" message={error} />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <Alert 
              variant="warning" 
              title="الطلب غير موجود" 
              message="لم يتم العثور على الطلب المطلوب"
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/orders')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FiArrowRight className="w-5 h-5" />
                العودة إلى الطلبات
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                تفاصيل الطلب #{order.display_id}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">معلومات الطلب</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">تاريخ الطلب</h3>
                    <p className="text-base text-gray-900">
                      {format(new Date(order.created_at), 'PPp', { locale: ar })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">المتجر</h3>
                    <p className="text-base text-gray-900">{order.marketplace_name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">العملة</h3>
                    <p className="text-base text-gray-900">{order.currency}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">نوع الدفع</h3>
                    <p className="text-base text-gray-900">{order.payment_method}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">المنتجات</h3>
                  <div className="border rounded-lg">
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
                            السعر
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img 
                                    className="h-10 w-10 rounded-md object-cover" 
                                    src={item.product_image || '/placeholder-product.jpg'} 
                                    alt={item.product_name}
                                  />
                                </div>
                                <div className="mr-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.product_name}
                                  </div>
                                  {item.variant_name && (
                                    <div className="text-sm text-gray-500">
                                      {item.variant_name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPrice(item.unit_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPrice(item.quantity * item.unit_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">معلومات العميل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">الاسم</h3>
                    <p className="text-base text-gray-900">{order.customer_name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">البريد الإلكتروني</h3>
                    <p className="text-base text-gray-900">{order.customer_email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">رقم الهاتف</h3>
                    <p className="text-base text-gray-900">{order.customer_phone}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">العنوان</h3>
                    <p className="text-base text-gray-900 whitespace-pre-line">
                      {order.customer_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Info Card */}
              {shipment && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">معلومات الشحن</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">رقم الشحنة</h3>
                      <p className="text-base text-gray-900">{shipment.tracking_number}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">شركة الشحن</h3>
                      <p className="text-base text-gray-900">{shipment.carrier}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">حالة الشحنة</h3>
                      <p className="text-base text-gray-900">{shipment.status}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">تاريخ الشحن</h3>
                      <p className="text-base text-gray-900">
                        {format(new Date(shipment.shipped_at), 'PPp', { locale: ar })}
                      </p>
                    </div>

                    {shipment.tracking_url && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">رابط التتبع</h3>
                        <a 
                          href={shipment.tracking_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:text-blue-800"
                        >
                          تتبع الشحنة
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">ملخص الطلب</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">المجموع الفرعي:</span>
                    <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الخصم:</span>
                    <span className="text-gray-900">-{formatPrice(order.discount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الشحن:</span>
                    <span className="text-gray-900">{formatPrice(order.shipping_fee)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الضريبة:</span>
                    <span className="text-gray-900">{formatPrice(order.tax)}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-base font-semibold">
                      <span className="text-gray-900">المجموع الكلي:</span>
                      <span className="text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      تأكيد الطلب
                    </button>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('processing')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <FiPackage className="w-4 h-4" />
                      بدء التجهيز
                    </button>
                  )}

                  {order.status === 'processing' && (
                    <Link
                      to={`/orders/${id}/ship`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FiTruck className="w-4 h-4" />
                      شحن الطلب
                    </Link>
                  )}

                  {(['pending', 'confirmed'].includes(order.status)) && (
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <FiXCircle className="w-4 h-4" />
                      إلغاء الطلب
                    </button>
                  )}
                </div>

                {/* Order Notes */}
                {order.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">ملاحظات الطلب</h3>
                    <p className="text-sm text-gray-900 whitespace-pre-line">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;