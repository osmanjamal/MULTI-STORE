const { pool } = require('../config/database');

/**
 * نموذج المنتج
 */
const Product = {
  /**
   * إنشاء منتج جديد
   * @param {Object} productData - بيانات المنتج
   * @returns {Promise<Object>} - المنتج المنشأ
   */
  async create(productData) {
    const {
      storeId,
      externalId,
      title,
      description,
      sku,
      barcode,
      vendor,
      productType,
      tags,
      status,
      options,
      images,
      variants,
      metadata
    } = productData;
    
    // إنشاء المنتج
    const result = await pool.query(
      `INSERT INTO products (
         store_id, external_id, title, description, sku, barcode,
         vendor, product_type, tags, status, options, images, variants, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, store_id, external_id, title, sku, barcode, status, created_at`,
      [
        storeId, externalId, title, description, sku, barcode,
        vendor, productType, tags, status, JSON.stringify(options),
        JSON.stringify(images), JSON.stringify(variants), JSON.stringify(metadata)
      ]
    );
    
    return result.rows[0];
  },
  
  /**
   * الحصول على منتج بواسطة المعرف
   * @param {number} id - معرف المنتج
   * @returns {Promise<Object>} - المنتج المطلوب
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT p.id, p.store_id, p.external_id, p.title, p.description, p.sku,
              p.barcode, p.vendor, p.product_type, p.tags, p.status,
              p.options, p.images, p.variants, p.metadata,
              p.created_at, p.updated_at,
              s.name AS store_name, s.type AS store_type
       FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = $1`,
      [id]
    );
    
    const product = result.rows[0];
    
    if (product) {
      // تحويل JSON إلى كائنات
      product.options = JSON.parse(product.options || '[]');
      product.images = JSON.parse(product.images || '[]');
      product.variants = JSON.parse(product.variants || '[]');
      product.metadata = JSON.parse(product.metadata || '{}');
    }
    
    return product || null;
  },
  
  /**
   * الحصول على منتج بواسطة المعرف الخارجي والمتجر
   * @param {string} externalId - المعرف الخارجي للمنتج
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - المنتج المطلوب
   */
  async findByExternalId(externalId, storeId) {
    const result = await pool.query(
      `SELECT p.id, p.store_id, p.external_id, p.title, p.description, p.sku,
              p.barcode, p.vendor, p.product_type, p.tags, p.status,
              p.options, p.images, p.variants, p.metadata,
              p.created_at, p.updated_at,
              s.name AS store_name, s.type AS store_type
       FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.external_id = $1 AND p.store_id = $2`,
      [externalId, storeId]
    );
    
    const product = result.rows[0];
    
    if (product) {
      // تحويل JSON إلى كائنات
      product.options = JSON.parse(product.options || '[]');
      product.images = JSON.parse(product.images || '[]');
      product.variants = JSON.parse(product.variants || '[]');
      product.metadata = JSON.parse(product.metadata || '{}');
    }
    
    return product || null;
  },
  
  /**
   * الحصول على منتج بواسطة SKU والمتجر
   * @param {string} sku - SKU المنتج
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - المنتج المطلوب
   */
  async findBySku(sku, storeId) {
    const result = await pool.query(
      `SELECT p.id, p.store_id, p.external_id, p.title, p.description, p.sku,
              p.barcode, p.vendor, p.product_type, p.tags, p.status,
              p.options, p.images, p.variants, p.metadata,
              p.created_at, p.updated_at,
              s.name AS store_name, s.type AS store_type
       FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.sku = $1 AND p.store_id = $2`,
      [sku, storeId]
    );
    
    const product = result.rows[0];
    
    if (product) {
      // تحويل JSON إلى كائنات
      product.options = JSON.parse(product.options || '[]');
      product.images = JSON.parse(product.images || '[]');
      product.variants = JSON.parse(product.variants || '[]');
      product.metadata = JSON.parse(product.metadata || '{}');
    }
    
    return product || null;
  },
  
  /**
   * الحصول على منتج بواسطة الباركود والمتجر
   * @param {string} barcode - باركود المنتج
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - المنتج المطلوب
   */
  async findByBarcode(barcode, storeId) {
    const result = await pool.query(
      `SELECT p.id, p.store_id, p.external_id, p.title, p.description, p.sku,
              p.barcode, p.vendor, p.product_type, p.tags, p.status,
              p.options, p.images, p.variants, p.metadata,
              p.created_at, p.updated_at,
              s.name AS store_name, s.type AS store_type
       FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.barcode = $1 AND p.store_id = $2`,
      [barcode, storeId]
    );
    
    const product = result.rows[0];
    
    if (product) {
      // تحويل JSON إلى كائنات
      product.options = JSON.parse(product.options || '[]');
      product.images = JSON.parse(product.images || '[]');
      product.variants = JSON.parse(product.variants || '[]');
      product.metadata = JSON.parse(product.metadata || '{}');
    }
    
    return product || null;
  },
  
  /**
   * البحث عن منتجات
   * @param {Object} filters - مرشحات البحث
   * @param {number} storeId - معرف المتجر
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - نتائج البحث
   */
  async search(filters, storeId, page = 1, limit = 20) {
    const {
      query = '',
      status,
      productType,
      vendor,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;
    
    const offset = (page - 1) * limit;
    const values = [storeId];
    let whereClause = 'p.store_id = $1';
    
    // إضافة مرشحات البحث
    if (query) {
      values.push(`%${query}%`);
      whereClause += ` AND (p.title ILIKE $${values.length} OR p.sku ILIKE $${values.length} OR p.barcode ILIKE $${values.length})`;
    }
    
    if (status) {
      values.push(status);
      whereClause += ` AND p.status = $${values.length}`;
    }
    
    if (productType) {
      values.push(productType);
      whereClause += ` AND p.product_type = $${values.length}`;
    }
    
    if (vendor) {
      values.push(vendor);
      whereClause += ` AND p.vendor = $${values.length}`;
    }
    
    // التحقق من صحة حقل الفرز
    const validSortFields = ['created_at', 'title', 'sku', 'product_type', 'vendor', 'status'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // استعلام الحصول على المنتجات
    const productsQuery = `
      SELECT p.id, p.store_id, p.external_id, p.title, p.sku, p.barcode,
             p.vendor, p.product_type, p.status,
             p.created_at, p.updated_at
      FROM products p
      WHERE ${whereClause}
      ORDER BY p.${sortField} ${order}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    
    // استعلام الحصول على العدد الإجمالي
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${whereClause}
    `;
    
    values.push(limit, offset);
    
    // تنفيذ الاستعلامات
    const [productsResult, countResult] = await Promise.all([
      pool.query(productsQuery, values),
      pool.query(countQuery, values.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    return {
      products: productsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },
  
  /**
   * الحصول على منتجات متجر
   * @param {number} storeId - معرف المتجر
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - منتجات المتجر
   */
  async findByStoreId(storeId, page = 1, limit = 20) {
    return this.search({}, storeId, page, limit);
  },
  
  /**
   * تحديث منتج
   * @param {number} id - معرف المنتج
   * @param {Object} productData - بيانات المنتج المحدثة
   * @returns {Promise<Object>} - المنتج المحدث
   */
  async update(id, productData) {
    const {
      title,
      description,
      sku,
      barcode,
      vendor,
      productType,
      tags,
      status,
      options,
      images,
      variants,
      metadata
    } = productData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (title !== undefined) {
      updates.push(`title = $${updates.length + 1}`);
      values.push(title);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${updates.length + 1}`);
      values.push(description);
    }
    
    if (sku !== undefined) {
      updates.push(`sku = $${updates.length + 1}`);
      values.push(sku);
    }
    
    if (barcode !== undefined) {
      updates.push(`barcode = $${updates.length + 1}`);
      values.push(barcode);
    }
    
    if (vendor !== undefined) {
      updates.push(`vendor = $${updates.length + 1}`);
      values.push(vendor);
    }
    
    if (productType !== undefined) {
      updates.push(`product_type = $${updates.length + 1}`);
      values.push(productType);
    }
    
    if (tags !== undefined) {
      updates.push(`tags = $${updates.length + 1}`);
      values.push(tags);
    }
    
    if (status !== undefined) {
      updates.push(`status = $${updates.length + 1}`);
      values.push(status);
    }
    
    if (options !== undefined) {
      updates.push(`options = $${updates.length + 1}`);
      values.push(JSON.stringify(options));
    }
    
    if (images !== undefined) {
      updates.push(`images = $${updates.length + 1}`);
      values.push(JSON.stringify(images));
    }
    
    if (variants !== undefined) {
      updates.push(`variants = $${updates.length + 1}`);
      values.push(JSON.stringify(variants));
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
      `UPDATE products
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, store_id, external_id, title, sku, barcode,
                 status, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف منتج
   * @param {number} id - معرف المنتج
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  }
};

module.exports = Product;