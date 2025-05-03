import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSync } from '../../hooks/useSync';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';

const SyncStatus = ({ className }) => {
  const { getActiveSyncRules, runSync } = useSync();
  const [syncRules, setSyncRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingRuleId, setSyncingRuleId] = useState(null);

  useEffect(() => {
    const fetchSyncRules = async () => {
      try {
        setLoading(true);
        const rules = await getActiveSyncRules();
        setSyncRules(rules);
      } catch (err) {
        setError('فشل تحميل قواعد المزامنة النشطة');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSyncRules();
  }, [getActiveSyncRules]);

  const handleSync = async (ruleId) => {
    try {
      setSyncingRuleId(ruleId);
      await runSync(ruleId);
      
      // تحديث قائمة قواعد المزامنة بعد النجاح
      const rules = await getActiveSyncRules();
      setSyncRules(rules);
    } catch (err) {
      console.error(err);
      // يمكن هنا إضافة معالجة الخطأ، مثل عرض رسالة خطأ
    } finally {
      setSyncingRuleId(null);
    }
  };

  // دالة مساعدة لتحديد لون حالة المزامنة
  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'never':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // دالة مساعدة للحصول على نص حالة المزامنة
  const getSyncStatusText = (rule) => {
    if (!rule.last_sync) {
      return 'لم تتم المزامنة بعد';
    }

    if (rule.last_sync_status === 'failed') {
      return 'فشلت آخر مزامنة';
    }

    if (rule.last_sync_status === 'in_progress') {
      return 'المزامنة قيد التنفيذ';
    }

    // تنسيق تاريخ آخر مزامنة
    const lastSyncDate = new Date(rule.last_sync);
    const now = new Date();
    const diffMs = now - lastSyncDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `آخر مزامنة منذ ${diffMins} دقيقة`;
    } else if (diffHours < 24) {
      return `آخر مزامنة منذ ${diffHours} ساعة`;
    } else {
      return `آخر مزامنة منذ ${diffDays} يوم`;
    }
  };

  // دالة مساعدة للحصول على نوع المزامنة
  const getSyncTypeText = (type) => {
    switch (type) {
      case 'product':
        return 'منتجات';
      case 'inventory':
        return 'مخزون';
      case 'order':
        return 'طلبات';
      default:
        return type;
    }
  };

  return (
    <Card
      title="حالة المزامنة"
      className={className}
      footer={
        <a href="/sync/rules" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          إدارة قواعد المزامنة
        </a>
      }
    >
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader text="جاري تحميل حالة المزامنة..." />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : syncRules.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <p className="mb-4">لا توجد قواعد مزامنة نشطة.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = '/sync/rules/new'}
          >
            إنشاء قاعدة مزامنة
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {syncRules.map((rule) => (
            <div key={rule.id} className="py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{rule.name}</span>
                  <span className="mr-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {getSyncTypeText(rule.type)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">{rule.source_store_name}</span>
                  {' '}إلى{' '}
                  <span className="font-medium">{rule.target_store_name}</span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSyncStatusColor(
                      rule.last_sync_status
                    )}`}
                  >
                    {getSyncStatusText(rule)}
                  </span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                loading={syncingRuleId === rule.id}
                onClick={() => handleSync(rule.id)}
                disabled={syncingRuleId !== null}
              >
                مزامنة الآن
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

SyncStatus.propTypes = {
  className: PropTypes.string
};

export default SyncStatus;