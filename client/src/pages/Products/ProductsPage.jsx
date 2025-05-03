import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ProductList from '../../components/products/ProductList';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { useProduct } from '../../hooks/useProduct';
import { useStore } from '../../hooks/useStore';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    storeId: '',
    category: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const { getProducts, deleteProduct } = useProduct();
  const { getStores } = useStore();

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getProducts({
        page,
        limit: pagination.limit,
        storeId: filters.storeId || undefined,
        category: filters.category || undefined,
        search: filters.search || undefined,
      });
      
      setProducts(response.data || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      });
    } catch (err) {
      setError('فشل تحميل قائمة المنتجات');
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Obtener tiendas para el filtro
        const storesData = await getStores();
        setStores(storesData.data || storesData || []);
        
        // Obtener productos
        await fetchProducts();
      } catch (err) {
        setError('فشل تحميل البيانات');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [getStores]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    fetchProducts(1);
  };

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
      return;
    }
    
    try {
      await deleteProduct(productId);
      fetchProducts(pagination.page);
    } catch (err) {
      setError('فشل حذف المنتج');
      console.error('Product delete error:', err);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <div className="flex space-x-3 space-x-reverse">
            <Link to="/products/mapping">
              <Button variant="secondary">
                ربط المنتجات
              </Button>
            </Link>
            <Link to="/products/add">
              <Button>
                <span className="mr-2">+</span>
                إضافة منتج جديد
              </Button>
            </Link>
          </div>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المتجر</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={filters.storeId}
                onChange={(e) => handleFilterChange('storeId', e.target.value)}
              >
                <option value="">جميع المتاجر</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <input
                type="text"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="الفئة"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">بحث</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-grow border-gray-300 rounded-r-none rounded-l-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="ابحث عن اسم المنتج أو SKU"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  className="rounded-l-none rounded-r-md"
                  onClick={handleSearch}
                >
                  بحث
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">لا توجد منتجات مطابقة للمعايير</p>
            <Link to="/products/add">
              <Button>إضافة منتج جديد</Button>
            </Link>
          </div>
        ) : (
          <>
            <ProductList
              products={products}
              onDelete={handleDeleteProduct}
            />
            
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;