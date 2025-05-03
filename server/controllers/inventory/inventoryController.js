const Inventory = require('../../models/inventory');
const Product = require('../../models/product');
const Variant = require('../../models/variant');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في المخزون
 */
const inventoryController = {
  /**
   * الحصول على جميع سجلات المخزون لمتجر معين
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getInventory(req, res, next) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على سجلات المخزون
      const inventoryData = await Inventory.findByStoreId(storeId, parseInt(page), parseInt(limit));
      
      res.status(200).json(formatApiResponse(inventoryData));
    } catch (error) {
      logger.error('خطأ في الحصول على المخزون:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجل مخزون بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getInventoryById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على سجل المخزون
      const inventory = await Inventory.findById(id);
      
      if (!inventory) {
        throw new NotFoundError('سجل المخزون غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(inventory.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المخزون');
      }
      
      res.status(200).json(formatApiResponse({ inventory }));
    } catch (error) {
      logger.error('خطأ في الحصول على سجل المخزون:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على سجلات مخزون منتج
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getProductInventory(req, res, next) {
    try {
      const { productId, storeId } = req.params;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // التحقق من وجود المنتج
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      // الحصول على سجلات مخزون المنتج
      const inventory = await Inventory.findByProductId(productId, storeId);
      
      res.status(200).json(formatApiResponse({ 
        product: {
          id: product.id,
          title: product.title,
          sku: product.sku,
          barcode: product.barcode
        },
        inventory 
      }));
    } catch (error) {
      logger.error('خطأ في الحصول على مخزون المنتج:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء أو تحديث سجل مخزون
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateOrCreateInventory(req, res, next) {
    try {
      const { storeId } = req.params;
      const {
        productId,
        variantId,
        locationId = 1,
        quantity,
        sku,
        inventoryItemId,
        externalId,
        metadata
      } = req.body;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // التحقق من وجود المنتج
      if (productId) {
        const product = await Product.findById(productId);
        
        if (!product) {
          throw new NotFoundError('المنتج غير موجود');
        }
      }
      
      // التحقق من وجود المتغير
      if (variantId) {
        const variant = await Variant.findById(variantId);
        
        if (!variant) {
          throw new NotFoundError('متغير المنتج غير موجود');
        }
      }
      
      // إنشاء أو تحديث سجل المخزون
      const inventory = await Inventory.updateOrCreate({
        storeId: parseInt(storeId),
        productId,
        variantId,
        locationId,
        quantity,
        sku,
        inventoryItemId,
        externalId,
        metadata
      });
      
      res.status(200).json(formatApiResponse({ 
        inventory 
      }, 'success', 'تم تحديث المخزون بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث المخزون:', error);
      next(error);
    }
  },
  
  /**
   * تحديث كمية المخزون
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateInventoryQuantity(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (quantity === undefined) {
        throw new ValidationError('يرجى توفير الكمية');
      }
      
      // الحصول على سجل المخزون
      const inventoryItem = await Inventory.findById(id);
      
      if (!inventoryItem) {
        throw new NotFoundError('سجل المخزون غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(inventoryItem.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المخزون');
      }
      
      // تحديث كمية المخزون
      const updatedInventory = await Inventory.updateQuantity(id, quantity);
      
      res.status(200).json(formatApiResponse({ 
        inventory: updatedInventory 
      }, 'success', 'تم تحديث كمية المخزون بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث كمية المخزون:', error);
      next(error);
    }
  },
  
  /**
   * حذف سجل مخزون
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteInventory(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على سجل المخزون
      const inventoryItem = await Inventory.findById(id);
      
      if (!inventoryItem) {
        throw new NotFoundError('سجل المخزون غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(inventoryItem.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذا المخزون');
      }
      
      // حذف سجل المخزون
      await Inventory.delete(id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف سجل المخزون بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف سجل المخزون:', error);
      next(error);
    }
  }
};

module.exports = inventoryController;