const Variant = require('../../models/variant');
const Product = require('../../models/product');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في متغيرات المنتجات
 */
const variantController = {
  /**
   * الحصول على جميع متغيرات المنتج
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getVariants(req, res, next) {
    try {
      const { productId } = req.params;
      
      // الحصول على المنتج
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المنتج');
      }
      
      // الحصول على المتغيرات
      const variants = await Variant.findByProductId(productId);
      
      res.status(200).json(formatApiResponse({ 
        product: {
          id: product.id,
          title: product.title
        },
        variants 
      }));
    } catch (error) {
      logger.error('خطأ في الحصول على متغيرات المنتج:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على متغير بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getVariantById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المتغير
      const variant = await Variant.findById(id);
      
      if (!variant) {
        throw new NotFoundError('متغير المنتج غير موجود');
      }
      
      // الحصول على المنتج
      const product = await Product.findById(variant.product_id);
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتغير');
      }
      
      res.status(200).json(formatApiResponse({ 
        variant,
        product: {
          id: product.id,
          title: product.title
        }
      }));
    } catch (error) {
      logger.error('خطأ في الحصول على متغير المنتج:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء متغير جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createVariant(req, res, next) {
    try {
      const { productId } = req.params;
      const {
        externalId,
        title,
        sku,
        barcode,
        price,
        compareAtPrice,
        weight,
        weightUnit,
        options,
        inventoryItemId,
        inventoryManagement,
        inventoryPolicy,
        metadata
      } = req.body;
      
      // الحصول على المنتج
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المنتج');
      }
      
      // التحقق من عنوان المتغير
      if (!title || title.trim() === '') {
        throw new ValidationError('يرجى توفير عنوان المتغير');
      }
      
      // التحقق من SKU
      if (sku) {
        // البحث عن متغير بنفس SKU في نفس المتجر
        const existingVariant = await Variant.findBySku(sku, product.store_id);
        
        if (existingVariant) {
          throw new ValidationError('يوجد متغير آخر يستخدم نفس SKU');
        }
      }
      
      // إنشاء المتغير
      const variant = await Variant.create({
        productId: parseInt(productId),
        externalId,
        title,
        sku,
        barcode,
        price,
        compareAtPrice,
        weight,
        weightUnit,
        options,
        inventoryItemId,
        inventoryManagement: inventoryManagement || 'shopify',
        inventoryPolicy: inventoryPolicy || 'deny',
        metadata
      });
      
      res.status(201).json(formatApiResponse({ 
        variant 
      }, 'success', 'تم إنشاء متغير المنتج بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء متغير المنتج:', error);
      next(error);
    }
  },
  
  /**
   * تحديث متغير
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateVariant(req, res, next) {
    try {
      const { id } = req.params;
      const {
        title,
        sku,
        barcode,
        price,
        compareAtPrice,
        weight,
        weightUnit,
        options,
        inventoryItemId,
        inventoryManagement,
        inventoryPolicy,
        metadata
      } = req.body;
      
      // الحصول على المتغير
      const variant = await Variant.findById(id);
      
      if (!variant) {
        throw new NotFoundError('متغير المنتج غير موجود');
      }
      
      // الحصول على المنتج
      const product = await Product.findById(variant.product_id);
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا المتغير');
      }
      
      // التحقق من SKU
      if (sku && sku !== variant.sku) {
        // البحث عن متغير بنفس SKU في نفس المتجر
        const existingVariant = await Variant.findBySku(sku, product.store_id);
        
        if (existingVariant && existingVariant.id !== parseInt(id)) {
          throw new ValidationError('يوجد متغير آخر يستخدم نفس SKU');
        }
      }
      
      // تحديث المتغير
      const updatedVariant = await Variant.update(id, {
        title,
        sku,
        barcode,
        price,
        compareAtPrice,
        weight,
        weightUnit,
        options,
        inventoryItemId,
        inventoryManagement,
        inventoryPolicy,
        metadata
      });
      
      res.status(200).json(formatApiResponse({ 
        variant: updatedVariant 
      }, 'success', 'تم تحديث متغير المنتج بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث متغير المنتج:', error);
      next(error);
    }
  },
  
  /**
   * حذف متغير
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteVariant(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المتغير
      const variant = await Variant.findById(id);
      
      if (!variant) {
        throw new NotFoundError('متغير المنتج غير موجود');
      }
      
      // الحصول على المنتج
      const product = await Product.findById(variant.product_id);
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذا المتغير');
      }
      
      // التحقق من عدم حذف المتغير الوحيد للمنتج
      const variants = await Variant.findByProductId(variant.product_id);
      
      if (variants.length === 1) {
        throw new ValidationError('لا يمكن حذف المتغير الوحيد للمنتج');
      }
      
      // حذف المتغير
      await Variant.delete(id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف متغير المنتج بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف متغير المنتج:', error);
      next(error);
    }
  }
};

module.exports = variantController;