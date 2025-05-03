import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

/**
 * خطاف للوصول إلى سياق المنتجات
 * يوفر وظائف وبيانات المنتجات
 * @returns {Object} كائن يحتوي على بيانات ووظائف المنتجات
 */
const useProduct = () => {
  const product = useContext(ProductContext);
  
  if (!product) {
    throw new Error('يجب استخدام useProduct داخل ProductProvider');
  }
  
  return product;
};

export default useProduct;