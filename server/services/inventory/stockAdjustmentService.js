const Inventory = require('../../models/inventory');
const { NotFoundError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

exports.adjustStock = async (id, adjustment, reason = '') => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new NotFoundError('سجل المخزون غير موجود');
  
  logger.info(`تعديل المخزون: ${id}, الكمية: ${adjustment}, السبب: ${reason}`);
  
  // تسجيل حركة المخزون
  await pool.query(
    `INSERT INTO inventory_movements (
      inventory_id, quantity_before, adjustment, quantity_after, reason, user_id
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, inventory.quantity, adjustment, inventory.quantity + adjustment, reason, 1]
  );
  
  return await Inventory.adjustQuantity(id, adjustment);
};

exports.setStock = async (id, quantity, reason = '') => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new NotFoundError('سجل المخزون غير موجود');
  
  const adjustment = quantity - inventory.quantity;
  logger.info(`تعيين المخزون: ${id}, الكمية الجديدة: ${quantity}, السبب: ${reason}`);
  
  // تسجيل حركة المخزون
  await pool.query(
    `INSERT INTO inventory_movements (
      inventory_id, quantity_before, adjustment, quantity_after, reason, user_id
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, inventory.quantity, adjustment, quantity, reason, 1]
  );
  
  return await Inventory.updateQuantity(id, quantity);
};