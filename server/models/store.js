const { pool } = require('../config/database');

/**
 * نموذج المتجر
 */
const Store = {
  /**
   * إنشاء متجر جديد
   * @param {Object} storeData - بيانات المتجر
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<Object>} - المتجر المنشأ
   */
  async create(storeData, userId) {
    const {
      name,
      type,
      url,
      apiKey,
      apiSecret,
      accessToken,
      consumerKey,
      consumerSecret,
      isMain
    } = storeData;
    
    // إذا كان المتجر الرئيسي، قم بإلغاء تعيين المتاجر الرئيسية الأخرى للمستخدم
    if (isMain) {
      await pool.query(
        `UPDATE stores
         SET is_main = false
         WHERE user_id = $1`,
        [userId]
      );
    }
    
    // إنشاء المتجر
    const result = await pool.query(
      `INSERT INTO stores (
         name, type, url, api_key, api_secret, access_token,
         consumer_key, consumer_secret, is_main, user_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, type, url, is_main, user_id, created_at`,
      [
        name, type, url, apiKey, apiSecret, accessToken,
        consumerKey, consumerSecret, isMain, userId
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على متجر بواسطة المعرف
   * @param {number} id - معرف المتجر
   * @returns {Promise<Object>} - المتجر المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, type, url, is_main, user_id, created_at, updated_at
       FROM stores
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  },
  
  /**
   * الحصول على متجر مع معلومات API
   * @param {number} id - معرف المتجر
   * @returns {Promise<Object>} - المتجر المطلوب مع معلومات API
   */
  async findByIdWithCredentials(id) {
    const result = await pool.query(
      `SELECT id, name, type, url, api_key, api_secret, access_token,
              consumer_key, consumer_secret, is_main, user_id, created_at, updated_at
       FROM stores
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  },
  
  /**
   * الحصول على جميع متاجر المستخدم
   * @param {number} userId - معرف المستخدم
   * @returns {Promise<Array>} - قائمة المتاجر
   */
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT id, name, type, url, is_main, created_at, updated_at
       FROM stores
       WHERE user_id = $1
       ORDER BY is_main DESC, name ASC`,
      [userId]
    );
    
    return result.rows;
  },
  
  /**
   * الحصول على المتجر الرئيسي للمستخدم
   * @param {number} userId - معرف المستخدم
   * @returns {Promise<Object>} - المتجر الرئيسي
   */
  async findMainStore(userId) {
    const result = await pool.query(
      `SELECT id, name, type, url, is_main, user_id, created_at, updated_at
       FROM stores
       WHERE user_id = $1 AND is_main = true
       LIMIT 1`,
      [userId]
    );
    
    return result.rows[0] || null;
  },
  
  /**
   * تحديث متجر
   * @param {number} id - معرف المتجر
   * @param {Object} storeData - بيانات المتجر المحدثة
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<Object>} - المتجر المحدث
   */
  async update(id, storeData, userId) {
    const {
      name,
      url,
      apiKey,
      apiSecret,
      accessToken,
      consumerKey,
      consumerSecret,
      isMain
    } = storeData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (name) {
      updates.push(`name = $${updates.length + 1}`);
      values.push(name);
    }
    
    if (url) {
      updates.push(`url = $${updates.length + 1}`);
      values.push(url);
    }
    
    if (apiKey) {
      updates.push(`api_key = $${updates.length + 1}`);
      values.push(apiKey);
    }
    
    if (apiSecret) {
      updates.push(`api_secret = $${updates.length + 1}`);
      values.push(apiSecret);
    }
    
    if (accessToken) {
      updates.push(`access_token = $${updates.length + 1}`);
      values.push(accessToken);
    }
    
    if (consumerKey) {
      updates.push(`consumer_key = $${updates.length + 1}`);
      values.push(consumerKey);
    }
    
    if (consumerSecret) {
      updates.push(`consumer_secret = $${updates.length + 1}`);
      values.push(consumerSecret);
    }
    
    if (isMain !== undefined) {
      updates.push(`is_main = $${updates.length + 1}`);
      values.push(isMain);
      
      // إذا تم تعيين هذا المتجر كرئيسي، قم بإلغاء تعيين المتاجر الأخرى
      if (isMain) {
        await pool.query(
          `UPDATE stores
           SET is_main = false
           WHERE user_id = $1 AND id != $2`,
          [userId, id]
        );
      }
    }
    
    if (updates.length === 0) {
      return this.findById(id);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // تنفيذ الاستعلام
    values.push(id);
    values.push(userId);
    
    const result = await pool.query(
      `UPDATE stores
       SET ${updates.join(', ')}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING id, name, type, url, is_main, user_id, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف متجر
   * @param {number} id - معرف المتجر
   * @param {number} userId - معرف المستخدم المالك
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM stores WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = Store;