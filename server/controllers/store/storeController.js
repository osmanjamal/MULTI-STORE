const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في المتاجر
 */
const storeController = {
  /**
   * الحصول على جميع متاجر المستخدم
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getStores(req, res, next) {
    try {
      // الحصول على متاجر المستخدم
      const stores = await Store.findByUserId(req.user.id);
      
      res.status(200).json(formatApiResponse({ stores }));
    } catch (error) {
      logger.error('خطأ في الحصول على المتاجر:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على متجر بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getStoreById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المتجر
      const store = await Store.findById(id);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      // التحقق من ملكية المتجر
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      res.status(200).json(formatApiResponse({ store }));
    } catch (error) {
      logger.error('خطأ في الحصول على المتجر:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء متجر جديد
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createStore(req, res, next) {
    try {
      const {
        name,
        type,
        url,
        apiKey,
        apiSecret,
        accessToken,
        consumerKey,
        consumerSecret,
        isMain
      } = req.body;
      
      // التحقق من اسم المتجر
      if (!name || name.trim() === '') {
        throw new ValidationError('يرجى توفير اسم المتجر');
      }
      
      // التحقق من نوع المتجر
      const validTypes = ['shopify', 'lazada', 'shopee', 'woocommerce'];
      if (!type || !validTypes.includes(type)) {
        throw new ValidationError('نوع المتجر غير صالح');
      }
      
      // التحقق من عنوان URL
      if (!url || url.trim() === '') {
        throw new ValidationError('يرجى توفير عنوان URL للمتجر');
      }
      
      // التحقق من بيانات الاعتماد المطلوبة حسب نوع المتجر
      if (type === 'shopify' && (!apiKey || !apiSecret)) {
        throw new ValidationError('يرجى توفير مفتاح API وسر API لمتجر شوبيفاي');
      }
      
      if ((type === 'lazada' || type === 'shopee') && !accessToken) {
        throw new ValidationError(`يرجى توفير رمز الوصول لمتجر ${type}`);
      }
      
      if (type === 'woocommerce' && (!consumerKey || !consumerSecret)) {
        throw new ValidationError('يرجى توفير مفتاح المستهلك وسر المستهلك لمتجر ووكومرس');
      }
      
      // إنشاء المتجر
      const store = await Store.create({
        name,
        type,
        url,
        apiKey,
        apiSecret,
        accessToken,
        consumerKey,
        consumerSecret,
        isMain
      }, req.user.id);
      
      res.status(201).json(formatApiResponse({ 
        store 
      }, 'success', 'تم إنشاء المتجر بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء المتجر:', error);
      next(error);
    }
  },
  
  /**
   * تحديث متجر
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateStore(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        url,
        apiKey,
        apiSecret,
        accessToken,
        consumerKey,
        consumerSecret,
        isMain
      } = req.body;
      
      // الحصول على المتجر
      const store = await Store.findById(id);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      // التحقق من ملكية المتجر
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا المتجر');
      }
      
      // تحديث المتجر
      const updatedStore = await Store.update(id, {
        name,
        url,
        apiKey,
        apiSecret,
        accessToken,
        consumerKey,
        consumerSecret,
        isMain
      }, req.user.id);
      
      res.status(200).json(formatApiResponse({ 
        store: updatedStore 
      }, 'success', 'تم تحديث المتجر بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث المتجر:', error);
      next(error);
    }
  },
  
  /**
   * حذف متجر
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteStore(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المتجر
      const store = await Store.findById(id);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      // التحقق من ملكية المتجر
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذا المتجر');
      }
      
      // حذف المتجر
      await Store.delete(id, req.user.id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف المتجر بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف المتجر:', error);
      next(error);
    }
  },
  
  /**
   * تعيين المتجر الرئيسي
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async setMainStore(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المتجر
      const store = await Store.findById(id);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      // التحقق من ملكية المتجر
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا المتجر');
      }
      
      // تحديث المتجر ليكون المتجر الرئيسي
      const updatedStore = await Store.update(id, {
        isMain: true
      }, req.user.id);
      
      res.status(200).json(formatApiResponse({ 
        store: updatedStore 
      }, 'success', 'تم تعيين المتجر الرئيسي بنجاح'));
    } catch (error) {
      logger.error('خطأ في تعيين المتجر الرئيسي:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على بيانات اعتماد المتجر (للاستخدام الداخلي فقط)
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getStoreCredentials(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على المتجر مع بيانات الاعتماد
      const store = await Store.findByIdWithCredentials(id);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      // التحقق من ملكية المتجر
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى بيانات اعتماد هذا المتجر');
      }
      
      res.status(200).json(formatApiResponse({ store }));
    } catch (error) {
      logger.error('خطأ في الحصول على بيانات اعتماد المتجر:', error);
      next(error);
    }
  }
};

module.exports = storeController;