import { useContext } from 'react';
import { SyncContext } from '../context/SyncContext';

/**
 * خطاف للوصول إلى سياق المزامنة
 * يوفر وظائف وبيانات المزامنة
 * @returns {Object} كائن يحتوي على بيانات ووظائف المزامنة
 */
const useSync = () => {
  const sync = useContext(SyncContext);
  
  if (!sync) {
    throw new Error('يجب استخدام useSync داخل SyncProvider');
  }
  
  return sync;
};

export default useSync;