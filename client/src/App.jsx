// C:\Users\POINT\Desktop\MULTI-STORE\client\src\App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { ProductProvider } from './context/ProductContext';
import { SyncProvider } from './context/SyncContext';
import useAuth from './hooks/useAuth';
import './assets/styles/index.css';
import './assets/styles/main.css';

const AppContent = () => {
  const { init } = useAuth();

  // تهيئة حالة المصادقة عند بدء التطبيق
  useEffect(() => {
    if (init) {
      init();
    }
  }, [init]);

  return (
    <div className="app" dir="rtl">
      <Layout>
        <AppRoutes />
      </Layout>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <ProductProvider>
            <SyncProvider>
              <AppContent />
            </SyncProvider>
          </ProductProvider>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;