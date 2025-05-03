const { pool } = require('../config/database');

/**
 * نموذج الويب هوك
 */
const Webhook = {
  /**
   * إنشاء ويب هوك جديد
   * @param {Object} webhookData - بيانات الويب هوك
   * @returns {Promise<Object>} - الويب هوك المنشأ
   */
  async create(webhookData) {
    const {
      storeId,
      externalId,
      topic,
      address,
      format,
      apiVersion,
      fields,
      metafields,
      metadata
    } = webhookData;
    
    // إنشاء الويب هوك
    const result = await pool.query(
      `INSERT INTO webhooks (
         store_id, external_id, topic, address, format,
         api_version, fields, metafields, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, store_id, external_id, topic, address,
                 format, api_version, created_at`,
      [
        storeId, externalId, topic, address, format,
        apiVersion, JSON.stringify(fields || []), JSON.stringify(metafields || []),
        JSON.stringify(metadata || {})
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على ويب هوك بواسطة المعرف
   * @param {number} id - معرف الويب هوك
   * @returns {Promise<Object>} - الويب هوك المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT w.id, w.store_id, w.external_id, w.topic, w.address,
              w.format, w.api_version, w.fields, w.metafields,
              w.metadata, w.created_at, w.updated_at,
              s.name AS store_name, s.type AS store_type
       FROM webhooks w
       JOIN stores s ON w.store_id = s.id
       WHERE w.id = $1`,
      [id]
    );
    
    const webhook = result.rows[0];
    
    if (webhook) {
      // تحويل JSON إلى كائنات
      webhook.fields = JSON.parse(webhook.fields || '[]');
      webhook.metafields = JSON.parse(webhook.metafields || '[]');
      webhook.metadata = JSON.parse(webhook.metadata || '{}');
    }
    
    return webhook || null;
  },
  
  /**
   * الحصول على ويب هوك بواسطة المعرف الخارجي والمتجر
   * @param {string} externalId - المعرف الخارجي
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - الويب هوك المطلوب
   */
  async findByExternalId(externalId, storeId) {
    const result = await pool.query(
      `SELECT w.id, w.store_id, w.external_id, w.topic, w.address,
              w.format, w.api_version, w.fields, w.metafields,
              w.metadata, w.created_at, w.updated_at
       FROM webhooks w
       WHERE w.external_id = $1 AND w.store_id = $2`,
      [externalId, storeId]
    );
    
    const webhook = result.rows[0];
    
    if (webhook) {
      // تحويل JSON إلى كائنات
      webhook.fields = JSON.parse(webhook.fields || '[]');
      webhook.metafields = JSON.parse(webhook.metafields || '[]');
      webhook.metadata = JSON.parse(webhook.metadata || '{}');
    }
    
    return webhook || null;
  },
  
  /**
   * الحصول على ويب هوك بواسطة الموضوع والمتجر
   * @param {string} topic - موضوع الويب هوك
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Array>} - قائمة الويب هوك
   */
  async findByTopic(topic, storeId) {
    const result = await pool.query(
      `SELECT w.id, w.store_id, w.external_id, w.topic, w.address,
              w.format, w.api_version, w.fields, w.metafields,
              w.metadata, w.created_at, w.updated_at
       FROM webhooks w
       WHERE w.topic = $1 AND w.store_id = $2`,
      [topic, storeId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(webhook => ({
      ...webhook,
      fields: JSON.parse(webhook.fields || '[]'),
      metafields: JSON.parse(webhook.metafields || '[]'),
      metadata: JSON.parse(webhook.metadata || '{}')
    }));
  },
  
  /**
   * الحصول على ويب هوك متجر
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Array>} - قائمة الويب هوك
   */
  async findByStoreId(storeId) {
    const result = await pool.query(
      `SELECT w.id, w.store_id, w.external_id, w.topic, w.address,
              w.format, w.api_version, w.fields, w.metafields,
              w.metadata, w.created_at, w.updated_at
       FROM webhooks w
       WHERE w.store_id = $1
       ORDER BY w.created_at DESC`,
      [storeId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(webhook => ({
      ...webhook,
      fields: JSON.parse(webhook.fields || '[]'),
      metafields: JSON.parse(webhook.metafields || '[]'),
      metadata: JSON.parse(webhook.metadata || '{}')
    }));
  },
  
  /**
   * تحديث ويب هوك
   * @param {number} id - معرف الويب هوك
   * @param {Object} webhookData - بيانات الويب هوك المحدثة
   * @returns {Promise<Object>} - الويب هوك المحدث
   */
  async update(id, webhookData) {
    const {
      address,
      format,
      apiVersion,
      fields,
      metafields,
      metadata
    } = webhookData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (address !== undefined) {
      updates.push(`address = $${updates.length + 1}`);
      values.push(address);
    }
    
    if (format !== undefined) {
      updates.push(`format = $${updates.length + 1}`);
      values.push(format);
    }
    
    if (apiVersion !== undefined) {
      updates.push(`api_version = $${updates.length + 1}`);
      values.push(apiVersion);
    }
    
    if (fields !== undefined) {
      updates.push(`fields = $${updates.length + 1}`);
      values.push(JSON.stringify(fields));
    }
    
    if (metafields !== undefined) {
      updates.push(`metafields = $${updates.length + 1}`);
      values.push(JSON.stringify(metafields));
    }
    
    if (metadata !== undefined) {
      updates.push(`metadata = $${updates.length + 1}`);
      values.push(JSON.stringify(metadata));
    }
    
    if (updates.length === 0) {
      return this.findById(id);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // تنفيذ الاستعلام
    values.push(id);
    
    const result = await pool.query(
      `UPDATE webhooks
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, store_id, external_id, topic, address,
                 format, api_version, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف ويب هوك
   * @param {number} id - معرف الويب هوك
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM webhooks WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = Webhook;