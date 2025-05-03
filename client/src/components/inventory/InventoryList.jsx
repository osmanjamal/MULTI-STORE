import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useInventory } from '../../hooks/useInventory';
import Table from '../common/Table';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import InventoryForm from './InventoryForm';
import StockAdjustment from './StockAdjustment';
import Alert from '../common/Alert';

const InventoryList = ({ storeId }) => {
  const { getInventoryByStore, deleteInventory } = useInventory();
  
  const [inventory, setInventory] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // تحميل المخزون
  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getInventoryByStore(storeId, page);
      setInventory(response.inventory);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total
      });
    } catch (err) {
      setError('فشل تحميل بيانات المخزون');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (storeId) {
      fetchInventory();
    }
  }, [storeId]);
  
  // معالجة تغيير الصفحة
  const handlePageChange = (page) => {
    fetchInventory(page);
  };
  
  // معالجة تحديث المخزون
  const handleInventoryUpdate = () => {
    fetchInventory(pagination.currentPage);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowAdjustModal(false);
  };
  
  // معالجة حذف المخزون
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteInventory(id);
      fetchInventory(pagination.currentPage);
      setConfirmDelete(null);
    } catch (err) {
      setError('فشل حذف سجل المخزون');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // تعريف الأعمدة
  const columns = [
    {
      key: 'product_title',
      title: 'المنتج',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.product_title}</div>
          {item.variant_title && (
            <div className="text-sm text-gray-500">{item.variant_title}</div>
          )}
        </div>
      )
    },
    {
      key: 'sku',
      title: 'رمز المنتج',
      render: (item) => item.sku || '-'
    },
    {
      key: 'quantity',
      title: 'الكمية',
      render: (item) => (
        <span className={`font-medium ${parseInt(item.quantity) <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {item.quantity}
        </span>
      )
    },
    {
      key: 'updated_at',
      title: 'آخر تحديث',
      render: (item) => {
        const date = new Date(item.updated_at);
        return date.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (item) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(item);
              setShowAdjustModal(true);
            }}
          >
            تعديل الكمية
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(item);
              setShowEditModal(true);
            }}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmDelete(item)}
          >
            حذف
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">المخزون</h2>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          إضافة مخزون
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <Table
        columns={columns}
        data={inventory}
        loading={loading}
        emptyMessage="لا توجد بيانات مخزون"
      />
      
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
      
      {/* نوافذ الإضافة والتعديل */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة مخزون جديد"
        size="lg"
      >
        <InventoryForm
          storeId={storeId}
          onSave={handleInventoryUpdate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
      
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل المخزون"
        size="lg"
      >
        {selectedItem && (
          <InventoryForm
            inventoryId={selectedItem.id}
            storeId={storeId}
            onSave={handleInventoryUpdate}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
      
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="تعديل كمية المخزون"
      >
        {selectedItem && (
          <StockAdjustment
            inventoryId={selectedItem.id}
            currentQuantity={selectedItem.quantity}
            onSave={handleInventoryUpdate}
            onCancel={() => setShowAdjustModal(false)}
          />
        )}
      </Modal>
      
      {/* نافذة تأكيد الحذف */}
      <Modal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="تأكيد الحذف"
        footer={
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="ml-3"
              onClick={() => setConfirmDelete(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(confirmDelete.id)}
              loading={loading}
            >
              تأكيد الحذف
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          هل أنت متأكد من رغبتك في حذف سجل المخزون الخاص بـ "{confirmDelete?.product_title}"؟
        </p>
        <p className="text-sm text-red-500 mt-2">
          لا يمكن التراجع عن هذا الإجراء.
        </p>
      </Modal>
    </div>
  );
};

InventoryList.propTypes = {
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default InventoryList;