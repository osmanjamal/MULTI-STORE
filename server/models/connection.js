const { pool } = require('../config/database');

/**
 * نموذج الاتصال بين المتاجر
 */
const Connection = {
  /**
   * إنشاء اتصال جديد بين متجرين
   * @param {Object} connectionData - بيانات الاتصال
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<Object>} - الاتصال المنشأ
   */
  async create(connectionData, userId) {
    const {
      sourceStoreId,
      targetStoreId,
      syncProducts,
      syncInventory,
      syncOrders,
      bidirectional
    } = connectionData;
    
    // التحقق من أن المتاجر موجودة وتنتمي للمستخدم
    const storesResult = await pool.query(
      `SELECT id FROM stores
       WHERE (id = $1 OR id = $2) AND user_id = $3`,
      [sourceStoreId, targetStoreId, userId]
    );
    
    if (storesResult.rowCount !== 2) {
      throw new Error('المتاجر غير موجودة أو لا تنتمي للمستخدم');
    }
    
    // التحقق من عدم وجود اتصال بين المتجرين
    const existingConnection = await pool.query(
      `SELECT id FROM connections
       WHERE (source_store_id = $1 AND target_store_id = $2)
          OR (source_store_id = $2 AND target_store_id = $1 AND bidirectional = true)`,
      [sourceStoreId, targetStoreId]
    );
    
    if (existingConnection.rowCount > 0) {
      throw new Error('يوجد اتصال بالفعل بين هذين المتجرين');
    }
    
    // إنشاء الاتصال
    const result = await pool.query(
      `INSERT INTO connections (
         source_store_id, target_store_id, sync_products,
         sync_inventory, sync_orders, bidirectional
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, source_store_id, target_store_id, sync_products,
                 sync_inventory, sync_orders, bidirectional, created_at`,
      [
        sourceStoreId, targetStoreId, syncProducts,
        syncInventory, syncOrders, bidirectional
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على اتصال بواسطة المعرف
   * @param {number} id - معرف الاتصال
   * @returns {Promise<Object>} - الاتصال المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT c.id, c.source_store_id, c.target_store_id, c.sync_products,
              c.sync_inventory, c.sync_orders, c.bidirectional,
              c.created_at, c.updated_at,
              s1.name AS source_store_name, s1.type AS source_store_type,
              s2.name AS target_store_name, s2.type AS target_store_type
       FROM connections c
       JOIN stores s1 ON c.source_store_id = s1.id
       JOIN stores s2 ON c.target_store_id = s2.id
       WHERE c.id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  },
  
  /**
   * الحصول على جميع اتصالات المستخدم
   * @param {number} userId - معرف المستخدم
   * @returns {Promise<Array>} - قائمة الاتصالات
   */
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT c.id, c.source_store_id, c.target_store_id, c.sync_products,
              c.sync_inventory, c.sync_orders, c.bidirectional,
              c.created_at, c.updated_at,
              s1.name AS source_store_name, s1.type AS source_store_type,
              s2.name AS target_store_name, s2.type AS target_store_type
       FROM connections c
       JOIN stores s1 ON c.source_store_id = s1.id
       JOIN stores s2 ON c.target_store_id = s2.id
       WHERE s1.user_id = $1 AND s2.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    return result.rows;
  },
  
  /**
   * الحصول على اتصالات متجر
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Array>} - قائمة اتصالات المتجر
   */
  async findByStoreId(storeId) {
    const result = await pool.query(
      `SELECT c.id, c.source_store_id, c.target_store_id, c.sync_products,
              c.sync_inventory, c.sync_orders, c.bidirectional,
              c.created_at, c.updated_at,
              s1.name AS source_store_name, s1.type AS source_store_type,
              s2.name AS target_store_name, s2.type AS target_store_type
       FROM connections c
       JOIN stores s1 ON c.source_store_id = s1.id
       JOIN stores s2 ON c.target_store_id = s2.id
       WHERE c.source_store_id = $1 OR (c.target_store_id = $1 AND c.bidirectional = true)
       ORDER BY c.created_at DESC`,
      [storeId]
    );
    
    return result.rows;
  },
  
  /**
   * تحديث اتصال
   * @param {number} id - معرف الاتصال
   * @param {Object} connectionData - بيانات الاتصال المحدثة
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<Object>} - الاتصال المحدث
   */
  async update(id, connectionData, userId) {
    const {
      syncProducts,
      syncInventory,
      syncOrders,
      bidirectional
    } = connectionData;
    
    // التحقق من أن الاتصال موجود وينتمي للمستخدم
    const connectionResult = await pool.query(
      `SELECT c.id 
       FROM connections c
       JOIN stores s1 ON c.source_store_id = s1.id
       JOIN stores s2 ON c.target_store_id = s2.id
       WHERE c.id = $1 AND s1.user_id = $2 AND s2.user_id = $2`,
      [id, userId]
    );
    
    if (connectionResult.rowCount === 0) {
      throw new Error('الاتصال غير موجود أو لا ينتمي للمستخدم');
    }
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (syncProducts !== undefined) {
      updates.push(`sync_products = $${updates.length + 1}`);
      values.push(syncProducts);
    }
    
    if (syncInventory !== undefined) {
      updates.push(`sync_inventory = $${updates.length + 1}`);
      values.push(syncInventory);
    }
    
    if (syncOrders !== undefined) {
      updates.push(`sync_orders = $${updates.length + 1}`);
      values.push(syncOrders);
    }
    
    if (bidirectional !== undefined) {
      updates.push(`bidirectional = $${updates.length + 1}`);
      values.push(bidirectional);
    }
    
    if (updates.length === 0) {
      return this.findById(id);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // تنفيذ الاستعلام
    values.push(id);
    
    const result = await pool.query(
      `UPDATE connections
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, source_store_id, target_store_id, sync_products,
                 sync_inventory, sync_orders, bidirectional, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف اتصال
   * @param {number} id - معرف الاتصال
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id, userId) {
    // التحقق من أن الاتصال موجود وينتمي للمستخدم
    const result = await pool.query(
      `DELETE FROM connections
       WHERE id = $1 AND EXISTS (
         SELECT 1 FROM connections c
         JOIN stores s1 ON c.source_store_id = s1.id
         JOIN stores s2 ON c.target_store_id = s2.id
         WHERE c.id = $1 AND s1.user_id = $2 AND s2.user_id = $2
       )
       RETURNING id`,
      [id, userId]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = Connection;