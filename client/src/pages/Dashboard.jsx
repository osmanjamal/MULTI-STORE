import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import SyncStatus from '../components/dashboard/SyncStatus';
import ActivityLog from '../components/dashboard/ActivityLog';
import { Alert } from '../components/common/Alert';
import { Loader } from '../components/common/Loader';
import { useStore } from '../hooks/useStore';
import { useProduct } from '../hooks/useProduct';
import { useOrder } from '../hooks/useOrder';
import { useSync } from '../hooks/useSync';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    storeCount: 0,
    productCount: 0,
    orderCount: 0,
    pendingSyncs: 0
  });
  
  const [syncStatus, setSyncStatus] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  const { getStores } = useStore();
  const { getProducts } = useProduct();
  const { getOrders } = useOrder();
  const { getSyncStatus, getSyncLogs } = useSync();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Obtener todos los datos necesarios para el dashboard
        const [stores, products, orders, syncData, logs] = await Promise.all([
          getStores(),
          getProducts({ limit: 1 }),
          getOrders({ limit: 1 }),
          getSyncStatus(),
          getSyncLogs({ limit: 10 })
        ]);

        setStats({
          storeCount: stores.total || stores.length || 0,
          productCount: products.total || 0,
          orderCount: orders.total || 0,
          pendingSyncs: syncData.pendingCount || 0
        });
        
        setSyncStatus(syncData.stores || []);
        setRecentActivity(logs.data || []);
      } catch (err) {
        console.error('Error al cargar los datos del dashboard:', err);
        setError('حدث خطأ أثناء تحميل بيانات لوحة التحكم');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getStores, getProducts, getOrders, getSyncStatus, getSyncLogs]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="المتاجر المتصلة"
            value={stats.storeCount}
            icon="store"
            color="bg-blue-500"
          />
          <StatsCard
            title="المنتجات"
            value={stats.productCount}
            icon="package"
            color="bg-green-500"
          />
          <StatsCard
            title="الطلبات"
            value={stats.orderCount}
            icon="shopping-cart"
            color="bg-purple-500"
          />
          <StatsCard
            title="عمليات المزامنة المعلقة"
            value={stats.pendingSyncs}
            icon="refresh-cw"
            color="bg-orange-500"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado de sincronización */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">حالة المزامنة</h2>
            <SyncStatus stores={syncStatus} />
          </div>
          
          {/* Actividad reciente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">النشاط الأخير</h2>
            <ActivityLog logs={recentActivity} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;