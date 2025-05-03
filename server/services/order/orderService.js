const Order = require('../../models/order');
const { NotFoundError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

exports.getAllOrders = async (storeId, filters = {}, page = 1, limit = 20) => {
  return await Order.search(filters, storeId, page, limit);
};

exports.getOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new NotFoundError('الطلب غير موجود');
  return order;
};

exports.getOrderByExternalId = async (externalId, storeId) => {
  return await Order.findByExternalId(externalId, storeId);
};

exports.getOrderByOrderNumber = async (orderNumber, storeId) => {
  return await Order.findByOrderNumber(orderNumber, storeId);
};

exports.createOrder = async (orderData) => {
  logger.info(`إنشاء طلب جديد: ${orderData.orderNumber}`);
  return await Order.create(orderData);
};

exports.updateOrder = async (id, orderData) => {
  const order = await Order.findById(id);
  if (!order) throw new NotFoundError('الطلب غير موجود');
  
  logger.info(`تحديث طلب: ${id}`);
  return await Order.update(id, orderData);
};