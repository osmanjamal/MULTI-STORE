import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

export function useProduct() {
  const context = useContext(ProductContext);
  
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  
  return context;
}

export default useProduct;