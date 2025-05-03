const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const appConfig = require('../config/app');

/**
 * نموذج المستخدم
 */
const User = {
  /**
   * إنشاء مستخدم جديد
   * @param {Object} userData - بيانات المستخدم
   * @returns {Promise<Object>} - المستخدم المنشأ
   */
  async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // إنشاء المستخدم
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على مستخدم بواسطة المعرف
   * @param {number} id - معرف المستخدم
   * @returns {Promise<Object>} - المستخدم المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  },
  
  /**
   * الحصول على مستخدم بواسطة البريد الإلكتروني
   * @param {string} email - البريد الإلكتروني
   * @returns {Promise<Object>} - المستخدم المطلوب
   */
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT id, name, email, password, role, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );
    
    return result.rows[0] || null;
  },
  
  /**
   * تحديث مستخدم
   * @param {number} id - معرف المستخدم
   * @param {Object} userData - بيانات المستخدم المحدثة
   * @returns {Promise<Object>} - المستخدم المحدث
   */
  async update(id, userData) {
    const { name, email, password, role } = userData;
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (name) {
      updates.push(`name = $${updates.length + 1}`);
      values.push(name);
    }
    
    if (email) {
      updates.push(`email = $${updates.length + 1}`);
      values.push(email);
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push(`password = $${updates.length + 1}`);
      values.push(hashedPassword);
    }
    
    if (role) {
      updates.push(`role = $${updates.length + 1}`);
      values.push(role);
    }
    
    if (updates.length === 0) {
      return this.findById(id);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // تنفيذ الاستعلام
    values.push(id);
    const result = await pool.query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, name, email, role, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف مستخدم
   * @param {number} id - معرف المستخدم
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  },
  
  /**
   * مقارنة كلمة المرور المدخلة بكلمة المرور المخزنة
   * @param {string} candidatePassword - كلمة المرور المدخلة
   * @param {string} userPassword - كلمة المرور المخزنة
   * @returns {Promise<boolean>} - نتيجة المقارنة
   */
  async comparePassword(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  },
  
  /**
   * إنشاء رمز مصادقة JWT
   * @param {number} id - معرف المستخدم
   * @returns {string} - رمز JWT
   */
  generateAuthToken(id) {
    return jwt.sign({ id }, appConfig.security.jwtSecret, {
      expiresIn: appConfig.security.jwtExpire
    });
  }
};

module.exports = User;