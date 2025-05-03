import React, { useState, useEffect } from 'react';
import { useSync } from '../../hooks/useSync';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Pagination from '../common/Pagination';
import { FaPlus, FaEdit, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SyncRuleList = () => {
  const { syncRules, loading, error, fetchSyncRules, deleteSyncRule, toggleSyncRule } = useSync();
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const rulesPerPage = 10;

  useEffect(() => {
    fetchSyncRules();
  }, [fetchSyncRules]);

  const handleDeleteClick = (ruleId) => {
    setRuleToDelete(ruleId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (ruleToDelete) {
      await deleteSyncRule(ruleToDelete);
      setShowConfirmModal(false);
      setRuleToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setRuleToDelete(null);
  };

  const handleToggleRule = async (ruleId, isActive) => {
    await toggleSyncRule(ruleId, !isActive);
  };

  // Get current rules for pagination
  const indexOfLastRule = currentPage * rulesPerPage;
  const indexOfFirstRule = indexOfLastRule - rulesPerPage;
  const currentRules = syncRules.slice(indexOfFirstRule, indexOfLastRule);
  const totalPages = Math.ceil(syncRules.length / rulesPerPage);

  if (loading) return <Loader />;

  return (
    <div className="sync-rule-list-container">
      <div className="sync-rule-list-header">
        <h2 className="sync-rule-list-title">قواعد المزامنة</h2>
        <Link to="/sync/rules/add">
          <Button type="primary">
            <FaPlus className="mr-2" /> إضافة قاعدة جديدة
          </Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}

      {currentRules.length === 0 ? (
        <div className="no-rules">
          <p>لا توجد قواعد مزامنة. قم بإضافة قاعدة جديدة للبدء!</p>
        </div>
      ) : (
        <div className="sync-rule-table-container">
          <table className="sync-rule-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>النوع</th>
                <th>المتجر المصدر</th>
                <th>المتجر الهدف</th>
                <th>الحالة</th>
                <th>آخر تشغيل</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currentRules.map((rule) => (
                <tr key={rule.id}>
                  <td>{rule.name}</td>
                  <td>
                    {rule.type === 'product' && 'المنتجات'}
                    {rule.type === 'inventory' && 'المخزون'}
                    {rule.type === 'order' && 'الطلبات'}
                  </td>
                  <td>{rule.sourceStore.name}</td>
                  <td>{rule.targetStore.name}</td>
                  <td>
                    <span className={`status-badge ${rule.isActive ? 'active' : 'inactive'}`}>
                      {rule.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td>{rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString('ar-SA') : 'لم يتم التشغيل بعد'}</td>
                  <td>
                    <div className="rule-actions">
                      <button
                        className="action-button toggle"
                        onClick={() => handleToggleRule(rule.id, rule.isActive)}
                        title={rule.isActive ? 'إيقاف' : 'تشغيل'}
                      >
                        {rule.isActive ? <FaPause /> : <FaPlay />}
                      </button>
                      <Link to={`/sync/rules/edit/${rule.id}`} className="action-button edit" title="تعديل">
                        <FaEdit />
                      </Link>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteClick(rule.id)}
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {syncRules.length > rulesPerPage && (
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
            <p>هل أنت متأكد من رغبتك في حذف قاعدة المزامنة هذه؟ لا يمكن التراجع عن هذا الإجراء.</p>
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

export default SyncRuleList;