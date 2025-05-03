const { pool } = require('../config/database');

/**
 * نموذج الطلب
 */
const Order = {
  /**
   * إنشاء طلب جديد
   * @param {Object} orderData - بيانات الطلب
   * @returns {Promise<Object>} - الطلب المنشأ
   */
  async create(orderData) {
    const {
      storeId,
      externalId,
      orderNumber,
      email,
      firstName,
      lastName,
      totalPrice,
      subtotalPrice,
      totalTax,
      totalDiscounts,
      totalShipping,
      currency,
      financialStatus,
      fulfillmentStatus,
      paymentMethod,
      shippingMethod,
      orderItems,
      billingAddress,
      shippingAddress,
      notes,
      tags,
      metadata
    } = orderData;
    
    // بدء المعاملة
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // إنشاء الطلب
      const orderResult = await client.query(
        `INSERT INTO orders (
           store_id, external_id, order_number, email, first_name, last_name,
           total_price, subtotal_price, total_tax, total_discounts, total_shipping,
           currency, financial_status, fulfillment_status, payment_method,
           shipping_method, billing_address, shipping_address, notes, tags, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         RETURNING id, store_id, external_id, order_number, email, first_name, last_name,
                   total_price, currency, financial_status, fulfillment_status, created_at`,
        [
          storeId, externalId, orderNumber, email, firstName, lastName,
          totalPrice, subtotalPrice, totalTax, totalDiscounts, totalShipping,
          currency, financialStatus, fulfillmentStatus, paymentMethod,
          shippingMethod, JSON.stringify(billingAddress || {}), JSON.stringify(shippingAddress || {}),
          notes, tags, JSON.stringify(metadata || {})
        ]
      );
      
      const order = orderResult.rows[0];
      
      // إضافة عناصر الطلب
      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          await client.query(
            `INSERT INTO order_items (
               order_id, product_id, variant_id, title, sku, quantity,
               price, total_discount, properties, metadata
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              order.id, item.productId, item.variantId, item.title, item.sku,
              item.quantity, item.price, item.totalDiscount,
              JSON.stringify(item.properties || {}), JSON.stringify(item.metadata || {})
            ]
          );
          
          // تحديث المخزون إذا كان الطلب مؤكداً
          if (fulfillmentStatus === 'fulfilled' || fulfillmentStatus === 'partial') {
            await client.query(
              `UPDATE inventory
               SET quantity = quantity - $1, updated_at = NOW()
               WHERE product_id = $2 AND variant_id = $3 AND store_id = $4`,
              [item.quantity, item.productId, item.variantId || null, storeId]
            );
          }
        }
      }
      
      // تأكيد المعاملة
      await client.query('COMMIT');
      
      return order;
    } catch (error) {
      // التراجع عن المعاملة في حالة حدوث خطأ
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // إعادة العميل إلى التجمع
      client.release();
    }
  },
  
  /**
   * الحصول على طلب بواسطة المعرف
   * @param {number} id - معرف الطلب
   * @returns {Promise<Object>} - الطلب المطلوب
   */
  async findById(id) {
    // الحصول على بيانات الطلب
    const orderResult = await pool.query(
      `SELECT o.id, o.store_id, o.external_id, o.order_number, o.email,
              o.first_name, o.last_name, o.total_price, o.subtotal_price,
              o.total_tax, o.total_discounts, o.total_shipping, o.currency,
              o.financial_status, o.fulfillment_status, o.payment_method,
              o.shipping_method, o.billing_address, o.shipping_address,
              o.notes, o.tags, o.metadata, o.created_at, o.updated_at,
              s.name AS store_name, s.type AS store_type
       FROM orders o
       JOIN stores s ON o.store_id = s.id
       WHERE o.id = $1`,
      [id]
    );
    
    const order = orderResult.rows[0];
    
    if (!order) {
      return null;
    }
    
    // تحويل JSON إلى كائنات
    order.billing_address = JSON.parse(order.billing_address || '{}');
    order.shipping_address = JSON.parse(order.shipping_address || '{}');
    order.metadata = JSON.parse(order.metadata || '{}');
    
    // الحصول على عناصر الطلب
    const itemsResult = await pool.query(
      `SELECT i.id, i.order_id, i.product_id, i.variant_id, i.title, i.sku,
              i.quantity, i.price, i.total_discount, i.properties, i.metadata,
              i.created_at, i.updated_at,
              p.title AS product_title, p.external_id AS product_external_id,
              v.title AS variant_title, v.external_id AS variant_external_id
       FROM order_items i
       LEFT JOIN products p ON i.product_id = p.id
       LEFT JOIN variants v ON i.variant_id = v.id
       WHERE i.order_id = $1
       ORDER BY i.id ASC`,
      [id]
    );
    
    // إضافة عناصر الطلب إلى كائن الطلب
    order.order_items = itemsResult.rows.map(item => ({
      ...item,
      properties: JSON.parse(item.properties || '{}'),
      metadata: JSON.parse(item.metadata || '{}')
    }));
    
    return order;
  },
  
  /**
   * الحصول على طلب بواسطة المعرف الخارجي والمتجر
   * @param {string} externalId - المعرف الخارجي
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - الطلب المطلوب
   */
  async findByExternalId(externalId, storeId) {
    const result = await pool.query(
      `SELECT id FROM orders
       WHERE external_id = $1 AND store_id = $2`,
      [externalId, storeId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.findById(result.rows[0].id);
  },
  
  /**
   * الحصول على طلب بواسطة رقم الطلب والمتجر
   * @param {string} orderNumber - رقم الطلب
   * @param {number} storeId - معرف المتجر
   * @returns {Promise<Object>} - الطلب المطلوب
   */
  async findByOrderNumber(orderNumber, storeId) {
    const result = await pool.query(
      `SELECT id FROM orders
       WHERE order_number = $1 AND store_id = $2`,
      [orderNumber, storeId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.findById(result.rows[0].id);
  },
  
  /**
   * البحث عن طلبات
   * @param {Object} filters - مرشحات البحث
   * @param {number} storeId - معرف المتجر
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - نتائج البحث
   */
  async search(filters, storeId, page = 1, limit = 20) {
    const {
      query = '',
      financialStatus,
      fulfillmentStatus,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;
    
    const offset = (page - 1) * limit;
    const values = [storeId];
    let whereClause = 'o.store_id = $1';
    
    // إضافة مرشحات البحث
    if (query) {
      values.push(`%${query}%`);
      whereClause += ` AND (o.order_number ILIKE $${values.length} OR o.email ILIKE $${values.length} OR o.first_name ILIKE $${values.length} OR o.last_name ILIKE $${values.length})`;
    }
    
    if (financialStatus) {
      values.push(financialStatus);
      whereClause += ` AND o.financial_status = $${values.length}`;
    }
    
    if (fulfillmentStatus) {
      values.push(fulfillmentStatus);
      whereClause += ` AND o.fulfillment_status = $${values.length}`;
    }
    
    if (startDate) {
      values.push(startDate);
      whereClause += ` AND o.created_at >= $${values.length}`;
    }
    
    if (endDate) {
      values.push(endDate);
      whereClause += ` AND o.created_at <= $${values.length}`;
    }
    
    // التحقق من صحة حقل الفرز
    const validSortFields = ['created_at', 'order_number', 'total_price', 'financial_status', 'fulfillment_status'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // استعلام الحصول على الطلبات
    const ordersQuery = `
      SELECT o.id, o.store_id, o.external_id, o.order_number, o.email,
             o.first_name, o.last_name, o.total_price, o.currency,
             o.financial_status, o.fulfillment_status, o.created_at, o.updated_at
      FROM orders o
      WHERE ${whereClause}
      ORDER BY o.${sortField} ${order}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    
    // استعلام الحصول على العدد الإجمالي
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE ${whereClause}
    `;
    
    values.push(limit, offset);
    
    // تنفيذ الاستعلامات
    const [ordersResult, countResult] = await Promise.all([
      pool.query(ordersQuery, values),
      pool.query(countQuery, values.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    return {
      orders: ordersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },
  
  /**
   * الحصول على طلبات متجر
   * @param {number} storeId - معرف المتجر
   * @param {number} page - رقم الصفحة
   * @param {number} limit - عدد النتائج في الصفحة
   * @returns {Promise<Object>} - طلبات المتجر
   */
  async findByStoreId(storeId, page = 1, limit = 20) {
    return this.search({}, storeId, page, limit);
  },
  
  /**
   * تحديث طلب
   * @param {number} id - معرف الطلب
   * @param {Object} orderData - بيانات الطلب المحدثة
   * @returns {Promise<Object>} - الطلب المحدث
   */
  async update(id, orderData) {
    const {
      financialStatus,
      fulfillmentStatus,
      paymentMethod,
      shippingMethod,
      notes,
      tags,
      metadata
    } = orderData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (financialStatus !== undefined) {
      updates.push(`financial_status = $${updates.length + 1}`);
      values.push(financialStatus);
    }
    
    if (fulfillmentStatus !== undefined) {
      updates.push(`fulfillment_status = $${updates.length + 1}`);
      values.push(fulfillmentStatus);
    }
    
    if (paymentMethod !== undefined) {
      updates.push(`payment_method = $${updates.length + 1}`);
      values.push(paymentMethod);
    }
    
    if (shippingMethod !== undefined) {
      updates.push(`shipping_method = $${updates.length + 1}`);
      values.push(shippingMethod);
    }
    
    if (notes !== undefined) {
      updates.push(`notes = $${updates.length + 1}`);
      values.push(notes);
    }
    
    if (tags !== undefined) {
      updates.push(`tags = $${updates.length + 1}`);
      values.push(tags);
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
      `UPDATE orders
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, store_id, external_id, order_number, email,
                 first_name, last_name, total_price, currency,
                 financial_status, fulfillment_status, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  }
};

module.exports = Order;