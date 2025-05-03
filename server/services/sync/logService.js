const { logger } = require('../../utils/logger');
const SyncLog = require('../../models/syncLog');
const SyncRule = require('../../models/syncRule');
const Store = require('../../models/store');

/**
 * إنشاء سجل مزامنة جديد
 */
exports.createLog = async (logData) => {
  return await SyncLog.create(logData);
};

/**
 * جلب سجلات المزامنة للمستخدم
 */
exports.getLogs = async (userId, filters = {}, page = 1, limit = 20) => {
  return await SyncLog.search(filters, userId, page, limit);
};

/**
 * جلب سجل مزامنة محدد
 */
exports.getLog = async (id) => {
  return await SyncLog.findById(id);
};

/**
 * جلب سجلات المزامنة للمتجر المصدر
 */
exports.getLogsBySourceStore = async (sourceStoreId, userId, page = 1, limit = 20) => {
  return await SyncLog.findBySourceStoreId(sourceStoreId, userId, page, limit);
};

/**
 * جلب سجلات المزامنة للمتجر الهدف
 */
exports.getLogsByTargetStore = async (targetStoreId, userId, page = 1, limit = 20) => {
  return await SyncLog.findByTargetStoreId(targetStoreId, userId, page, limit);
};

/**
 * جلب سجلات المزامنة لقاعدة مزامنة
 */
exports.getLogsBySyncRule = async (syncRuleId, userId, page = 1, limit = 20) => {
  return await SyncLog.findBySyncRuleId(syncRuleId, userId, page, limit);
};

/**
 * تحليل سجلات المزامنة للحصول على إحصائيات
 */
exports.analyzeLogs = async (userId, timeRange = '7d') => {
  logger.info(`تحليل سجلات المزامنة للمستخدم ${userId} للفترة ${timeRange}`);
  
  // تحويل الفترة الزمنية إلى تاريخ
  const startDate = calculateStartDate(timeRange);
  
  // الحصول على البيانات الأساسية
  const { pool } = require('../../config/database');
  
  const rulesResult = await pool.query(
    `SELECT r.id, r.name, r.source_store_id, r.target_store_id, r.type, r.is_active,
            s1.name AS source_store_name, s2.name AS target_store_name,
            COUNT(l.id) AS total_logs,
            COUNT(CASE WHEN l.status = 'completed' THEN 1 END) AS completed_logs,
            COUNT(CASE WHEN l.status = 'failed' THEN 1 END) AS failed_logs
     FROM sync_rules r
     JOIN stores s1 ON r.source_store_id = s1.id
     JOIN stores s2 ON r.target_store_id = s2.id
     LEFT JOIN sync_logs l ON r.id = l.sync_rule_id AND l.created_at >= $1
     WHERE s1.user_id = $2 AND s2.user_id = $2
     GROUP BY r.id, r.name, r.source_store_id, r.target_store_id, r.type, r.is_active, s1.name, s2.name
     ORDER BY total_logs DESC`,
    [startDate, userId]
  );
  
  const typesResult = await pool.query(
    `SELECT l.type, l.status,
            COUNT(*) AS count,
            MIN(l.created_at) AS first_sync,
            MAX(l.created_at) AS last_sync
     FROM sync_logs l
     JOIN sync_rules r ON l.sync_rule_id = r.id
     JOIN stores s1 ON r.source_store_id = s1.id
     JOIN stores s2 ON r.target_store_id = s2.id
     WHERE s1.user_id = $1 AND s2.user_id = $1 AND l.created_at >= $2
     GROUP BY l.type, l.status
     ORDER BY l.type, l.status`,
    [userId, startDate]
  );
  
  const recentLogsResult = await pool.query(
    `SELECT l.id, l.sync_rule_id, l.source_store_id, l.target_store_id,
            l.type, l.status, l.action, l.entity_type, l.entity_id,
            l.created_at,
            s1.name AS source_store_name, s2.name AS target_store_name,
            r.name AS rule_name
     FROM sync_logs l
     JOIN sync_rules r ON l.sync_rule_id = r.id
     JOIN stores s1 ON l.source_store_id = s1.id
     JOIN stores s2 ON l.target_store_id = s2.id
     WHERE s1.user_id = $1 AND s2.user_id = $1 AND l.created_at >= $2
     ORDER BY l.created_at DESC
     LIMIT 10`,
    [userId, startDate]
  );
  
  return {
    timeRange,
    startDate,
    rules: rulesResult.rows,
    syncTypes: typesResult.rows,
    recentLogs: recentLogsResult.rows
  };
};

/**
 * حساب تاريخ البداية بناءً على الفترة الزمنية
 */
function calculateStartDate(timeRange) {
  const now = new Date();
  
  switch (timeRange) {
    case '1d':
      return new Date(now.setDate(now.getDate() - 1));
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '30d':
      return new Date(now.setDate(now.getDate() - 30));
    case '90d':
      return new Date(now.setDate(now.getDate() - 90));
    default:
      return new Date(now.setDate(now.getDate() - 7));
  }
}