const Order = require('../../models/order');
const Store = require('../../models/store');
const Inventory = require('../../models/inventory');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في الطلبات
 */
const orderController = {
  /**
   * الحصول على جميع الطلبات
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getOrders(req, res, next) {
    try {
      const { storeId } = req.params;
      const { 
        page = 1, 
        limit = 20,
        query,
        financialStatus,
        fulfillmentStatus,
        startDate,
        endDate,
        sortBy,
        sortOrder
      } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // بناء مرشحات البحث
      const filters = {
        query,
        financialStatus,
        fulfillmentStatus,
        startDate,
        endDate,
        sortBy,
        sortOrder
      };
      
      // الحصول على الطلبات
      const orders = await Order.search(filters, parseInt(storeId), parseInt(page), parseInt(limit));
      
      res.status(200).json(formatApiResponse(orders));
    } catch (error) {
      logger.error('خطأ في الحصول على الطلبات:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على طلب بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على الطلب
      const order = await Order.findById(id);
      
      if (!order) {
        throw new NotFoundError('الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا الطلب');
      }
      
      res.status(200).json(formatApiResponse({ order }));
    } catch (error) {
      logger.error('خطأ في الحصول على الطلب:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء طلب جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createOrder(req, res, next) {
    try {
      const { storeId } = req.params;
      const orderData = req.body;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // التحقق من وجود عناصر الطلب
      if (!orderData.orderItems || !Array.isArray(orderData.orderItems) || orderData.orderItems.length === 0) {
        throw new ValidationError('يجب أن يحتوي الطلب على عنصر واحد على الأقل');
      }
      
      // إضافة معرف المتجر للطلب
      orderData.storeId = parseInt(storeId);
      
      // إنشاء الطلب
      const order = await Order.create(orderData);
      
      res.status(201).json(formatApiResponse({ order }, 'success', 'تم إنشاء الطلب بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء الطلب:', error);
      next(error);
    }
  },
  
  /**
   * تحديث طلب
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const {
        financialStatus,
        fulfillmentStatus,
        paymentMethod,
        shippingMethod,
        notes,
        tags,
        metadata
      } = req.body;
      
      // الحصول على الطلب
      const order = await Order.findById(id);
      
      if (!order) {
        throw new NotFoundError('الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا الطلب');
      }
      
      // تحديث الطلب
      const updatedOrder = await Order.update(id, {
        financialStatus,
        fulfillmentStatus,
        paymentMethod,
        shippingMethod,
        notes,
        tags,
        metadata
      });
      
      // إذا تم تغيير حالة إتمام الطلب إلى "تم الإتمام"، يمكن تحديث المخزون
      if (fulfillmentStatus === 'fulfilled' && order.fulfillment_status !== 'fulfilled') {
        // تحديث المخزون لعناصر الطلب
        for (const item of order.order_items) {
          if (item.product_id) {
            // البحث عن المخزون المناسب
            const inventoryItems = await Inventory.findByProductId(item.product_id, order.store_id);
            let inventoryItem;
            
            if (item.variant_id && inventoryItems) {
              inventoryItem = inventoryItems.find(inv => inv.variant_id === item.variant_id);
            } else if (inventoryItems && inventoryItems.length > 0) {
              inventoryItem = inventoryItems[0];
            }
            
            if (inventoryItem) {
              // تحديث المخزون
              await Inventory.adjustQuantity(inventoryItem.id, -item.quantity);
            }
          }
        }
      }
      
      res.status(200).json(formatApiResponse({ 
        order: updatedOrder 
      }, 'success', 'تم تحديث الطلب بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث الطلب:', error);
      next(error);
    }
  },
  
  /**
   * إلغاء طلب
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      // الحصول على الطلب
      const order = await Order.findById(id);
      
      if (!order) {
        throw new NotFoundError('الطلب غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(order.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بإلغاء هذا الطلب');
      }
      
      // التحقق من إمكانية إلغاء الطلب
      if (order.fulfillment_status === 'fulfilled') {
        throw new ValidationError('لا يمكن إلغاء طلب تم إتمامه بالفعل');
      }
      
      // تحديث الطلب
      const metadata = order.metadata || {};
      metadata.cancellation = {
        cancelledAt: new Date(),
        reason: reason || 'تم إلغاء الطلب بواسطة المسؤول',
        userId: req.user.id
      };
      
      const updatedOrder = await Order.update(id, {
        financialStatus: 'cancelled',
        fulfillmentStatus: 'cancelled',
        metadata
      });
      
      //// إذا كان الطلب قد تم تخفيض المخزون له، يمكن إعادة المخزون
      if (order.fulfillment_status === 'partial' || order.financial_status === 'paid') {
        // إعادة المخزون لعناصر الطلب
        for (const item of order.order_items) {
          if (item.product_id) {
            // البحث عن المخزون المناسب
            const inventoryItems = await Inventory.findByProductId(item.product_id, order.store_id);
            let inventoryItem;
            
            if (item.variant_id && inventoryItems) {
              inventoryItem = inventoryItems.find(inv => inv.variant_id === item.variant_id);
            } else if (inventoryItems && inventoryItems.length > 0) {
              inventoryItem = inventoryItems[0];
            }
            
            if (inventoryItem) {
              // إعادة المخزون
              await Inventory.adjustQuantity(inventoryItem.id, item.quantity);
            }
          }
        }
      }
      
      res.status(200).json(formatApiResponse({ 
        order: updatedOrder 
      }, 'success', 'تم إلغاء الطلب بنجاح'));
    } catch (error) {
      logger.error('خطأ في إلغاء الطلب:', error);
      next(error);
    }
  },
  
  /**
   * البحث عن الطلبات
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async searchOrders(req, res, next) {
    try {
      const { storeId } = req.params;
      const { 
        page = 1, 
        limit = 20,
        query,
        financialStatus,
        fulfillmentStatus,
        startDate,
        endDate,
        sortBy,
        sortOrder
      } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // بناء مرشحات البحث
      const filters = {
        query,
        financialStatus,
        fulfillmentStatus,
        startDate,
        endDate,
        sortBy,
        sortOrder
      };
      
      // البحث عن الطلبات
      const orders = await Order.search(filters, parseInt(storeId), parseInt(page), parseInt(limit));
      
      res.status(200).json(formatApiResponse(orders));
    } catch (error) {
      logger.error('خطأ في البحث عن الطلبات:', error);
      next(error);
    }
  },
  
  /**
   * استيراد طلبات من ملف خارجي
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async importOrders(req, res, next) {
    try {
      const { storeId } = req.params;
      const { orders } = req.body;
      
      if (!orders || !Array.isArray(orders) || orders.length === 0) {
        throw new ValidationError('يرجى توفير بيانات الطلبات للاستيراد');
      }
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // استيراد الطلبات
      const importResults = {
        success: [],
        errors: []
      };
      
      for (const orderData of orders) {
        try {
          // التحقق من وجود الطلب بالفعل (باستخدام رقم الطلب أو المعرف الخارجي)
          let existingOrder;
          
          if (orderData.orderNumber) {
            existingOrder = await Order.findByOrderNumber(orderData.orderNumber, parseInt(storeId));
          } else if (orderData.externalId) {
            existingOrder = await Order.findByExternalId(orderData.externalId, parseInt(storeId));
          }
          
          if (existingOrder) {
            importResults.errors.push({
              orderNumber: orderData.orderNumber || orderData.externalId,
              error: 'الطلب موجود بالفعل'
            });
            continue;
          }
          
          // إضافة معرف المتجر للطلب
          orderData.storeId = parseInt(storeId);
          
          // إنشاء الطلب
          const order = await Order.create(orderData);
          
          importResults.success.push({
            orderId: order.id,
            orderNumber: order.order_number
          });
        } catch (orderError) {
          importResults.errors.push({
            orderNumber: orderData.orderNumber || orderData.externalId,
            error: orderError.message
          });
        }
      }
      
      res.status(200).json(formatApiResponse({ 
        importResults,
        totalSuccess: importResults.success.length,
        totalErrors: importResults.errors.length
      }, 'success', 'تم استيراد الطلبات بنجاح'));
    } catch (error) {
      logger.error('خطأ في استيراد الطلبات:', error);
      next(error);
    }
  }
};

module.exports = orderController;