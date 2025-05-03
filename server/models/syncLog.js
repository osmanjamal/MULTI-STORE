const { pool } = require('../config/database');

/**
 * نموذج سجل المزامنة
 */
const SyncLog = {
  /**
   * إنشاء سجل مزامنة جديد
   * @param {Object} logData - بيانات سجل المزامنة
   * @returns {Promise<Object>} - سجل المزامنة المنشأ
   */
  async create(logData) {
    const {
      syncRuleId,
      sourceStoreId,
      targetStoreId,
      type,
      status,
      action,
      entityType,
      entityId,
      externalSourceId,
      externalTargetId,
      details,
      error
    } = logData;
    
    // إنشاء سجل المزامنة
    const result = await pool.query(
      `INSERT INTO sync_logs (
         sync_rule_id, source_store_id, target_store_id, type, status,
         action, entity_type, entity_id, external_source_id, external_target_id,
         details, error
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, sync_rule_id, source_store_id, target_store_id, type,
                 status, action, entity_type, entity_id, external_source_id,
                 external_target_id, created_at`,
      [
        syncRuleId, sourceStoreId, targetStoreId, type, status,
        action, entityType, entityId, externalSourceId, externalTargetId,
        JSON.stringify(details || {}), error
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على سجل مزامنة بواسطة المعرف
   * @param {number} id - معرف سجل المزامنة
   * @returns {Promise<Object>} - سجل المزامنة المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT l.id, l.sync_rule_id, l.source_store_id, l.target_store_id,
              l.type, l.status, l.action, l.entity_type, l.entity_id,
              l.external_source_id, l.external_target_id, l.details,
              l.error, l.created_at,
              s1.name AS source_store_name, s1.type AS source_store_type,
              s2.name AS target_store_name, s2.type AS target_store_type,
              r.name AS sync_rule_name
       FROM sync_logs l
       JOIN stores s1 ON l.source_store_id = s1.id
       JOIN stores s2 ON l.target_store_id = s2.id
       LEFT JOIN sync_rules r ON l.sync_rule_id = r.id
       WHERE l.id = $1`,
      [id]
    );
    
    const log = result.rows[0];
    
    if (log) {
      // تحويل JSON إلى كائن
      log.details = JSON.parse(log.details || '{}');
    }
    
    return log || null;
  },
  
  /**
   * البحث في سجلات المزامنة
   * @param {Object} filters - مرشحات البحث
   * @param {number} userId - معرف المستخدم
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - نتائج البحث
   */
  async search(filters, userId, page = 1, limit = 20) {
    const {
      sourceStoreId,
      targetStoreId,
      syncRuleId,
      type,
      status,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;
    
    const offset = (page - 1) * limit;
    const values = [userId];
    let whereClause = `s1.user_id = $1 AND s2.user_id = $1`;
    
    // إضافة مرشحات البحث
    if (sourceStoreId) {
      values.push(sourceStoreId);
      whereClause += ` AND l.source_store_id = $${values.length}`;
    }
    
    if (targetStoreId) {
      values.push(targetStoreId);
      whereClause += ` AND l.target_store_id = $${values.length}`;
    }
    
    if (syncRuleId) {
      values.push(syncRuleId);
      whereClause += ` AND l.sync_rule_id = $${values.length}`;
    }
    
    if (type) {
      values.push(type);
      whereClause += ` AND l.type = $${values.length}`;
    }
    
    if (status) {
      values.push(status);
      whereClause += ` AND l.status = $${values.length}`;
    }
    
    if (action) {
      values.push(action);
      whereClause += ` AND l.action = $${values.length}`;
    }
    
    if (entityType) {
      values.push(entityType);
      whereClause += ` AND l.entity_type = $${values.length}`;
    }
    
    if (entityId) {
      values.push(entityId);
      whereClause += ` AND l.entity_id = $${values.length}`;
    }
    
    if (startDate) {
      values.push(startDate);
      whereClause += ` AND l.created_at >= $${values.length}`;
    }
    
    if (endDate) {
      values.push(endDate);
      whereClause += ` AND l.created_at <= $${values.length}`;
    }
    
    // التحقق من صحة حقل الفرز
    const validSortFields = ['created_at', 'type', 'status', 'action', 'entity_type'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // استعلام الحصول على سجلات المزامنة
    const logsQuery = `
      SELECT l.id, l.sync_rule_id, l.source_store_id, l.target_store_id,
             l.type, l.status, l.action, l.entity_type, l.entity_id,
             l.external_source_id, l.external_target_id, l.error,
             l.created_at,
             s1.name AS source_store_name, s1.type AS source_store_type,
             s2.name AS target_store_name, s2.type AS target_store_type,
             r.name AS sync_rule_name
      FROM sync_logs l
      JOIN stores s1 ON l.source_store_id = s1.id
      JOIN stores s2 ON l.target_store_id = s2.id
      LEFT JOIN sync_rules r ON l.sync_rule_id = r.id
      WHERE ${whereClause}
      ORDER BY l.${sortField} ${order}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    
    // استعلام الحصول على العدد الإجمالي
    // استعلام الحصول على العدد الإجمالي
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM sync_logs l
      JOIN stores s1 ON l.source_store_id = s1.id
      JOIN stores s2 ON l.target_store_id = s2.id
      LEFT JOIN sync_rules r ON l.sync_rule_id = r.id
      WHERE ${whereClause}
    `;
    
    values.push(limit, offset);
    
    // تنفيذ الاستعلامات
    const [logsResult, countResult] = await Promise.all([
      pool.query(logsQuery, values),
      pool.query(countQuery, values.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    return {
      logs: logsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },
  
  /**
   * الحصول على سجلات المزامنة بواسطة المستخدم
   * @param {number} userId - معرف المستخدم
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - سجلات المزامنة
   */
  async findByUserId(userId, page = 1, limit = 20) {
    return this.search({}, userId, page, limit);
  },
  
  /**
   * الحصول على سجلات المزامنة بواسطة المتجر المصدر
   * @param {number} sourceStoreId - معرف المتجر المصدر
   * @param {number} userId - معرف المستخدم
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - سجلات المزامنة
   */
  async findBySourceStoreId(sourceStoreId, userId, page = 1, limit = 20) {
    return this.search({ sourceStoreId }, userId, page, limit);
  },
  
  /**
   * الحصول على سجلات المزامنة بواسطة المتجر الهدف
   * @param {number} targetStoreId - معرف المتجر الهدف
   * @param {number} userId - معرف المستخدم
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - سجلات المزامنة
   */
  async findByTargetStoreId(targetStoreId, userId, page = 1, limit = 20) {
    return this.search({ targetStoreId }, userId, page, limit);
  },
  
  /**
   * الحصول على سجلات المزامنة بواسطة قاعدة المزامنة
   * @param {number} syncRuleId - معرف قاعدة المزامنة
   * @param {number} userId - معرف المستخدم
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - سجلات المزامنة
   */
  async findBySyncRuleId(syncRuleId, userId, page = 1, limit = 20) {
    return this.search({ syncRuleId }, userId, page, limit);
  },
  
  /**
   * الحصول على سجلات المزامنة لكيان معين
   * @param {string} entityType - نوع الكيان
   * @param {number|string} entityId - معرف الكيان
   * @param {number} userId - معرف المستخدم
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - سجلات المزامنة
   */
  async findByEntity(entityType, entityId, userId, page = 1, limit = 20) {
    return this.search({ entityType, entityId }, userId, page, limit);
  },
  
  /**
   * حذف سجلات المزامنة القديمة
   * @param {number} days - عدد الأيام للاحتفاظ بالسجلات
   * @returns {Promise<number>} - عدد السجلات المحذوفة
   */
  async deleteOldLogs(days = 30) {
    const result = await pool.query(
      `DELETE FROM sync_logs
       WHERE created_at < NOW() - INTERVAL '${days} days'
       RETURNING id`
    );
    
    return result.rowCount;
  }
};

module.exports = SyncLog;