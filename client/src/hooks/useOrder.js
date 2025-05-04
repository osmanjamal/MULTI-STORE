import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    marketplace: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.orders);
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
      });
      setError(null);
    } catch (err) {
      setError('فشل في تحميل الطلبات');
      toast.error('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (err) {
      toast.error('فشل في تحميل تفاصيل الطلب');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      toast.success('تم تحديث حالة الطلب بنجاح');
      return response.data;
    } catch (err) {
      toast.error('فشل في تحديث حالة الطلب');
      throw err;
    }
  };

  const shipOrder = async (orderId, shipmentData) => {
    try {
      const response = await api.post(`/orders/${orderId}/ship`, shipmentData);
      toast.success('تم شحن الطلب بنجاح');
      return response.data;
    } catch (err) {
      toast.error('فشل في شحن الطلب');
      throw err;
    }
  };

  const getOrderShipment = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/shipment`);
      return response.data;
    } catch (err) {
      return null;
    }
  };

  const exportOrders = async () => {
    try {
      const response = await api.get('/orders/export', {
        responseType: 'blob',
        params: filters,
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('تم تصدير الطلبات بنجاح');
    } catch (err) {
      toast.error('فشل في تصدير الطلبات');
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    fetchOrders,
    getOrder,
    updateOrderStatus,
    shipOrder,
    getOrderShipment,
    exportOrders,
    updateFilters,
  };
};

export default useOrder;