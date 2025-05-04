import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'updated_at',
    order: 'desc',
    store: '',
    lowStock: false,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '') params.append(key, value);
      });

      const response = await api.get(`/inventory?${params.toString()}`);
      setInventory(response.data.inventory);
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
      });
      setError(null);
    } catch (err) {
      setError('فشل في تحميل المخزون');
      toast.error('فشل في تحميل المخزون');
    } finally {
      setLoading(false);
    }
  };

  const getInventoryItem = async (inventoryId) => {
    try {
      const response = await api.get(`/inventory/${inventoryId}`);
      return response.data;
    } catch (err) {
      toast.error('فشل في تحميل تفاصيل المخزون');
      throw err;
    }
  };

  const updateInventory = async (inventoryId, data) => {
    try {
      const response = await api.put(`/inventory/${inventoryId}`, data);
      toast.success('تم تحديث المخزون بنجاح');
      return response.data;
    } catch (err) {
      toast.error('فشل في تحديث المخزون');
      throw err;
    }
  };

  const adjustStock = async (adjustmentData) => {
    try {
      const response = await api.post('/inventory/adjust', adjustmentData);
      toast.success('تم تعديل المخزون بنجاح');
      return response.data;
    } catch (err) {
      toast.error('فشل في تعديل المخزون');
      throw err;
    }
  };

  const fetchAdjustments = async (inventoryId) => {
    try {
      const response = await api.get(`/inventory/${inventoryId}/adjustments`);
      setAdjustments(response.data);
      return response.data;
    } catch (err) {
      toast.error('فشل في تحميل سجل التعديلات');
      throw err;
    }
  };

  const exportInventory = async () => {
    try {
      const response = await api.get('/inventory/export', {
        responseType: 'blob',
        params: filters,
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('تم تصدير المخزون بنجاح');
    } catch (err) {
      toast.error('فشل في تصدير المخزون');
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const getInventoryStats = async () => {
    try {
      const response = await api.get('/inventory/stats');
      return response.data;
    } catch (err) {
      toast.error('فشل في تحميل إحصائيات المخزون');
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filters]);

  return {
    inventory,
    loading,
    error,
    adjustments,
    filters,
    pagination,
    fetchInventory,
    getInventoryItem,
    updateInventory,
    adjustStock,
    fetchAdjustments,
    exportInventory,
    updateFilters,
    getInventoryStats,
  };
};

export default useInventory;