const Fulfillment = require('../../models/fulfillment');
const Order = require('../../models/order');
const { NotFoundError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

exports.getFulfillmentsByOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError('الطلب غير موجود');
  
  return await Fulfillment.findByOrderId(orderId);
};

exports.getFulfillment = async (id) => {
  const fulfillment = await Fulfillment.findById(id);
  if (!fulfillment) throw new NotFoundError('سجل إتمام الطلب غير موجود');
  
  return fulfillment;
};

exports.getFulfillmentByExternalId = async (externalId, orderId) => {
  return await Fulfillment.findByExternalId(externalId, orderId);
};

exports.createFulfillment = async (fulfillmentData) => {
  const order = await Order.findById(fulfillmentData.orderId);
  if (!order) throw new NotFoundError('الطلب غير موجود');
  
  logger.info(`إنشاء سجل إتمام للطلب: ${fulfillmentData.orderId}`);
  return await Fulfillment.create(fulfillmentData);
};

exports.updateFulfillment = async (id, fulfillmentData) => {
  const fulfillment = await Fulfillment.findById(id);
  if (!fulfillment) throw new NotFoundError('سجل إتمام الطلب غير موجود');
  
  logger.info(`تحديث سجل إتمام الطلب: ${id}`);
  return await Fulfillment.update(id, fulfillmentData);
};

exports.deleteFulfillment = async (id) => {
  const fulfillment = await Fulfillment.findById(id);
  if (!fulfillment) throw new NotFoundError('سجل إتمام الطلب غير موجود');
  
  logger.info(`حذف سجل إتمام الطلب: ${id}`);
  return await Fulfillment.delete(id);
};