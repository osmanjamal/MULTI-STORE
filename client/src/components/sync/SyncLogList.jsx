import React, { useState, useEffect } from 'react';
import { useSync } from '../../hooks/useSync';
import { useStore } from '../../hooks/useStore';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Pagination from '../common/Pagination';
import { FaFilter, FaSearch, FaDownload, FaTrash } from 'react-icons/fa';

const LogStatusBadge = ({ status }) => {
  const statusMap = {
    success: { label: 'ناجح', class: 'status-success' },
    error: { label: 'خطأ', class: 'status-error' },
    warning: { label: 'تحذير', class: 'status-warning' },
    info: { label: 'معلومة', class: 'status-info' },
    running: { label: 'قيد التنفيذ', class: 'status-running' }
  };
  
  const statusInfo = statusMap[status] || { label: status, class: 'status-default' };
  
  return (
    <span className={`status-badge ${statusInfo.class}`}>
      {statusInfo.label}
    </span>
  );
};

const SyncLogList = () => {
  const { syncLogs, loading, error, fetchSyncLogs, clearSyncLogs, exportSyncLogs } = useSync();
  const { stores, fetchStores } = useStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStoreId, setFilterStoreId] = useState('all');
  const [filterRuleId, setFilterRuleId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const logsPerPage = 15;
  
  useEffect(() => {
    fetchSyncLogs();
    fetchStores();
  }, [fetchSyncLogs, fetchStores]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleFilterChange = (e, filterType) => {
    switch (filterType) {
      case 'status':
        setFilterStatus(e.target.value);
        break;
      case 'store':
        setFilterStoreId(e.target.value);
        break;
      case 'rule':
        setFilterRuleId(e.target.value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };
  
  const handleDateChange = (e, dateType) => {
    setDateRange(prev => ({
      ...prev,
      [dateType]: e.target.value
    }));
    setCurrentPage(1);
  };
  
  const handleClearLogs = () => {
    setShowConfirmModal(true);
  };
  
  const confirmClearLogs = async () => {
    await clearSyncLogs();
    setShowConfirmModal(false);
  };
  
  const cancelClearLogs = () => {
    setShowConfirmModal(false);
  };
  
  const handleExportLogs = () => {
    exportSyncLogs(filteredLogs);
  };
  
  // Get unique rules from logs for filtering
  const uniqueRules = [...new Set(syncLogs.map(log => log.syncRule?.id))].filter(Boolean);
  const syncRules = uniqueRules.map(ruleId => {
    const log = syncLogs.find(log => log.syncRule?.id === ruleId);
    return log?.syncRule;
  }).filter(Boolean);
  
  // Filter logs based on filters and search
  const filteredLogs = syncLogs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    
    const matchesStore = filterStoreId === 'all' || 
                         log.sourceStore?.id === filterStoreId || 
                         log.targetStore?.id === filterStoreId;
    
    const matchesRule = filterRuleId === 'all' || (log.syncRule && log.syncRule.id === filterRuleId);
    
    const matchesDateRange = 
      (!dateRange.startDate || new Date(log.createdAt) >= new Date(dateRange.startDate)) && 
      (!dateRange.endDate || new Date(log.createdAt) <= new Date(dateRange.endDate));
    
    return matchesSearch && matchesStatus && matchesStore && matchesRule && matchesDateRange;
  });
  
  // Get current logs for pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  
  if (loading) return <Loader />;
  
  return (
    <div className="sync-log-list-container">
      <div className="sync-log-list-header">
        <h2 className="sync-log-list-title">سجلات المزامنة</h2>
        <div className="log-actions">
          <button
            className="secondary-button"
            onClick={handleExportLogs}
            disabled={filteredLogs.length === 0}
          >
            <FaDownload className="mr-2" /> تصدير السجلات
          </button>
          <button
            className="danger-button"
            onClick={handleClearLogs}
            disabled={syncLogs.length === 0}
          >
            <FaTrash className="mr-2" /> مسح السجلات
          </button>
        </div>
      </div>
      
      {error && <Alert type="error" message={error} />}
      
      <div className="log-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="البحث في السجلات..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-item">
            <FaFilter className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e, 'status')}
              className="filter-select"
            >
              <option value="all">جميع الحالات</option>
              <option value="success">ناجح</option>
              <option value="error">خطأ</option>
              <option value="warning">تحذير</option>
              <option value="info">معلومة</option>
              <option value="running">قيد التنفيذ</option>
            </select>
          </div>
          
          <div className="filter-item">
            <select
              value={filterStoreId}
              onChange={(e) => handleFilterChange(e, 'store')}
              className="filter-select"
            >
              <option value="all">جميع المتاجر</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <select
              value={filterRuleId}
              onChange={(e) => handleFilterChange(e, 'rule')}
              className="filter-select"
            >
              <option value="all">جميع القواعد</option>
              {syncRules.map((rule) => (
                <option key={rule.id} value={rule.id}>{rule.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="date-filters">
          <div className="date-filter">
            <label>من:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange(e, 'startDate')}
            />
          </div>
          <div className="date-filter">
            <label>إلى:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange(e, 'endDate')}
            />
          </div>
        </div>
      </div>
      
      {filteredLogs.length === 0 ? (
        <div className="no-logs">
          <p>لا توجد سجلات مزامنة تطابق المعايير المحددة.</p>
        </div>
      ) : (
        <div className="sync-log-table-container">
          <table className="sync-log-table">
            <thead>
              <tr>
                <th>التاريخ والوقت</th>
                <th>قاعدة المزامنة</th>
                <th>المتجر المصدر</th>
                <th>المتجر الهدف</th>
                <th>الحالة</th>
                <th>الرسالة</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log) => (
                <tr key={log.id} className={`log-row log-${log.status}`}>
                  <td className="log-date">
                    {new Date(log.createdAt).toLocaleString('ar-SA')}
                  </td>
                  <td className="log-rule">
                    {log.syncRule ? log.syncRule.name : '-'}
                  </td>
                  <td className="log-source">
                    {log.sourceStore ? log.sourceStore.name : '-'}
                  </td>
                  <td className="log-target">
                    {log.targetStore ? log.targetStore.name : '-'}
                  </td>
                  <td className="log-status">
                    <LogStatusBadge status={log.status} />
                  </td>
                  <td className="log-message">
                    <div className="message-content">
                      {log.message}
                      {log.details && (
                        <div className="log-details-toggle">
                          <details>
                            <summary>تفاصيل</summary>
                            <pre className="log-details">{log.details}</pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {filteredLogs.length > logsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>تأكيد مسح السجلات</h3>
            <p>هل أنت متأكد من رغبتك في مسح جميع سجلات المزامنة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="modal-actions">
              <button className="danger-button" onClick={confirmClearLogs}>مسح</button>
              <button className="secondary-button" onClick={cancelClearLogs}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncLogList;