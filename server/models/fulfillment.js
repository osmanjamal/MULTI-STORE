const { pool } = require('../config/database');

/**
 * نموذج إتمام الطلب
 */
const Fulfillment = {
  /**
   * إنشاء سجل إتمام طلب جديد
   * @param {Object} fulfillmentData - بيانات إتمام الطلب
   * @returns {Promise<Object>} - سجل إتمام الطلب المنشأ
   */
  async create(fulfillmentData) {
    const {
      orderId,
      externalId,
      status,
      trackingCompany,
      trackingNumber,
      trackingUrl,
      shippedAt,
      deliveredAt,
      items,
      metadata
    } = fulfillmentData;
    
    // بدء المعاملة
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // إنشاء سجل إتمام الطلب
      const fulfillmentResult = await client.query(
        `INSERT INTO fulfillments (
           order_id, external_id, status, tracking_company, tracking_number,
           tracking_url, shipped_at, delivered_at, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, order_id, external_id, status, tracking_company,
                   tracking_number, tracking_url, shipped_at, delivered_at, created_at`,
        [
          orderId, externalId, status, trackingCompany, trackingNumber,
          trackingUrl, shippedAt, deliveredAt, JSON.stringify(metadata || {})
        ]
      );
      
      const fulfillment = fulfillmentResult.rows[0];
      
      // إضافة عناصر إتمام الطلب
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            `INSERT INTO fulfillment_items (
               fulfillment_id, order_item_id, quantity
             )
             VALUES ($1, $2, $3)`,
            [
              fulfillment.id, item.orderItemId, item.quantity
            ]
          );
        }
      }
      
      // تحديث حالة إتمام الطلب
      const orderResult = await client.query(
        `SELECT fulfillment_status FROM orders WHERE id = $1`,
        [orderId]
      );
      
      const currentStatus = orderResult.rows[0].fulfillment_status;
      
      // تحديث حالة إتمام الطلب بناءً على العناصر المتممة
      const itemsResult = await client.query(
        `SELECT oi.id, oi.quantity, COALESCE(SUM(fi.quantity), 0) AS fulfilled_quantity
         FROM order_items oi
         LEFT JOIN fulfillment_items fi ON oi.id = fi.order_item_id
         WHERE oi.order_id = $1
         GROUP BY oi.id, oi.quantity`,
        [orderId]
      );
      
      const allItems = itemsResult.rows;
      const allFulfilled = allItems.every(item => item.fulfilled_quantity >= item.quantity);
      const someFulfilled = allItems.some(item => item.fulfilled_quantity > 0);
      
      let newStatus = currentStatus;
      
      if (allFulfilled) {
        newStatus = 'fulfilled';
      } else if (someFulfilled) {
        newStatus = 'partial';
      }
      
      if (newStatus !== currentStatus) {
        await client.query(
          `UPDATE orders
           SET fulfillment_status = $1, updated_at = NOW()
           WHERE id = $2`,
          [newStatus, orderId]
        );
      }
      
      // تأكيد المعاملة
      await client.query('COMMIT');
      
      return fulfillment;
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
   * الحصول على سجل إتمام طلب بواسطة المعرف
   * @param {number} id - معرف سجل إتمام الطلب
   * @returns {Promise<Object>} - سجل إتمام الطلب المطلوب
   */
   async findById(id) {
    // الحصول على بيانات سجل إتمام الطلب
    const fulfillmentResult = await pool.query(
      `SELECT f.id, f.order_id, f.external_id, f.status, f.tracking_company,
              f.tracking_number, f.tracking_url, f.shipped_at, f.delivered_at,
              f.metadata, f.created_at, f.updated_at,
              o.order_number, o.store_id
       FROM fulfillments f
       JOIN orders o ON f.order_id = o.id
       WHERE f.id = $1`,
      [id]
    );
    
    const fulfillment = fulfillmentResult.rows[0];
    
    if (!fulfillment) {
      return null;
    }
    
    // تحويل JSON إلى كائن
    fulfillment.metadata = JSON.parse(fulfillment.metadata || '{}');
    
    // الحصول على عناصر سجل إتمام الطلب
    const itemsResult = await pool.query(
      `SELECT fi.id, fi.fulfillment_id, fi.order_item_id, fi.quantity,
              oi.product_id, oi.variant_id, oi.title, oi.sku,
              p.title AS product_title, p.external_id AS product_external_id,
              v.title AS variant_title, v.external_id AS variant_external_id
       FROM fulfillment_items fi
       JOIN order_items oi ON fi.order_item_id = oi.id
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN variants v ON oi.variant_id = v.id
       WHERE fi.fulfillment_id = $1
       ORDER BY fi.id ASC`,
      [id]
    );
    
    // إضافة عناصر سجل إتمام الطلب إلى كائن سجل إتمام الطلب
    fulfillment.items = itemsResult.rows;
    
    return fulfillment;
  },
  
  /**
   * الحصول على سجل إتمام طلب بواسطة المعرف الخارجي
   * @param {string} externalId - المعرف الخارجي
   * @param {number} orderId - معرف الطلب
   * @returns {Promise<Object>} - سجل إتمام الطلب المطلوب
   */
  async findByExternalId(externalId, orderId) {
    const result = await pool.query(
      `SELECT id FROM fulfillments
       WHERE external_id = $1 AND order_id = $2`,
      [externalId, orderId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.findById(result.rows[0].id);
  },
  
  /**
   * الحصول على جميع سجلات إتمام طلب لطلب معين
   * @param {number} orderId - معرف الطلب
   * @returns {Promise<Array>} - قائمة سجلات إتمام الطلب
   */
  async findByOrderId(orderId) {
    const fulfillmentsResult = await pool.query(
      `SELECT id, order_id, external_id, status, tracking_company,
              tracking_number, tracking_url, shipped_at, delivered_at,
              created_at, updated_at
       FROM fulfillments
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [orderId]
    );
    
    // الحصول على جميع سجلات إتمام الطلب بالتفصيل
    const fulfillments = [];
    
    for (const fulfillment of fulfillmentsResult.rows) {
      fulfillments.push(await this.findById(fulfillment.id));
    }
    
    return fulfillments;
  },
  
  /**
   * تحديث سجل إتمام طلب
   * @param {number} id - معرف سجل إتمام الطلب
   * @param {Object} fulfillmentData - بيانات سجل إتمام الطلب المحدثة
   * @returns {Promise<Object>} - سجل إتمام الطلب المحدث
   */
  async update(id, fulfillmentData) {
    const {
      status,
      trackingCompany,
      trackingNumber,
      trackingUrl,
      shippedAt,
      deliveredAt,
      metadata
    } = fulfillmentData;
    
    const updates = [];
    const values = [];
    
    // إضافة الحقول المراد تحديثها
    if (status !== undefined) {
      updates.push(`status = $${updates.length + 1}`);
      values.push(status);
    }
    
    if (trackingCompany !== undefined) {
      updates.push(`tracking_company = $${updates.length + 1}`);
      values.push(trackingCompany);
    }
    
    if (trackingNumber !== undefined) {
      updates.push(`tracking_number = $${updates.length + 1}`);
      values.push(trackingNumber);
    }
    
    if (trackingUrl !== undefined) {
      updates.push(`tracking_url = $${updates.length + 1}`);
      values.push(trackingUrl);
    }
    
    if (shippedAt !== undefined) {
      updates.push(`shipped_at = $${updates.length + 1}`);
      values.push(shippedAt);
    }
    
    if (deliveredAt !== undefined) {
      updates.push(`delivered_at = $${updates.length + 1}`);
      values.push(deliveredAt);
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
      `UPDATE fulfillments
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, order_id, external_id, status, tracking_company,
                 tracking_number, tracking_url, shipped_at, delivered_at,
                 created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  },
  
  /**
   * حذف سجل إتمام طلب
   * @param {number} id - معرف سجل إتمام الطلب
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async delete(id) {
    // بدء المعاملة
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // الحصول على معلومات سجل إتمام الطلب
      const fulfillmentResult = await client.query(
        `SELECT order_id FROM fulfillments WHERE id = $1`,
        [id]
      );
      
      if (fulfillmentResult.rows.length === 0) {
        return false;
      }
      
      const orderId = fulfillmentResult.rows[0].order_id;
      
      // حذف عناصر سجل إتمام الطلب
      await client.query(
        'DELETE FROM fulfillment_items WHERE fulfillment_id = $1',
        [id]
      );
      
      // حذف سجل إتمام الطلب
      await client.query(
        'DELETE FROM fulfillments WHERE id = $1',
        [id]
      );
      
      // تحديث حالة إتمام الطلب
      // تحديث حالة إتمام الطلب بناءً على العناصر المتممة
      const itemsResult = await client.query(
        `SELECT oi.id, oi.quantity, COALESCE(SUM(fi.quantity), 0) AS fulfilled_quantity
         FROM order_items oi
         LEFT JOIN fulfillment_items fi ON oi.id = fi.order_item_id
         WHERE oi.order_id = $1
         GROUP BY oi.id, oi.quantity`,
        [orderId]
      );
      
      const allItems = itemsResult.rows;
      const allFulfilled = allItems.every(item => item.fulfilled_quantity >= item.quantity);
      const someFulfilled = allItems.some(item => item.fulfilled_quantity > 0);
      
      let newStatus = 'unfulfilled';
      
      if (allFulfilled) {
        newStatus = 'fulfilled';
      } else if (someFulfilled) {
        newStatus = 'partial';
      }
      
      await client.query(
        `UPDATE orders
         SET fulfillment_status = $1, updated_at = NOW()
         WHERE id = $2`,
        [newStatus, orderId]
      );
      
      // تأكيد المعاملة
      await client.query('COMMIT');
      
      return true;
    } catch (error) {
      // التراجع عن المعاملة في حالة حدوث خطأ
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // إعادة العميل إلى التجمع
      client.release();
    }
  }
};

module.exports = Fulfillment;