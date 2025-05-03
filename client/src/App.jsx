import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { useAuth } from './hooks/useAuth';
import './assets/styles/main.css';

const App = () => {
  const { init } = useAuth();

  // تهيئة حالة المصادقة عند بدء التطبيق
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="app" dir="rtl">
      <AppRoutes />
    </div>
  );
};

export default App;