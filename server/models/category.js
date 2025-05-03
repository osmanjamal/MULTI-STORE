const { pool } = require('../config/database');

/**
 * نموذج فئة المنتج
 */
const Category = {
  /**
   * إنشاء فئة جديدة
   * @param {Object} categoryData - بيانات الفئة
   * @returns {Promise<Object>} - الفئة المنشأة
   */
  async create(categoryData) {
    const {
      storeId,
      externalId,
      name,
      parentId,
      description,
      image,
      isActive,
      slug,
      order,
      metadata
    } = categoryData;
    
    // إنشاء الفئة
    const result = await pool.query(
      `INSERT INTO categories (
         store_id, external_id, name, parent_id, description,
         image, is_active, slug, order_num, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, store_id, external_id, name, parent_id, is_active, created_at`,
      [
        storeId, externalId, name, parentId, description,
        image, isActive, slug, order, JSON.stringify(metadata || {})
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على فئة بواسطة المعرف
   * @param {number} id - معرف الفئة
   * @returns {Promise<Object>} - الفئة المطلوبة
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT c.id, c.store_id, c.external_id, c.name, c.parent_id,
              c.description, c.image, c.is_active, c.slug, c.order_num,
              c.metadata, c.created_at, c.updated_at,
              p.name AS parent_name,
              s.name AS store_name, s.type AS store_type
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       JOIN stores s ON c.store_id = s.id
       WHERE c.id = $1`,
      [id]
    );
    
    const category = result.rows[0];
    
    if (category) {
      // تحويل JSON إلى كائن
      category.metadata = JSON.parse(category.metadata || '{}');
    }
    
    return category || null;
  },
  
  /**
   * الحصول على فئة بواسطة المعرف الخارجي والمتجر
   * @param {string} externalId - المعرف الخارجي
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - الفئة المطلوبة
   */
  async findByExternalId(externalId, storeId) {
    const result = await pool.query(
      `SELECT c.id, c.store_id, c.external_id, c.name, c.parent_id,
              c.description, c.image, c.is_active, c.slug, c.order_num,
              c.metadata, c.created_at, c.updated_at
       FROM categories c
       WHERE c.external_id = $1 AND c.store_id = $2`,
      [externalId, storeId]
    );
    
    const category = result.rows[0];
    
    if (category) {
      // تحويل JSON إلى كائن
      category.metadata = JSON.parse(category.metadata || '{}');
    }
    
    return category || null;
  },
  
  /**
   * الحصول على فئة بواسطة الاسم والمتجر
   * @param {string} name - اسم الفئة
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - الفئة المطلوبة
   */
  async findByName(name, storeId) {
    const result = await pool.query(
      `SELECT c.id, c.store_id, c.external_id, c.name, c.parent_id,
              c.description, c.image, c.is_active, c.slug, c.order_num,
              c.metadata, c.created_at, c.updated_at
       FROM categories c
       WHERE c.name = $1 AND c.store_id = $2`,
      [name, storeId]
    );
    
    const category = result.rows[0];
    
    if (category) {
      // تحويل JSON إلى كائن
      category.metadata = JSON.parse(category.metadata || '{}');
    }
    
    return category || null;
  },
  
  /**
   * الحصول على فئات متجر
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Array>} - قائمة الفئات
   */
  async findByStoreId(storeId) {
    const result = await pool.query(
      `SELECT c.id, c.external_id, c.name, c.parent_id, c.description,
              c.image, c.is_active, c.slug, c.order_num, c.metadata,
              c.created_at, c.updated_at,
              p.name AS parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.store_id = $1
       ORDER BY c.order_num ASC, c.name ASC`,
      [storeId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(category => ({
      ...category,
      metadata: JSON.parse(category.metadata || '{}')
    }));
  },
  
  /**
   * الحصول على الفئات الفرعية
   * @param {number} parentId - معرف الفئة الأب
   * @returns {Promise<Array>} - قائمة الفئات الفرعية
   */
  async findChildren(parentId) {
    const result = await pool.query(
      `SELECT c.id, c.store_id, c.external_id, c.name, c.parent_id,
              c.description, c.image, c.is_active, c.slug, c.order_num,
              c.metadata, c.created_at, c.updated_at
       FROM categories c
       WHERE c.parent_id = $1
       ORDER BY c.order_num ASC, c.name ASC`,
      [parentId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(category => ({
      ...category,
      metadata: JSON.parse(category.metadata || '{}')
    }));
  },
  
  /**
   * تحديث فئة
   * @param {number} id - معرف الفئة
   * @param {Object} categoryData - بيانات الفئة المحدثة
   * @returns {Promise<Object>} - الفئة المحدثة
   */
  async update(id, categoryData) {
    const {
      name,
      parentId,
      description,
      image,
      isActive,
      slug,
      order,
      metadata
    } = categoryData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (name !== undefined) {
      updates.push(`name = $${updates.length + 1}`);
      values.push(name);
    }
    
    if (parentId !== undefined) {
      updates.push(`parent_id = $${updates.length + 1}`);
      values.push(parentId);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${updates.length + 1}`);
      values.push(description);
    }
    
    if (image !== undefined) {
      updates.push(`image = $${updates.length + 1}`);
      values.push(image);
    }
    
    if (isActive !== undefined) {
      updates.push(`is_active = $${updates.length + 1}`);
      values.push(isActive);
    }
    
    if (slug !== undefined) {
      updates.push(`slug = $${updates.length + 1}`);
      values.push(slug);
    }
    
    if (order !== undefined) {
      updates.push(`order_num = $${updates.length + 1}`);
      values.push(order);
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
      `UPDATE categories
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, store_id, external_id, name, parent_id,
                 is_active, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف فئة
   * @param {number} id - معرف الفئة
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id) {
    // تحديث الفئات الفرعية لإزالة الارتباط بالفئة المحذوفة
    await pool.query(
      'UPDATE categories SET parent_id = NULL WHERE parent_id = $1',
      [id]
    );
    
    // حذف الفئة
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = Category;