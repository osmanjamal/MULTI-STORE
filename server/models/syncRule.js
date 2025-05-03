const { pool } = require('../config/database');

/**
 * نموذج قاعدة المزامنة
 */
const SyncRule = {
  /**
   * إنشاء قاعدة مزامنة جديدة
   * @param {Object} ruleData - بيانات قاعدة المزامنة
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<Object>} - قاعدة المزامنة المنشأة
   */
  async create(ruleData, userId) {
    const {
      name,
      sourceStoreId,
      targetStoreId,
      type,
      conditions,
      transformations,
      isActive,
      schedule
    } = ruleData;
    
    // التحقق من أن المتاجر موجودة وتنتمي للمستخدم
    const storesResult = await pool.query(
      `SELECT id FROM stores
       WHERE (id = $1 OR id = $2) AND user_id = $3`,
      [sourceStoreId, targetStoreId, userId]
    );
    
    if (storesResult.rowCount !== 2) {
      throw new Error('المتاجر غير موجودة أو لا تنتمي للمستخدم');
    }
    
    // إنشاء قاعدة المزامنة
    const result = await pool.query(
      `INSERT INTO sync_rules (
         name, source_store_id, target_store_id, type, conditions,
         transformations, is_active, schedule
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, source_store_id, target_store_id, type,
                 conditions, transformations, is_active, schedule, created_at`,
      [
        name, sourceStoreId, targetStoreId, type,
        JSON.stringify(conditions || {}), JSON.stringify(transformations || {}),
        isActive, schedule
      ]
    );
    
    const rule = result.rows[0];
    
    // تحويل JSON إلى كائنات
    rule.conditions = JSON.parse(rule.conditions);
    rule.transformations = JSON.parse(rule.transformations);
    
    return rule;
  },
  
  /**
   * الحصول على قاعدة مزامنة بواسطة المعرف
   * @param {number} id - معرف قاعدة المزامنة
   * @returns {Promise<Object>} - قاعدة المزامنة المطلوبة
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT r.id, r.name, r.source_store_id, r.target_store_id, r.type,
              r.conditions, r.transformations, r.is_active, r.schedule,
              r.created_at, r.updated_at,
              s1.name AS source_store_name, s1.type AS source_store_type,
              s2.name AS target_store_name, s2.type AS target_store_type
       FROM sync_rules r
       JOIN stores s1 ON r.source_store_id = s1.id
       JOIN stores s2 ON r.target_store_id = s2.id
       WHERE r.id = $1`,
      [id]
    );
    
    const rule = result.rows[0];
    
    if (rule) {
      // تحويل JSON إلى كائنات
      rule.conditions = JSON.parse(rule.conditions || '{}');
      rule.transformations = JSON.parse(rule.transformations || '{}');
    }
    
    return rule || null;
  },
  
  /**
   * الحصول على قواعد المزامنة بواسطة المستخدم
   * @param {number} userId - معرف المستخدم
   * @returns {Promise<Array>} - قائمة قواعد المزامنة
   */
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT r.id, r.name, r.source_store_id, r.target_store_id, r.type,
              r.conditions, r.transformations, r.is_active, r.schedule,
              r.created_at, r.updated_at,
              s1.name AS source_store_name, s1.type AS source_store_type,
              s2.name AS target_store_name, s2.type AS target_store_type
       FROM sync_rules r
       JOIN stores s1 ON r.source_store_id = s1.id
       JOIN stores s2 ON r.target_store_id = s2.id
       WHERE s1.user_id = $1 AND s2.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(rule => ({
      ...rule,
      conditions: JSON.parse(rule.conditions || '{}'),
      transformations: JSON.parse(rule.transformations || '{}')
    }));
  },
  
  /**
   * الحصول على قواعد المزامنة النشطة بواسطة المتجر المصدر
   * @param {number} sourceStoreId - معرف المتجر المصدر
   * @param {string} type - نوع القاعدة
   * @returns {Promise<Array>} - قائمة قواعد المزامنة
   */
  async findActiveBySourceStore(sourceStoreId, type = null) {
    let query = `
      SELECT r.id, r.name, r.source_store_id, r.target_store_id, r.type,
             r.conditions, r.transformations, r.schedule,
             r.created_at, r.updated_at,
             s1.name AS source_store_name, s1.type AS source_store_type,
             s2.name AS target_store_name, s2.type AS target_store_type
      FROM sync_rules r
      JOIN stores s1 ON r.source_store_id = s1.id
      JOIN stores s2 ON r.target_store_id = s2.id
      WHERE r.source_store_id = $1 AND r.is_active = true
    `;
    
    const values = [sourceStoreId];
    
    if (type) {
      query += ` AND r.type = $2`;
      values.push(type);
    }
    
    query += ` ORDER BY r.created_at ASC`;
    
    const result = await pool.query(query, values);
    
    // تحويل JSON إلى كائنات
    return result.rows.map(rule => ({
      ...rule,
      conditions: JSON.parse(rule.conditions || '{}'),
      transformations: JSON.parse(rule.transformations || '{}')
    }));
  },
  
  /**
   * الحصول على قواعد المزامنة النشطة بواسطة المتجر الهدف
   * @param {number} targetStoreId - معرف المتجر الهدف
   * @param {string} type - نوع القاعدة
   * @returns {Promise<Array>} - قائمة قواعد المزامنة
   */
  async findActiveByTargetStore(targetStoreId, type = null) {
    let query = `
      SELECT r.id, r.name, r.source_store_id, r.target_store_id, r.type,
             r.conditions, r.transformations, r.schedule,
             r.created_at, r.updated_at,
             s1.name AS source_store_name, s1.type AS source_store_type,
             s2.name AS target_store_name, s2.type AS target_store_type
      FROM sync_rules r
      JOIN stores s1 ON r.source_store_id = s1.id
      JOIN stores s2 ON r.target_store_id = s2.id
      WHERE r.target_store_id = $1 AND r.is_active = true
    `;
    
    const values = [targetStoreId];
    
    if (type) {
      query += ` AND r.type = $2`;
      values.push(type);
    }
    
    query += ` ORDER BY r.created_at ASC`;
    
    const result = await pool.query(query, values);
    
    // تحويل JSON إلى كائنات
    return result.rows.map(rule => ({
      ...rule,
      conditions: JSON.parse(rule.conditions || '{}'),
      transformations: JSON.parse(rule.transformations || '{}')
    }));
  },
  
  /**
   * تحديث قاعدة مزامنة
   * @param {number} id - معرف قاعدة المزامنة
   * @param {Object} ruleData - بيانات قاعدة المزامنة المحدثة
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<Object>} - قاعدة المزامنة المحدثة
   */
  async update(id, ruleData, userId) {
    const {
      name,
      conditions,
      transformations,
      isActive,
      schedule
    } = ruleData;
    
    // التحقق من أن قاعدة المزامنة موجودة وتنتمي للمستخدم
    const ruleResult = await pool.query(
      `SELECT r.id
       FROM sync_rules r
       JOIN stores s1 ON r.source_store_id = s1.id
       JOIN stores s2 ON r.target_store_id = s2.id
       WHERE r.id = $1 AND s1.user_id = $2 AND s2.user_id = $2`,
      [id, userId]
    );
    
    if (ruleResult.rowCount === 0) {
      throw new Error('قاعدة المزامنة غير موجودة أو لا تنتمي للمستخدم');
    }
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (name !== undefined) {
      updates.push(`name = $${updates.length + 1}`);
      values.push(name);
    }
    
    if (conditions !== undefined) {
      updates.push(`conditions = $${updates.length + 1}`);
      values.push(JSON.stringify(conditions));
    }
    
    if (transformations !== undefined) {
      updates.push(`transformations = $${updates.length + 1}`);
      values.push(JSON.stringify(transformations));
    }
    
    if (isActive !== undefined) {
      updates.push(`is_active = $${updates.length + 1}`);
      values.push(isActive);
    }
    
    if (schedule !== undefined) {
      updates.push(`schedule = $${updates.length + 1}`);
      values.push(schedule);
    }
    
    if (updates.length === 0) {
      return this.findById(id);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // تنفيذ الاستعلام
    values.push(id);
    
    const result = await pool.query(
      `UPDATE sync_rules
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, name, source_store_id, target_store_id, type,
                 conditions, transformations, is_active, schedule, created_at, updated_at`,
      values
    );
    
    const rule = result.rows[0];
    
    // تحويل JSON إلى كائنات
    rule.conditions = JSON.parse(rule.conditions);
    rule.transformations = JSON.parse(rule.transformations);
    
    return rule;
  },
  
  /**
   * حذف قاعدة مزامنة
   * @param {number} id - معرف قاعدة المزامنة
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id, userId) {
    // التحقق من أن قاعدة المزامنة موجودة وتنتمي للمستخدم
    const result = await pool.query(
      `DELETE FROM sync_rules
       WHERE id = $1 AND EXISTS (
         SELECT 1 FROM sync_rules r
         JOIN stores s1 ON r.source_store_id = s1.id
         JOIN stores s2 ON r.target_store_id = s2.id
         WHERE r.id = $1 AND s1.user_id = $2 AND s2.user_id = $2
       )
       RETURNING id`,
      [id, userId]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = SyncRule;