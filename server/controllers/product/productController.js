const Product = require('../../models/product');
const Variant = require('../../models/variant');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في المنتجات
 */
const productController = {
  /**
   * الحصول على جميع المنتجات
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getProducts(req, res, next) {
    try {
      const { storeId } = req.params;
      const { 
        page = 1, 
        limit = 20,
        query,
        status,
        productType,
        vendor,
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
        status,
        productType,
        vendor,
        sortBy,
        sortOrder
      };
      
      // الحصول على المنتجات
      const products = await Product.search(filters, parseInt(storeId), parseInt(page), parseInt(limit));
      
      res.status(200).json(formatApiResponse(products));
    } catch (error) {
      logger.error('خطأ في الحصول على المنتجات:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على منتج بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المنتج
      const product = await Product.findById(id);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المنتج');
      }
      
      // الحصول على المتغيرات
      const variants = await Variant.findByProductId(product.id);
      
      // إضافة المتغيرات للمنتج
      product.variants = variants;
      
      res.status(200).json(formatApiResponse({ product }));
    } catch (error) {
      logger.error('خطأ في الحصول على المنتج:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء منتج جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createProduct(req, res, next) {
    try {
      const { storeId } = req.params;
      const {
        externalId,
        title,
        description,
        sku,
        barcode,
        vendor,
        productType,
        tags,
        status = 'active',
        options,
        images,
        variants,
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
      
      // التحقق من عنوان المنتج
      if (!title || title.trim() === '') {
        throw new ValidationError('يرجى توفير عنوان المنتج');
      }
      
      // إنشاء المنتج
      const productData = {
        storeId: parseInt(storeId),
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
        variants: [], // سيتم إضافة المتغيرات لاحقاً
        metadata
      };
      
      const product = await Product.create(productData);
      
      // إضافة المتغيرات إذا كانت متوفرة
      const createdVariants = [];
      
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const variantData of variants) {
          // إضافة معرف المنتج للمتغير
          variantData.productId = product.id;
          
          // إنشاء المتغير
          const variant = await Variant.create(variantData);
          createdVariants.push(variant);
        }
      } else {
        // إنشاء متغير افتراضي
        const defaultVariant = await Variant.create({
          productId: product.id,
          title: 'Default',
          sku: sku || `${product.id}-default`,
          price: 0,
          inventoryManagement: 'shopify',
          inventoryPolicy: 'deny',
          options: {}
        });
        
        createdVariants.push(defaultVariant);
      }
      
      // إضافة المتغيرات للاستجابة
      product.variants = createdVariants;
      
      res.status(201).json(formatApiResponse({ 
        product 
      }, 'success', 'تم إنشاء المنتج بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء المنتج:', error);
      next(error);
    }
  },
  
  /**
   * تحديث منتج
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
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
        metadata
      } = req.body;
      
      // الحصول على المنتج
      const product = await Product.findById(id);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا المنتج');
      }
      
      // تحديث المنتج
      const updatedProduct = await Product.update(id, {
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
        metadata
      });
      
      // الحصول على المتغيرات المحدثة
      const variants = await Variant.findByProductId(id);
      
      // إضافة المتغيرات للاستجابة
      updatedProduct.variants = variants;
      
      res.status(200).json(formatApiResponse({ 
        product: updatedProduct 
      }, 'success', 'تم تحديث المنتج بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث المنتج:', error);
      next(error);
    }
  },
  
  /**
   * حذف منتج
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المنتج
      const product = await Product.findById(id);
      
      if (!product) {
        throw new NotFoundError('المنتج غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(product.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذا المنتج');
      }
      
      // حذف المتغيرات أولاً
      const variants = await Variant.findByProductId(id);
      
      for (const variant of variants) {
        await Variant.delete(variant.id);
      }
      
      // حذف المنتج
      await Product.delete(id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف المنتج بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف المنتج:', error);
      next(error);
    }
  },
  
  /**
   * البحث عن المنتجات
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async searchProducts(req, res, next) {
    try {
      const { storeId } = req.params;
      const { 
        page = 1, 
        limit = 20,
        query,
        status,
        productType,
        vendor,
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
        status,
        productType,
        vendor,
        sortBy,
        sortOrder
      };
      
      // البحث عن المنتجات
      const products = await Product.search(filters, parseInt(storeId), parseInt(page), parseInt(limit));
      
      res.status(200).json(formatApiResponse(products));
    } catch (error) {
      logger.error('خطأ في البحث عن المنتجات:', error);
      next(error);
    }
  }
};

module.exports = productController;