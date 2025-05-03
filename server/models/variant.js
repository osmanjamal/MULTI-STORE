const { pool } = require('../config/database');

/**
 * نموذج متغير المنتج
 */
const Variant = {
  /**
   * إنشاء متغير جديد
   * @param {Object} variantData - بيانات المتغير
   * @returns {Promise<Object>} - المتغير المنشأ
   */
  async create(variantData) {
    const {
      productId,
      externalId,
      title,
      sku,
      barcode,
      price,
      compareAtPrice,
      weight,
      weightUnit,
      options,
      inventoryItemId,
      inventoryManagement,
      inventoryPolicy,
      metadata
    } = variantData;
    
    // إنشاء المتغير
    const result = await pool.query(
      `INSERT INTO variants (
         product_id, external_id, title, sku, barcode, price, compare_at_price,
         weight, weight_unit, options, inventory_item_id, inventory_management,
         inventory_policy, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, product_id, external_id, title, sku, barcode, price, created_at`,
      [
        productId, externalId, title, sku, barcode, price, compareAtPrice,
        weight, weightUnit, JSON.stringify(options), inventoryItemId,
        inventoryManagement, inventoryPolicy, JSON.stringify(metadata)
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على متغير بواسطة المعرف
   * @param {number} id - معرف المتغير
   * @returns {Promise<Object>} - المتغير المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT v.id, v.product_id, v.external_id, v.title, v.sku, v.barcode,
              v.price, v.compare_at_price, v.weight, v.weight_unit, v.options,
              v.inventory_item_id, v.inventory_management, v.inventory_policy,
              v.metadata, v.created_at, v.updated_at,
              p.title AS product_title, p.external_id AS product_external_id,
              p.store_id
       FROM variants v
       JOIN products p ON v.product_id = p.id
       WHERE v.id = $1`,
      [id]
    );
    
    const variant = result.rows[0];
    
    if (variant) {
      // تحويل JSON إلى كائن
      variant.options = JSON.parse(variant.options || '{}');
      variant.metadata = JSON.parse(variant.metadata || '{}');
    }
    
    return variant || null;
  },
  
  /**
   * الحصول على متغير بواسطة المعرف الخارجي
   * @param {string} externalId - المعرف الخارجي
   * @param {number} productId - معرف المنتج
   * @returns {Promise<Object>} - المتغير المطلوب
   */
  async findByExternalId(externalId, productId) {
    const result = await pool.query(
      `SELECT v.id, v.product_id, v.external_id, v.title, v.sku, v.barcode,
              v.price, v.compare_at_price, v.weight, v.weight_unit, v.options,
              v.inventory_item_id, v.inventory_management, v.inventory_policy,
              v.metadata, v.created_at, v.updated_at
       FROM variants v
       WHERE v.external_id = $1 AND v.product_id = $2`,
      [externalId, productId]
    );
    
    const variant = result.rows[0];
    
    if (variant) {
      // تحويل JSON إلى كائن
      variant.options = JSON.parse(variant.options || '{}');
      variant.metadata = JSON.parse(variant.metadata || '{}');
    }
    
    return variant || null;
  },
  
  /**
   * الحصول على متغير بواسطة SKU
   * @param {string} sku - SKU المتغير
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - المتغير المطلوب
   */
  async findBySku(sku, storeId) {
    const result = await pool.query(
      `SELECT v.id, v.product_id, v.external_id, v.title, v.sku, v.barcode,
              v.price, v.compare_at_price, v.weight, v.weight_unit, v.options,
              v.inventory_item_id, v.inventory_management, v.inventory_policy,
              v.metadata, v.created_at, v.updated_at,
              p.title AS product_title, p.external_id AS product_external_id,
              p.store_id
       FROM variants v
       JOIN products p ON v.product_id = p.id
       WHERE v.sku = $1 AND p.store_id = $2`,
      [sku, storeId]
    );
    
    const variant = result.rows[0];
    
    if (variant) {
      // تحويل JSON إلى كائن
      variant.options = JSON.parse(variant.options || '{}');
      variant.metadata = JSON.parse(variant.metadata || '{}');
    }
    
    return variant || null;
  },
  
  /**
   * الحصول على متغير بواسطة الباركود
   * @param {string} barcode - باركود المتغير
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - المتغير المطلوب
   */
  async findByBarcode(barcode, storeId) {
    const result = await pool.query(
      `SELECT v.id, v.product_id, v.external_id, v.title, v.sku, v.barcode,
              v.price, v.compare_at_price, v.weight, v.weight_unit, v.options,
              v.inventory_item_id, v.inventory_management, v.inventory_policy,
              v.metadata, v.created_at, v.updated_at,
              p.title AS product_title, p.external_id AS product_external_id,
              p.store_id
       FROM variants v
       JOIN products p ON v.product_id = p.id
       WHERE v.barcode = $1 AND p.store_id = $2`,
      [barcode, storeId]
    );
    
    const variant = result.rows[0];
    
    if (variant) {
      // تحويل JSON إلى كائن
      variant.options = JSON.parse(variant.options || '{}');
      variant.metadata = JSON.parse(variant.metadata || '{}');
    }
    
    return variant || null;
  },
  
  /**
   * الحصول على متغيرات منتج
   * @param {number} productId - معرف المنتج
   * @returns {Promise<Array>} - قائمة المتغيرات
   */
  async findByProductId(productId) {
    const result = await pool.query(
      `SELECT id, product_id, external_id, title, sku, barcode,
              price, compare_at_price, weight, weight_unit, options,
              inventory_item_id, inventory_management, inventory_policy,
              metadata, created_at, updated_at
       FROM variants
       WHERE product_id = $1
       ORDER BY id ASC`,
      [productId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(variant => ({
      ...variant,
      options: JSON.parse(variant.options || '{}'),
      metadata: JSON.parse(variant.metadata || '{}')
    }));
  },
  
  /**
   * تحديث متغير
   * @param {number} id - معرف المتغير
   * @param {Object} variantData - بيانات المتغير المحدثة
   * @returns {Promise<Object>} - المتغير المحدث
   */
  async update(id, variantData) {
    const {
      title,
      sku,
      barcode,
      price,
      compareAtPrice,
      weight,
      weightUnit,
      options,
      inventoryItemId,
      inventoryManagement,
      inventoryPolicy,
      metadata
    } = variantData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (title !== undefined) {
      updates.push(`title = $${updates.length + 1}`);
      values.push(title);
    }
    
    if (sku !== undefined) {
      updates.push(`sku = $${updates.length + 1}`);
      values.push(sku);
    }
    
    if (barcode !== undefined) {
      updates.push(`barcode = $${updates.length + 1}`);
      values.push(barcode);
    }
    
    if (price !== undefined) {
      updates.push(`price = $${updates.length + 1}`);
      values.push(price);
    }
    
    if (compareAtPrice !== undefined) {
      updates.push(`compare_at_price = $${updates.length + 1}`);
      values.push(compareAtPrice);
    }
    
    if (weight !== undefined) {
      updates.push(`weight = $${updates.length + 1}`);
      values.push(weight);
    }
    
    if (weightUnit !== undefined) {
      updates.push(`weight_unit = $${updates.length + 1}`);
      values.push(weightUnit);
    }
    
    if (options !== undefined) {
      updates.push(`options = $${updates.length + 1}`);
      values.push(JSON.stringify(options));
    }
    
    if (inventoryItemId !== undefined) {
      updates.push(`inventory_item_id = $${updates.length + 1}`);
      values.push(inventoryItemId);
    }
    
    if (inventoryManagement !== undefined) {
      updates.push(`inventory_management = $${updates.length + 1}`);
      values.push(inventoryManagement);
    }
    
    if (inventoryPolicy !== undefined) {
      updates.push(`inventory_policy = $${updates.length + 1}`);
      values.push(inventoryPolicy);
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
      `UPDATE variants
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, product_id, external_id, title, sku, barcode,
                 price, compare_at_price, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف متغير
   * @param {number} id - معرف المتغير
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM variants WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = Variant;