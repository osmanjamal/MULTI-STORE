import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// صفحات المصادقة
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// صفحة لوحة القيادة
import Dashboard from './pages/Dashboard';

// صفحات المتاجر
import StoresPage from './pages/Stores/StoresPage';
import AddStore from './pages/Stores/AddStore';
import EditStore from './pages/Stores/EditStore';

// صفحات المنتجات
import ProductsPage from './pages/Products/ProductsPage';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import ProductMapping from './pages/Products/ProductMapping';

// صفحات المخزون
import InventoryPage from './pages/Inventory/InventoryPage';
import AdjustStock from './pages/Inventory/AdjustStock';

// صفحات الطلبات
import OrdersPage from './pages/Orders/OrdersPage';
import OrderDetail from './pages/Orders/OrderDetail';

// صفحات المزامنة
import SyncRules from './pages/Sync/SyncRules';
import SyncLogs from './pages/Sync/SyncLogs';
import SyncSettings from './pages/Sync/SyncSettings';

// صفحات الإعدادات
import ProfileSettings from './pages/Settings/ProfileSettings';
import AccountSettings from './pages/Settings/AccountSettings';
import ApiSettings from './pages/Settings/ApiSettings';

// مكون PrivateRoute للتحقق من تسجيل الدخول
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// مكون AuthRoute للتأكد من عدم الوصول لصفحات تسجيل الدخول بعد تسجيل الدخول
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* المسارات العامة */}
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } 
      />
      
      <Route 
        path="/forgot-password" 
        element={
          <AuthRoute>
            <ForgotPassword />
          </AuthRoute>
        } 
      />

      {/* المسارات المحمية */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />

      {/* مسارات المتاجر */}
      <Route 
        path="/stores" 
        element={
          <PrivateRoute>
            <StoresPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/stores/add" 
        element={
          <PrivateRoute>
            <AddStore />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/stores/:storeId/edit" 
        element={
          <PrivateRoute>
            <EditStore />
          </PrivateRoute>
        } 
      />

      {/* مسارات المنتجات */}
      <Route 
        path="/products" 
        element={
          <PrivateRoute>
            <ProductsPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/products/add" 
        element={
          <PrivateRoute>
            <AddProduct />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/products/:productId/edit" 
        element={
          <PrivateRoute>
            <EditProduct />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/products/mapping" 
        element={
          <PrivateRoute>
            <ProductMapping />
          </PrivateRoute>
        } 
      />

      {/* مسارات المخزون */}
      <Route 
        path="/inventory" 
        element={
          <PrivateRoute>
            <InventoryPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/inventory/adjust" 
        element={
          <PrivateRoute>
            <AdjustStock />
          </PrivateRoute>
        } 
      />

      {/* مسارات الطلبات */}
      <Route 
        path="/orders" 
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/orders/:orderId" 
        element={
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        } 
      />

      {/* مسارات المزامنة */}
      <Route 
        path="/sync/rules" 
        element={
          <PrivateRoute>
            <SyncRules />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/sync/logs" 
        element={
          <PrivateRoute>
            <SyncLogs />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/sync/settings" 
        element={
          <PrivateRoute>
            <SyncSettings />
          </PrivateRoute>
        } 
      />

      {/* مسارات الإعدادات */}
      <Route 
        path="/settings/profile" 
        element={
          <PrivateRoute>
            <ProfileSettings />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/settings/account" 
        element={
          <PrivateRoute>
            <AccountSettings />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/settings/api" 
        element={
          <PrivateRoute>
            <ApiSettings />
          </PrivateRoute>
        } 
      />

      {/* مسار التوجيه الافتراضي */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;