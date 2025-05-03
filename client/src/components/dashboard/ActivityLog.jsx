import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSync } from '../../hooks/useSync';
import Card from '../common/Card';
import Loader from '../common/Loader';

const ActivityLog = ({ limit = 5, className }) => {
  const { getLogs } = useSync();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await getLogs({ page: 1, limit });
        setLogs(response.logs);
      } catch (err) {
        setError('فشل تحميل سجل النشاط');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [getLogs, limit]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'in_progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'product':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'inventory':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'order':
        return (
          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionText = (log) => {
    const { type, action, status } = log;
    
    if (type === 'product') {
      if (action === 'sync') {
        return 'مزامنة المنتجات';
      }
      return 'إدارة المنتجات';
    } else if (type === 'inventory') {
      if (action === 'sync') {
        return 'مزامنة المخزون';
      }
      return 'تحديث المخزون';
    } else if (type === 'order') {
      if (action === 'sync') {
        return 'مزامنة الطلبات';
      }
      return 'إدارة الطلبات';
    }
    
    return 'عملية غير معروفة';
  };

  return (
    <Card
      title="سجل النشاط الأخير"
      className={className}
      footer={
        <a href="/sync/logs" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          عرض كل الأنشطة
        </a>
      }
    >
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader text="جاري تحميل الأنشطة..." />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500 py-4">لا توجد أنشطة لعرضها</div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {logs.map((log, index) => (
              <li key={log.id}>
                <div className="relative pb-8">
                  {index !== logs.length - 1 && (
                    <span
                      className="absolute top-4 right-4 -mr-4 h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3 space-x-reverse">
                    <div className="flex-shrink-0 h-8">{getActivityIcon(log.type)}</div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">{getActionText(log)}</span>
                        <span className={`text-sm ${getStatusColor(log.status)}`}>
                          {log.status === 'completed' ? 'مكتمل' : log.status === 'failed' ? 'فشل' : 'قيد التنفيذ'}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-sm text-gray-500">
                        <div>
                          <span className="font-medium text-gray-700">{log.source_store_name}</span>
                          {' '}إلى{' '}
                          <span className="font-medium text-gray-700">{log.target_store_name}</span>
                        </div>
                        <div className="ml-2">{formatDate(log.created_at)}</div>
                      </div>
                      {log.status === 'failed' && log.error && (
                        <div className="mt-1 text-sm text-red-500">
                          <span className="font-medium">خطأ:</span> {log.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

ActivityLog.propTypes = {
  limit: PropTypes.number,
  className: PropTypes.string
};

export default ActivityLog;