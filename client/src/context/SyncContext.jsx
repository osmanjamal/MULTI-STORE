import React, { createContext, useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/sync';

// إنشاء سياق المزامنة
export const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const [syncRules, setSyncRules] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});
  
  // وظيفة جلب قواعد المزامنة
  const fetchSyncRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rules = await syncService.getSyncRules();
      setSyncRules(rules);
      
      // تحديث حالة المزامنة
      const statusMap = {};
      rules.forEach(rule => {
        statusMap[rule.id] = rule.lastSyncStatus || 'idle';
      });
      setSyncStatus(statusMap);
      
      return rules;
    } catch (err) {
      console.error('فشل جلب قواعد المزامنة:', err);
      setError(err.message || 'فشل جلب قواعد المزامنة. يرجى المحاولة مرة أخرى.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // جلب قواعد المزامنة عند تحميل المكون
  useEffect(() => {
    fetchSyncRules();
  }, [fetchSyncRules]);
  
  // وظيفة جلب سجلات المزامنة
  const fetchSyncLogs = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const logs = await syncService.getSyncLogs(filters);
      setSyncLogs(logs);
      
      return logs;
    } catch (err) {
      console.error('فشل جلب سجلات المزامنة:', err);
      setError(err.message || 'فشل جلب سجلات المزامنة. يرجى المحاولة مرة أخرى.');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة جلب قاعدة مزامنة واحدة
  const getSyncRule = async (ruleId) => {
    try {
      setLoading(true);
      setError(null);
      
      const rule = await syncService.getSyncRuleById(ruleId);
      return rule;
    } catch (err) {
      console.error(`فشل جلب قاعدة المزامنة (المعرف: ${ruleId}):`, err);
      setError(err.message || 'فشل جلب بيانات قاعدة المزامنة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة إنشاء قاعدة مزامنة جديدة
  const createSyncRule = async (ruleData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newRule = await syncService.createSyncRule(ruleData);
      
      // تحديث القائمة
      setSyncRules(prevRules => [...prevRules, newRule]);
      
      // تحديث حالة المزامنة
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        [newRule.id]: 'idle'
      }));
      
      return newRule;
    } catch (err) {
      console.error('فشل إنشاء قاعدة المزامنة:', err);
      setError(err.message || 'فشل إنشاء قاعدة المزامنة. يرجى التحقق من البيانات والمحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تحديث قاعدة مزامنة
  const updateSyncRule = async (ruleId, updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedRule = await syncService.updateSyncRule(ruleId, updatedData);
      
      // تحديث القائمة
      setSyncRules(prevRules => prevRules.map(rule => 
        rule.id === ruleId ? updatedRule : rule
      ));
      
      return updatedRule;
    } catch (err) {
      console.error(`فشل تحديث قاعدة المزامنة (المعرف: ${ruleId}):`, err);
      setError(err.message || 'فشل تحديث بيانات قاعدة المزامنة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة حذف قاعدة مزامنة
  const deleteSyncRule = async (ruleId) => {
    try {
      setLoading(true);
      setError(null);
      
      await syncService.deleteSyncRule(ruleId);
      
      // تحديث القائمة
      setSyncRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
      
      // تحديث حالة المزامنة
      setSyncStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        delete newStatus[ruleId];
        return newStatus;
      });
      
      return true;
    } catch (err) {
      console.error(`فشل حذف قاعدة المزامنة (المعرف: ${ruleId}):`, err);
      setError(err.message || 'فشل حذف قاعدة المزامنة. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تشغيل أو إيقاف قاعدة مزامنة
  const toggleSyncRule = async (ruleId, isActive) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedRule = await syncService.toggleSyncRule(ruleId, isActive);
      
      // تحديث القائمة
      setSyncRules(prevRules => prevRules.map(rule => 
        rule.id === ruleId ? updatedRule : rule
      ));
      
      return updatedRule;
    } catch (err) {
      console.error(`فشل تغيير حالة قاعدة المزامنة (المعرف: ${ruleId}):`, err);
      setError(err.message || 'فشل تغيير حالة قاعدة المزامنة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تشغيل قاعدة مزامنة يدوياً
  const runSyncRule = async (ruleId) => {
    try {
      setLoading(true);
      setError(null);
      
      // تحديث حالة المزامنة
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        [ruleId]: 'running'
      }));
      
      const result = await syncService.runSyncRule(ruleId);
      
      // تحديث حالة المزامنة بناءً على النتيجة
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        [ruleId]: result.success ? 'success' : 'error'
      }));
      
      // تحديث آخر تشغيل في قائمة القواعد
      setSyncRules(prevRules => prevRules.map(rule => 
        rule.id === ruleId ? { 
          ...rule, 
          lastRunAt: new Date().toISOString(),
          lastSyncStatus: result.success ? 'success' : 'error'
        } : rule
      ));
      
      // إضافة السجل إلى قائمة السجلات
      if (result.log) {
        setSyncLogs(prevLogs => [result.log, ...prevLogs]);
      }
      
      return result;
    } catch (err) {
      console.error(`فشل تشغيل قاعدة المزامنة (المعرف: ${ruleId}):`, err);
      setError(err.message || 'فشل تشغيل قاعدة المزامنة. يرجى المحاولة مرة أخرى.');
      
      // تحديث حالة المزامنة في حالة الفشل
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        [ruleId]: 'error'
      }));
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تشغيل جميع قواعد المزامنة
  const runAllSyncRules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // تحديث حالة كل القواعد النشطة
      const activeRuleIds = syncRules
        .filter(rule => rule.isActive)
        .map(rule => rule.id);
      
      const newStatus = { ...syncStatus };
      activeRuleIds.forEach(id => {
        newStatus[id] = 'running';
      });
      setSyncStatus(newStatus);
      
      const results = await syncService.runAllSyncRules();
      
      // تحديث حالة المزامنة لكل قاعدة
      const updatedStatus = { ...newStatus };
      results.forEach(result => {
        updatedStatus[result.ruleId] = result.success ? 'success' : 'error';
      });
      setSyncStatus(updatedStatus);
      
      // تحديث آخر تشغيل في القائمة
      const now = new Date().toISOString();
      setSyncRules(prevRules => prevRules.map(rule => {
        const result = results.find(r => r.ruleId === rule.id);
        if (result) {
          return {
            ...rule,
            lastRunAt: now,
            lastSyncStatus: result.success ? 'success' : 'error'
          };
        }
        return rule;
      }));
      
      // إضافة السجلات إلى قائمة السجلات
      if (results.length > 0 && results[0].logs) {
        setSyncLogs(prevLogs => [...results[0].logs, ...prevLogs]);
      }
      
      return results;
    } catch (err) {
      console.error('فشل تشغيل جميع قواعد المزامنة:', err);
      setError(err.message || 'فشل تشغيل جميع قواعد المزامنة. يرجى المحاولة مرة أخرى.');
      
      // إعادة تعيين حالة المزامنة في حالة الفشل
      const errorStatus = { ...syncStatus };
      Object.keys(errorStatus).forEach(id => {
        if (errorStatus[id] === 'running') {
          errorStatus[id] = 'error';
        }
      });
      setSyncStatus(errorStatus);
      
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة مسح سجلات المزامنة
  const clearSyncLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await syncService.clearSyncLogs();
      setSyncLogs([]);
      
      return true;
    } catch (err) {
      console.error('فشل مسح سجلات المزامنة:', err);
      setError(err.message || 'فشل مسح سجلات المزامنة. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تصدير سجلات المزامنة
  const exportSyncLogs = async (logs = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const logsToExport = logs || syncLogs;
      const result = await syncService.exportSyncLogs(logsToExport);
      return result;
    } catch (err) {
      console.error('فشل تصدير سجلات المزامنة:', err);
      setError(err.message || 'فشل تصدير سجلات المزامنة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة جلب إعدادات المزامنة
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const syncSettings = await syncService.getSettings();
      setSettings(syncSettings);
      
      return syncSettings;
    } catch (err) {
      console.error('فشل جلب إعدادات المزامنة:', err);
      setError(err.message || 'فشل جلب إعدادات المزامنة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تحديث إعدادات المزامنة
  const updateSettings = async (updatedSettings) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await syncService.updateSettings(updatedSettings);
      setSettings(result);
      
      return result;
    } catch (err) {
      console.error('فشل تحديث إعدادات المزامنة:', err);
      setError(err.message || 'فشل تحديث إعدادات المزامنة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة التحقق من حالة المزامنة الحالية
  const checkSyncStatus = async (ruleId = null) => {
    try {
      if (ruleId) {
        // التحقق من حالة قاعدة مزامنة محددة
        const status = await syncService.checkSyncStatus(ruleId);
        
        // تحديث حالة المزامنة
        setSyncStatus(prevStatus => ({
          ...prevStatus,
          [ruleId]: status.status
        }));
        
        return status;
      } else {
        // التحقق من حالة جميع قواعد المزامنة
        const statuses = await syncService.checkAllSyncStatus();
        
        // تحديث حالة المزامنة لكل قاعدة
        const newStatus = { ...syncStatus };
        statuses.forEach(status => {
          newStatus[status.ruleId] = status.status;
        });
        setSyncStatus(newStatus);
        
        return statuses;
      }
    } catch (err) {
      console.error('فشل التحقق من حالة المزامنة:', err);
      setError(err.message || 'فشل التحقق من حالة المزامنة. يرجى المحاولة مرة أخرى.');
      return ruleId ? { status: 'error' } : [];
    }
  };
  
  // وظيفة إيقاف عملية مزامنة قيد التنفيذ
  const stopSyncProcess = async (ruleId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await syncService.stopSyncProcess(ruleId);
      
      // تحديث حالة المزامنة
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        [ruleId]: 'stopped'
      }));
      
      return result;
    } catch (err) {
      console.error(`فشل إيقاف عملية المزامنة (المعرف: ${ruleId}):`, err);
      setError(err.message || 'فشل إيقاف عملية المزامنة. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // القيم التي سيتم توفيرها من خلال السياق
  const contextValue = {
    syncRules,
    syncLogs,
    settings,
    loading,
    error,
    syncStatus,
    fetchSyncRules,
    getSyncRule,
    createSyncRule,
    updateSyncRule,
    deleteSyncRule,
    toggleSyncRule,
    runSyncRule,
    runAllSyncRules,
    fetchSyncLogs,
    clearSyncLogs,
    exportSyncLogs,
    fetchSettings,
    updateSettings,
    checkSyncStatus,
    stopSyncProcess,
    clearError: () => setError(null)
  };
  
  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
};

export default SyncProvider;