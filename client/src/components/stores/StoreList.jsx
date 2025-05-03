import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import StoreCard from './StoreCard';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Pagination from '../common/Pagination';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

const StoreList = () => {
  const { stores, loading, error, fetchStores, deleteStore } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const storesPerPage = 6;

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (storeId) => {
    setStoreToDelete(storeId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (storeToDelete) {
      await deleteStore(storeToDelete);
      setShowConfirmModal(false);
      setStoreToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setStoreToDelete(null);
  };

  // Filter stores based on search term and filter
  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    return matchesSearch && store.platform === filterBy;
  });

  // Get current stores for pagination
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);
  const totalPages = Math.ceil(filteredStores.length / storesPerPage);

  if (loading) return <Loader />;

  return (
    <div className="store-list-container">
      <div className="store-list-header">
        <h2 className="store-list-title">متاجرك المتصلة</h2>
        <Link to="/stores/add">
          <Button type="primary">
            <FaPlus className="mr-2" /> إضافة متجر جديد
          </Button>
        </Link>
      </div>

      <div className="store-list-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="البحث عن متجر..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select
            value={filterBy}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">جميع المنصات</option>
            <option value="shopify">شوبيفاي</option>
            <option value="woocommerce">ووكومرس</option>
            <option value="lazada">لازادا</option>
            <option value="shopee">شوبي</option>
          </select>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {currentStores.length === 0 ? (
        <div className="no-stores">
          <p>لا توجد متاجر متصلة. قم بإضافة متجر جديد للبدء!</p>
        </div>
      ) : (
        <div className="store-grid">
          {currentStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onDelete={() => handleDeleteClick(store.id)}
            />
          ))}
        </div>
      )}

      {filteredStores.length > storesPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>تأكيد الحذف</h3>
            <p>هل أنت متأكد من رغبتك في حذف هذا المتجر؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="modal-actions">
              <Button type="danger" onClick={confirmDelete}>حذف</Button>
              <Button type="secondary" onClick={cancelDelete}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreList;