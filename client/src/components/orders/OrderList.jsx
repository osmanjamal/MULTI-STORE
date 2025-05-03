import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import Table from '../common/Table';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import Alert from '../common/Alert';

const OrderList = ({ storeId }) => {
  const { getOrdersByStore, syncOrders } = useOrder();
  
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    query: '',
    financialStatus: '',
    fulfillmentStatus: '',
    startDate: '',
    endDate: ''
  });
  
  // تحميل الطلبات
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getOrdersByStore(storeId, filters, page);
      setOrders(response.orders);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total
      });
    } catch (err) {
      setError('فشل تحميل الطلبات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (storeId) {
      fetchOrders();
    }
  }, [storeId, filters]);
  
  // معالجة تغيير الصفحة
  const handlePageChange = (page) => {
    fetchOrders(page);
  };
  
  // معالجة تغيير الفلاتر
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  // معالجة إعادة تعيين الفلاتر
  const handleResetFilters = () => {
    setFilters({
      query: '',
      financialStatus: '',
      fulfillmentStatus: '',
      startDate: '',
      endDate: ''
    });
  };
  
  // معالجة مزامنة الطلبات
  const handleSyncOrders = async () => {
    try {
      setSyncLoading(true);
      await syncOrders(storeId);
      fetchOrders();
    } catch (err) {
      setError('فشل مزامنة الطلبات');
      console.error(err);
    } finally {
      setSyncLoading(false);
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
      month: 'short',
      day: 'numeric'
    });
  };
  
  // تنسيق السعر
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };
  
  // تعريف الأعمدة
  const columns = [
    {
      key: 'order_number',
      title: 'رقم الطلب',
      render: (order) => (
        <Link
          to={`/orders/${order.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          #{order.order_number}
        </Link>
      )
    },
    {
      key: 'customer',
      title: 'العميل',
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900">
            {order.first_name} {order.last_name}
          </div>
          <div className="text-sm text-gray-500">{order.email}</div>
        </div>
      )
    },
    {
      key: 'total_price',
      title: 'المبلغ',
      render: (order) => formatPrice(order.total_price, order.currency)
    },
    {
      key: 'financial_status',
      title: 'حالة الدفع',
      render: (order) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFinancialStatusColor(order.financial_status)}`}>
          {order.financial_status === 'paid' ? 'مدفوع' :
           order.financial_status === 'pending' ? 'قيد الانتظار' :
           order.financial_status === 'refunded' ? 'مسترد' :
           order.financial_status === 'failed' ? 'فشل الدفع' :
           order.financial_status}
        </span>
      )
    },
    {
      key: 'fulfillment_status',
      title: 'حالة الإتمام',
      render: (order) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFulfillmentStatusColor(order.fulfillment_status)}`}>
          {order.fulfillment_status === 'fulfilled' ? 'تم الإتمام' :
           order.fulfillment_status === 'partial' ? 'إتمام جزئي' :
           order.fulfillment_status === 'unfulfilled' ? 'غير منجز' :
           order.fulfillment_status === 'returned' ? 'مرتجع' :
           order.fulfillment_status}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'التاريخ',
      render: (order) => formatDate(order.created_at)
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (order) => (
        <div className="flex space-x-2 space-x-reverse">
          <Link
            to={`/orders/${order.id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            عرض
          </Link>
        </div>
      )
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">الطلبات</h2>
        <Button
          variant="primary"
          onClick={handleSyncOrders}
          loading={syncLoading}
        >
          مزامنة الطلبات
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      {/* فلاتر البحث */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              بحث
            </label>
            <input
              type="text"
              id="query"
              name="query"
              value={filters.query}
              onChange={handleFilterChange}
              placeholder="رقم الطلب، البريد الإلكتروني..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="financialStatus" className="block text-sm font-medium text-gray-700 mb-1">
              حالة الدفع
            </label>
            <select
              id="financialStatus"
              name="financialStatus"
              value={filters.financialStatus}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">الكل</option>
              <option value="paid">مدفوع</option>
              <option value="pending">قيد الانتظار</option>
              <option value="refunded">مسترد</option>
              <option value="failed">فشل الدفع</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="fulfillmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
              حالة الإتمام
            </label>
            <select
              id="fulfillmentStatus"
              name="fulfillmentStatus"
              value={filters.fulfillmentStatus}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">الكل</option>
              <option value="fulfilled">تم الإتمام</option>
              <option value="partial">إتمام جزئي</option>
              <option value="unfulfilled">غير منجز</option>
              <option value="returned">مرتجع</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              من تاريخ
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4 text-left">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      </div>
      
      <Table
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="لا توجد طلبات"
      />
      
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
    </div>
  );
};

OrderList.propTypes = {
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default OrderList;