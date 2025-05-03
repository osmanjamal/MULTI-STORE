const { logger } = require('../utils/logger');
const SyncLog = require('../models/syncLog');
const appConfig = require('../config/app');

/**
 * تنظيف سجلات المزامنة القديمة
 * @param {number} days - عدد الأيام للاحتفاظ بالسجلات (الافتراضي 30 يوم)
 * @returns {Promise<number>} - عدد السجلات المحذوفة
 */
const cleanupOldLogs = async (days = 30) => {
  try {
    logger.info(`بدء تنظيف سجلات المزامنة الأقدم من ${days} يوم`);
    
    // حذف سجلات المزامنة القديمة باستخدام نموذج SyncLog
    const deletedCount = await SyncLog.deleteOldLogs(days);
    
    logger.info(`تم حذف ${deletedCount} سجل مزامنة قديم بنجاح`);
    return deletedCount;
  } catch (error) {
    logger.error('حدث خطأ أثناء تنظيف سجلات المزامنة القديمة:', error);
    throw error;
  }
};

/**
 * تنظيف سجلات المزامنة الفاشلة للمحاولة مرة أخرى
 * @returns {Promise<number>} - عدد السجلات المعاد محاولتها
 */
const cleanupFailedLogs = async () => {
  try {
    logger.info('بدء تنظيف سجلات المزامنة الفاشلة للمحاولة مرة أخرى');
    
    // فحص ما إذا كان إعادة المحاولة مفعلة في الإعدادات
    if (!appConfig.sync.retryFailedSyncs) {
      logger.info('إعادة محاولة المزامنات الفاشلة غير مفعلة في الإعدادات');
      return 0;
    }
    
    // الحصول على سجلات المزامنة الفاشلة المؤهلة لإعادة المحاولة
    const failedLogsResult = await pool.query(
      `SELECT id, sync_rule_id, source_store_id, target_store_id, type,
              action, entity_type, entity_id, details
       FROM sync_logs
       WHERE status = 'failed'
       AND created_at > NOW() - INTERVAL '1 day'
       AND (details->>'retryCount')::integer < $1
       ORDER BY created_at DESC`,
      [appConfig.sync.maxRetries]
    );
    
    const failedLogs = failedLogsResult.rows;
    
    if (failedLogs.length === 0) {
      logger.info('لا توجد سجلات مزامنة فاشلة مؤهلة لإعادة المحاولة');
      return 0;
    }
    
    logger.info(`وجدت ${failedLogs.length} سجل مزامنة فاشل مؤهل لإعادة المحاولة`);
    
    // إضافة المزامنات الفاشلة لقائمة الانتظار لإعادة المحاولة
    // هذا الجزء سيعتمد على كيفية تنفيذ قائمة الانتظار في التطبيق
    // يمكن استخدام خدمة مثل Bull أو نظام قائمة انتظار مخصص
    
    return failedLogs.length;
  } catch (error) {
    logger.error('حدث خطأ أثناء تنظيف سجلات المزامنة الفاشلة:', error);
    throw error;
  }
};

module.exports = {
  cleanupOldLogs,
  cleanupFailedLogs
};