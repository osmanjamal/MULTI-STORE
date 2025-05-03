const Fulfillment = require('../../models/fulfillment');
const Order = require('../../models/order');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في إتمام الطلبات
 */
const fulfillmentController = {
  /**
   * إنشاء سجل إتمام جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createFulfillment(req, res, next) {
    try {
      const { orderId } = req.params;
      const {
        externalId,
        status,
        trackingCompany,
        trackingNumber,
        trackingUrl,
        shippedAt,
        deliveredAt,
        items,
        metadata
      } = req.body;
      
      // التحقق من وجود الطلب
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new NotFoundError('الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا الطلب');
      }
      
      // التحقق من صحة البيانات
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError('يرجى تحديد عناصر الطلب التي سيتم إتمامها');
      }
      
      // التحقق من أن عناصر الطلب موجودة
      for (const item of items) {
        if (!item.orderItemId) {
          throw new ValidationError('يرجى تحديد معرف عنصر الطلب');
        }
        
        // يمكن إضافة تحقق من وجود عنصر الطلب هنا
      }
      
      // إنشاء سجل إتمام الطلب
      const fulfillment = await Fulfillment.create({
        orderId: parseInt(orderId),
        externalId,
        status: status || 'success',
        trackingCompany,
        trackingNumber,
        trackingUrl,
        shippedAt: shippedAt || new Date(),
        deliveredAt,
        items,
        metadata
      });
      
      res.status(201).json(formatApiResponse({ 
        fulfillment 
      }, 'success', 'تم إنشاء سجل إتمام الطلب بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء سجل إتمام الطلب:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجل إتمام بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getFulfillmentById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على سجل إتمام الطلب
      const fulfillment = await Fulfillment.findById(id);
      
      if (!fulfillment) {
        throw new NotFoundError('سجل إتمام الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const order = await Order.findById(fulfillment.order_id);
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا السجل');
      }
      
      res.status(200).json(formatApiResponse({ fulfillment }));
    } catch (error) {
      logger.error('خطأ في الحصول على سجل إتمام الطلب:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجلات إتمام طلب
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getOrderFulfillments(req, res, next) {
    try {
      const { orderId } = req.params;
      
      // التحقق من وجود الطلب
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new NotFoundError('الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا الطلب');
      }
      
      // الحصول على سجلات إتمام الطلب
      const fulfillments = await Fulfillment.findByOrderId(orderId);
      
      res.status(200).json(formatApiResponse({ 
        order: {
          id: order.id,
          orderNumber: order.order_number,
          fulfillmentStatus: order.fulfillment_status
        },
        fulfillments 
      }));
    } catch (error) {
      logger.error('خطأ في الحصول على سجلات إتمام الطلب:', error);
      next(error);
    }
  },
  
  /**
   * تحديث سجل إتمام طلب
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateFulfillment(req, res, next) {
    try {
      const { id } = req.params;
      const {
        status,
        trackingCompany,
        trackingNumber,
        trackingUrl,
        shippedAt,
        deliveredAt,
        metadata
      } = req.body;
      
      // الحصول على سجل إتمام الطلب
      const fulfillment = await Fulfillment.findById(id);
      
      if (!fulfillment) {
        throw new NotFoundError('سجل إتمام الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const order = await Order.findById(fulfillment.order_id);
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا السجل');
      }
      
      // تحديث سجل إتمام الطلب
      const updatedFulfillment = await Fulfillment.update(id, {
        status,
        trackingCompany,
        trackingNumber,
        trackingUrl,
        shippedAt,
        deliveredAt,
        metadata
      });
      
      res.status(200).json(formatApiResponse({ 
        fulfillment: updatedFulfillment 
      }, 'success', 'تم تحديث سجل إتمام الطلب بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث سجل إتمام الطلب:', error);
      next(error);
    }
  },
  
  /**
   * حذف سجل إتمام طلب
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteFulfillment(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على سجل إتمام الطلب
      const fulfillment = await Fulfillment.findById(id);
      
      if (!fulfillment) {
        throw new NotFoundError('سجل إتمام الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const order = await Order.findById(fulfillment.order_id);
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذا السجل');
      }
      
      // حذف سجل إتمام الطلب
      await Fulfillment.delete(id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف سجل إتمام الطلب بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف سجل إتمام الطلب:', error);
      next(error);
    }
  }
};

module.exports = fulfillmentController;