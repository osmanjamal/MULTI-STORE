import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Pagination, Spinner, Tag } from '../common';
import { useProduct } from '../../hooks/useProduct';
import { useStore } from '../../hooks/useStore';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

const ProductList = () => {
  const { stores, activeStore, setActiveStore } = useStore();
  const { products, loading, fetchProducts, deleteProduct } = useProduct();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (activeStore) {
      fetchProducts(activeStore.id);
    }
  }, [activeStore, fetchProducts]);

  // تصفية المنتجات حسب البحث والفلتر
  const filteredProducts = products.filter(product => {
    const matchesSearch = search 
      ? product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(search.toLowerCase())
      : true;
    
    const matchesFilter = filter === 'all' 
      ? true 
      : product.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // تقسيم الصفحات
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleStoreChange = (storeId) => {
    const selected = stores.find(store => store.id === parseInt(storeId));
    setActiveStore(selected);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${title}"؟`)) {
      await deleteProduct(id);
    }
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'active':
        return <Tag color="green">فعّال</Tag>;
      case 'draft':
        return <Tag color="gray">مسودة</Tag>;
      case 'archived':
        return <Tag color="orange">مؤرشف</Tag>;
      default:
        return <Tag color="blue">{status}</Tag>;
    }
  };

  return (
    <Card title="إدارة المنتجات">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Select 
            value={activeStore?.id || ''} 
            onChange={(e) => handleStoreChange(e.target.value)}
            placeholder="اختر متجر"
            className="min-w-[200px]"
          >
            <option value="" disabled>اختر متجر</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </Select>
          
          <Input
            type="text"
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px]"
          />
          
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="min-w-[150px]"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">فعّال</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </Select>
        </div>
        
        <Link to="/products/add">
          <Button color="primary">إضافة منتج</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>اسم المنتج</Table.HeaderCell>
                <Table.HeaderCell>رمز المنتج</Table.HeaderCell>
                <Table.HeaderCell>المتغيرات</Table.HeaderCell>
                <Table.HeaderCell>الحالة</Table.HeaderCell>
                <Table.HeaderCell>تاريخ الإنشاء</Table.HeaderCell>
                <Table.HeaderCell>الإجراءات</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {currentItems.length > 0 ? (
                currentItems.map(product => (
                  <Table.Row key={product.id}>
                    <Table.Cell>
                      <div className="flex items-center">
                        {product.images && product.images[0] && (
                          <img 
                            src={product.images[0].src} 
                            alt={product.title} 
                            className="w-10 h-10 rounded-sm object-cover mr-2" 
                          />
                        )}
                        <span className="font-medium">{product.title}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{product.sku || '-'}</Table.Cell>
                    <Table.Cell>{product.variants?.length || 0}</Table.Cell>
                    <Table.Cell>{getStatusTag(product.status)}</Table.Cell>
                    <Table.Cell>{formatDate(product.created_at)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link to={`/products/${product.id}`}>
                          <Button size="sm" color="info">عرض</Button>
                        </Link>
                        <Link to={`/products/edit/${product.id}`}>
                          <Button size="sm" color="secondary">تعديل</Button>
                        </Link>
                        <Button 
                          size="sm" 
                          color="danger"
                          onClick={() => handleDelete(product.id, product.title)}
                        >
                          حذف
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan="6" className="text-center py-8">
                    لا توجد منتجات متاحة
                    {search && " مطابقة لبحثك"}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          {filteredProducts.length > itemsPerPage && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ProductList;