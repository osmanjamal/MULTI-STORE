import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * خطاف للوصول إلى سياق المصادقة
 * يوفر وظائف وبيانات المصادقة
 * @returns {Object} كائن يحتوي على بيانات ووظائف المصادقة
 */
const useAuth = () => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('يجب استخدام useAuth داخل AuthProvider');
  }
  
  return auth;
};

export default useAuth;