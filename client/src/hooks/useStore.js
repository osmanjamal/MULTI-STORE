import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

/**
 * خطاف للوصول إلى سياق المتاجر
 * يوفر وظائف وبيانات المتاجر
 * @returns {Object} كائن يحتوي على بيانات ووظائف المتاجر
 */
const useStore = () => {
  const store = useContext(StoreContext);
  
  if (!store) {
    throw new Error('يجب استخدام useStore داخل StoreProvider');
  }
  
  return store;
};

export default useStore;