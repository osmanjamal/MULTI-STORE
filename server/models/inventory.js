const { pool } = require('../config/database');

/**
 * نموذج المخزون
 */
const Inventory = {
  /**
   * إنشاء سجل مخزون جديد
   * @param {Object} inventoryData - بيانات المخزون
   * @returns {Promise<Object>} - سجل المخزون المنشأ
   */
  async create(inventoryData) {
    const {
      storeId,
      productId,
      variantId,
      locationId,
      quantity,
      sku,
      inventoryItemId,
      externalId,
      metadata
    } = inventoryData;
    
    // إنشاء سجل المخزون
    const result = await pool.query(
      `INSERT INTO inventory (
         store_id, product_id, variant_id, location_id, quantity,
         sku, inventory_item_id, external_id, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, store_id, product_id, variant_id, location_id,
                 quantity, sku, inventory_item_id, external_id, created_at`,
      [
        storeId, productId, variantId, locationId, quantity,
        sku, inventoryItemId, externalId, JSON.stringify(metadata || {})
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على سجل مخزون بواسطة المعرف
   * @param {number} id - معرف سجل المخزون
   * @returns {Promise<Object>} - سجل المخزون المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
              i.quantity, i.sku, i.inventory_item_id, i.external_id,
              i.metadata, i.created_at, i.updated_at,
              p.title AS product_title, p.external_id AS product_external_id,
              v.title AS variant_title, v.external_id AS variant_external_id,
              s.name AS store_name, s.type AS store_type
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       LEFT JOIN variants v ON i.variant_id = v.id
       JOIN stores s ON i.store_id = s.id
       WHERE i.id = $1`,
      [id]
    );
    
    const inventory = result.rows[0];
    
    if (inventory) {
      // تحويل JSON إلى كائن
      inventory.metadata = JSON.parse(inventory.metadata || '{}');
    }
    
    return inventory || null;
  },
  
  /**
   * الحصول على سجل مخزون بواسطة المنتج والمتغير والموقع
   * @param {number} productId - معرف المنتج
   * @param {number} variantId - معرف المتغير
   * @param {number} locationId - معرف الموقع
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - سجل المخزون المطلوب
   */
  async findByProductVariantLocation(productId, variantId, locationId, storeId) {
    const result = await pool.query(
      `SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
              i.quantity, i.sku, i.inventory_item_id, i.external_id,
              i.metadata, i.created_at, i.updated_at
       FROM inventory i
       WHERE i.product_id = $1 AND i.variant_id = $2 AND i.location_id = $3 AND i.store_id = $4`,
      [productId, variantId, locationId, storeId]
    );
    
    const inventory = result.rows[0];
    
    if (inventory) {
      // تحويل JSON إلى كائن
      inventory.metadata = JSON.parse(inventory.metadata || '{}');
    }
    
    return inventory || null;
  },
  
  /**
   * الحصول على سجل مخزون بواسطة المعرف الخارجي
   * @param {string} externalId - المعرف الخارجي
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - سجل المخزون المطلوب
   */
  async findByExternalId(externalId, storeId) {
    const result = await pool.query(
      `SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
              i.quantity, i.sku, i.inventory_item_id, i.external_id,
              i.metadata, i.created_at, i.updated_at
       FROM inventory i
       WHERE i.external_id = $1 AND i.store_id = $2`,
      [externalId, storeId]
    );
    
    const inventory = result.rows[0];
    
    if (inventory) {
      // تحويل JSON إلى كائن
      inventory.metadata = JSON.parse(inventory.metadata || '{}');
    }
    
    return inventory || null;
  },
  
  /**
   * الحصول على سجل مخزون بواسطة inventory_item_id
   * @param {string} inventoryItemId - معرف عنصر المخزون
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - سجل المخزون المطلوب
   */
  async findByInventoryItemId(inventoryItemId, storeId) {
    const result = await pool.query(
      `SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
              i.quantity, i.sku, i.inventory_item_id, i.external_id,
              i.metadata, i.created_at, i.updated_at
       FROM inventory i
       WHERE i.inventory_item_id = $1 AND i.store_id = $2`,
      [inventoryItemId, storeId]
    );
    
    const inventory = result.rows[0];
    
    if (inventory) {
      // تحويل JSON إلى كائن
      inventory.metadata = JSON.parse(inventory.metadata || '{}');
    }
    
    return inventory || null;
  },
  
  /**
   * الحصول على سجل مخزون بواسطة SKU
   * @param {string} sku - SKU المنتج
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - سجل المخزون المطلوب
   */
  async findBySku(sku, storeId) {
    const result = await pool.query(
      `SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
              i.quantity, i.sku, i.inventory_item_id, i.external_id,
              i.metadata, i.created_at, i.updated_at
       FROM inventory i
       WHERE i.sku = $1 AND i.store_id = $2`,
      [sku, storeId]
    );
    
    const inventory = result.rows[0];
    
    if (inventory) {
      // تحويل JSON إلى كائن
      inventory.metadata = JSON.parse(inventory.metadata || '{}');
    }
    
    return inventory || null;
  },
  
  /**
   * الحصول على سجلات مخزون منتج
   * @param {number} productId - معرف المنتج
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Array>} - قائمة سجلات المخزون
   */
  async findByProductId(productId, storeId) {
    const result = await pool.query(
      `SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
              i.quantity, i.sku, i.inventory_item_id, i.external_id,
              i.metadata, i.created_at, i.updated_at,
              v.title AS variant_title
       FROM inventory i
       LEFT JOIN variants v ON i.variant_id = v.id
       WHERE i.product_id = $1 AND i.store_id = $2
       ORDER BY i.location_id, i.variant_id`,
      [productId, storeId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(inventory => ({
      ...inventory,
      metadata: JSON.parse(inventory.metadata || '{}')
    }));
  },
  
  /**
   * الحصول على سجلات مخزون متغير
   * @param {number} variantId - معرف المتغير
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Array>} - قائمة سجلات المخزون
   */
  async findByVariantId(variantId, storeId) {
    const result = await pool.query(
      `SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
              i.quantity, i.sku, i.inventory_item_id, i.external_id,
              i.metadata, i.created_at, i.updated_at
       FROM inventory i
       WHERE i.variant_id = $1 AND i.store_id = $2
       ORDER BY i.location_id`,
      [variantId, storeId]
    );
    
    // تحويل JSON إلى كائنات
    return result.rows.map(inventory => ({
      ...inventory,
      metadata: JSON.parse(inventory.metadata || '{}')
    }));
  },
  
  /**
   * الحصول على سجلات مخزون متجر
   * @param {number} storeId - معرف المتجر
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - سجلات المخزون
   */
  async findByStoreId(storeId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // استعلام للحصول على سجلات المخزون
    const inventoryQuery = `
      SELECT i.id, i.store_id, i.product_id, i.variant_id, i.location_id,
             i.quantity, i.sku, i.inventory_item_id, i.external_id,
             i.created_at, i.updated_at,
             p.title AS product_title, p.barcode AS product_barcode,
             v.title AS variant_title
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN variants v ON i.variant_id = v.id
      WHERE i.store_id = $1
      ORDER BY p.title, v.title, i.location_id
      LIMIT $2 OFFSET $3
    `;
    
    // استعلام للحصول على العدد الإجمالي
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM inventory
      WHERE store_id = $1
    `;
    
    // تنفيذ الاستعلامات
    const [inventoryResult, countResult] = await Promise.all([
      pool.query(inventoryQuery, [storeId, limit, offset]),
      pool.query(countQuery, [storeId])
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    return {
      inventory: inventoryResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },
  
  /**
   * تحديث سجل مخزون
   * @param {number} id - معرف سجل المخزون
   * @param {Object} inventoryData - بيانات المخزون المحدثة
   * @returns {Promise<Object>} - سجل المخزون المحدث
   */
  async update(id, inventoryData) {
    const {
      locationId,
      quantity,
      sku,
      inventoryItemId,
      externalId,
      metadata
    } = inventoryData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (locationId !== undefined) {
      updates.push(`location_id = $${updates.length + 1}`);
      values.push(locationId);
    }
    
    if (quantity !== undefined) {
      updates.push(`quantity = $${updates.length + 1}`);
      values.push(quantity);
    }
    
    if (sku !== undefined) {
      updates.push(`sku = $${updates.length + 1}`);
      values.push(sku);
    }
    
    if (inventoryItemId !== undefined) {
      updates.push(`inventory_item_id = $${updates.length + 1}`);
      values.push(inventoryItemId);
    }
    
    if (externalId !== undefined) {
      updates.push(`external_id = $${updates.length + 1}`);
      values.push(externalId);
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
      `UPDATE inventory
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, store_id, product_id, variant_id, location_id,
                 quantity, sku, inventory_item_id, external_id,
                 created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * تحديث أو إنشاء سجل مخزون
   * @param {Object} inventoryData - بيانات المخزون
   * @returns {Promise<Object>} - سجل المخزون المحدث أو المنشأ
   */
  async updateOrCreate(inventoryData) {
    const {
      storeId,
      productId,
      variantId,
      locationId = 1,
      quantity,
      sku,
      inventoryItemId,
      externalId,
      metadata
    } = inventoryData;
    
    // البحث عن سجل مخزون موجود
    let inventory;
    
    if (externalId) {
      inventory = await this.findByExternalId(externalId, storeId);
    } else if (inventoryItemId) {
      inventory = await this.findByInventoryItemId(inventoryItemId, storeId);
    } else if (variantId) {
      const result = await pool.query(
        `SELECT id FROM inventory
         WHERE store_id = $1 AND product_id = $2 AND variant_id = $3 AND location_id = $4`,
        [storeId, productId, variantId, locationId]
      );
      inventory = result.rows[0];
    } else {
      const result = await pool.query(
        `SELECT id FROM inventory
         WHERE store_id = $1 AND product_id = $2 AND variant_id IS NULL AND location_id = $3`,
        [storeId, productId, locationId]
      );
      inventory = result.rows[0];
    }
    
    // إذا كان السجل موجوداً، قم بتحديثه
    if (inventory) {
      return this.update(inventory.id, inventoryData);
    }
    
    // وإلا، قم بإنشاء سجل جديد
    return this.create(inventoryData);
  },
  
  /**
   * تحديث كمية المخزون
   * @param {number} id - معرف سجل المخزون
   * @param {number} quantity - الكمية الجديدة
   * @returns {Promise<Object>} - سجل المخزون المحدث
   */
  async updateQuantity(id, quantity) {
    const result = await pool.query(
      `UPDATE inventory
       SET quantity = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, store_id, product_id, variant_id, location_id,
                 quantity, sku, inventory_item_id, external_id,
                 created_at, updated_at`,
      [quantity, id]
    );
    
    return result.rows[0];
  },
  
  /**
   * زيادة أو إنقاص كمية المخزون
   * @param {number} id - معرف سجل المخزون
   * @param {number} adjustment - قيمة التعديل (+/-)
   * @returns {Promise<Object>} - سجل المخزون المحدث
   */
  async adjustQuantity(id, adjustment) {
    const result = await pool.query(
      `UPDATE inventory
       SET quantity = quantity + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, store_id, product_id, variant_id, location_id,
                 quantity, sku, inventory_item_id, external_id,
                 created_at, updated_at`,
      [adjustment, id]
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف سجل مخزون
   * @param {number} id - معرف سجل المخزون
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM inventory WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = Inventory;