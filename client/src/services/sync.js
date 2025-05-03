import { get, post, put, del, download } from './api';

/**
 * خدمة المزامنة
 * توفر وظائف للتعامل مع قواعد وعمليات المزامنة
 */
export const syncService = {
  /**
   * جلب قائمة قواعد المزامنة
   * @returns {Promise} وعد بقائمة قواعد المزامنة
   */
  async getSyncRules() {
    try {
      const response = await get('/sync/rules');
      return response.rules;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب قاعدة مزامنة محددة
   * @param {string} ruleId - معرف القاعدة
   * @returns {Promise} وعد ببيانات القاعدة
   */
  async getSyncRuleById(ruleId) {
    try {
      const response = await get(`/sync/rules/${ruleId}`);
      return response.rule;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إنشاء قاعدة مزامنة جديدة
   * @param {Object} ruleData - بيانات القاعدة
   * @returns {Promise} وعد ببيانات القاعدة الجديدة
   */
  async createSyncRule(ruleData) {
    try {
      const response = await post('/sync/rules', ruleData);
      return response.rule;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث قاعدة مزامنة
   * @param {string} ruleId - معرف القاعدة
   * @param {Object} updatedData - البيانات المحدثة
   * @returns {Promise} وعد ببيانات القاعدة المحدثة
   */
  async updateSyncRule(ruleId, updatedData) {
    try {
      const response = await put(`/sync/rules/${ruleId}`, updatedData);
      return response.rule;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حذف قاعدة مزامنة
   * @param {string} ruleId - معرف القاعدة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async deleteSyncRule(ruleId) {
    try {
      const response = await del(`/sync/rules/${ruleId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تفعيل أو تعطيل قاعدة مزامنة
   * @param {string} ruleId - معرف القاعدة
   * @param {boolean} isActive - حالة التفعيل
   * @returns {Promise} وعد ببيانات القاعدة المحدثة
   */
  async toggleSyncRule(ruleId, isActive) {
    try {
      const response = await put(`/sync/rules/${ruleId}/toggle`, { isActive });
      return response.rule;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تشغيل قاعدة مزامنة يدوياً
   * @param {string} ruleId - معرف القاعدة
   * @returns {Promise} وعد بنتيجة عملية المزامنة
   */
  async runSyncRule(ruleId) {
    try {
      const response = await post(`/sync/rules/${ruleId}/run`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تشغيل جميع قواعد المزامنة
   * @returns {Promise} وعد بنتائج عمليات المزامنة
   */
  async runAllSyncRules() {
    try {
      const response = await post('/sync/rules/run-all');
      return response.results;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب سجلات المزامنة
   * @param {Object} filters - معايير الفلترة
   * @returns {Promise} وعد بقائمة سجلات المزامنة
   */
  async getSyncLogs(filters = {}) {
    try {
      const response = await get('/sync/logs', filters);
      return response.logs;
    } catch (error) {
      throw error;
    }
  },

  /**
   * مسح سجلات المزامنة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async clearSyncLogs() {
    try {
      const response = await del('/sync/logs');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تصدير سجلات المزامنة
   * @param {Array} logs - سجلات المزامنة (اختياري)
   * @returns {Promise} وعد برابط تنزيل ملف السجلات
   */
  async exportSyncLogs(logs = null) {
    try {
      // إذا تم تمرير السجلات، نقوم بتصديرها مباشرة
      if (logs) {
        // تحويل السجلات إلى تنسيق CSV
        const headers = ['التاريخ', 'القاعدة', 'المتجر المصدر', 'المتجر الهدف', 'الحالة', 'الرسالة'];
        const csvRows = [headers.join(',')];

        logs.forEach(log => {
          const sourceName = log.sourceStore ? log.sourceStore.name : '-';
          const targetName = log.targetStore ? log.targetStore.name : '-';
          const ruleName = log.syncRule ? log.syncRule.name : '-';
          
          const row = [
            new Date(log.createdAt).toLocaleString(),
            ruleName,
            sourceName,
            targetName,
            log.status,
            `"${log.message.replace(/"/g, '""')}"`
          ];
          
          csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // إنشاء عنصر رابط وتنزيل الملف
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sync_logs_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return { success: true, url };
      } else {
        // طلب تصدير السجلات من الخادم
        const response = await download(
          '/sync/logs/export',
          {},
          `sync_logs_${new Date().toISOString()}.csv`
        );
        return response;
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب إعدادات المزامنة
   * @returns {Promise} وعد بإعدادات المزامنة
   */
  async getSettings() {
    try {
      const response = await get('/sync/settings');
      return response.settings;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث إعدادات المزامنة
   * @param {Object} updatedSettings - الإعدادات المحدثة
   * @returns {Promise} وعد بالإعدادات المحدثة
   */
  async updateSettings(updatedSettings) {
    try {
      const response = await put('/sync/settings', updatedSettings);
      return response.settings;
    } catch (error) {
      throw error;
    }
  },

  /**
   * التحقق من حالة المزامنة
   * @param {string} ruleId - معرف القاعدة
   * @returns {Promise} وعد بحالة المزامنة
   */
  async checkSyncStatus(ruleId) {
    try {
      const response = await get(`/sync/rules/${ruleId}/status`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * التحقق من حالة جميع عمليات المزامنة
   * @returns {Promise} وعد بحالة جميع عمليات المزامنة
   */
  async checkAllSyncStatus() {
    try {
      const response = await get('/sync/status');
      return response.statuses;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إيقاف عملية مزامنة قيد التنفيذ
   * @param {string} ruleId - معرف القاعدة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async stopSyncProcess(ruleId) {
    try {
      const response = await post(`/sync/rules/${ruleId}/stop`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إنشاء نسخة احتياطية لقواعد المزامنة
   * @returns {Promise} وعد برابط تنزيل النسخة الاحتياطية
   */
  async backupSyncRules() {
    try {
      const response = await download(
        '/sync/rules/backup',
        {},
        `sync_rules_backup_${new Date().toISOString()}.json`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * استعادة قواعد المزامنة من نسخة احتياطية
   * @param {FormData} backupFile - ملف النسخة الاحتياطية
   * @returns {Promise} وعد بنتيجة العملية
   */
  async restoreSyncRules(backupFile) {
    try {
      const response = await post('/sync/rules/restore', backupFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * الحصول على إحصائيات المزامنة
   * @param {Object} dateRange - نطاق التاريخ
   * @returns {Promise} وعد بإحصائيات المزامنة
   */
  async getSyncStatistics(dateRange = {}) {
    try {
      const response = await get('/sync/statistics', dateRange);
      return response.statistics;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حل نزاعات المزامنة
   * @param {string} conflictId - معرف النزاع
   * @param {string} resolution - نوع الحل (source, target, manual)
   * @param {Object} manualData - بيانات الحل اليدوي (في حالة الحل اليدوي)
   * @returns {Promise} وعد بنتيجة العملية
   */
  async resolveConflict(conflictId, resolution, manualData = null) {
    try {
      const response = await post(`/sync/conflicts/${conflictId}/resolve`, {
        resolution,
        manualData,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب قائمة نزاعات المزامنة
   * @returns {Promise} وعد بقائمة النزاعات
   */
  async getSyncConflicts() {
    try {
      const response = await get('/sync/conflicts');
      return response.conflicts;
    } catch (error) {
      throw error;
    }
  }
};

export default syncService;