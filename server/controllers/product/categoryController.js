const Category = require('../../models/category');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في فئات المنتجات
 */
const categoryController = {
  /**
   * الحصول على جميع الفئات
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getCategories(req, res, next) {
    try {
      const { storeId } = req.params;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على الفئات
      const categories = await Category.findByStoreId(parseInt(storeId));
      
      // تنظيم الفئات في شكل شجرة
      const categoryMap = {};
      const categoryTree = [];
      
      // إنشاء خريطة للفئات
      categories.forEach(category => {
        // نسخة جديدة مع حقل children
        const categoryWithChildren = {
          ...category,
          children: []
        };
        
        categoryMap[category.id] = categoryWithChildren;
      });
      
      // بناء الشجرة
      categories.forEach(category => {
        if (category.parent_id && categoryMap[category.parent_id]) {
          // إضافة الفئة كفئة فرعية للفئة الأب
          categoryMap[category.parent_id].children.push(categoryMap[category.id]);
        } else {
          // إضافة الفئة للمستوى الأعلى
          categoryTree.push(categoryMap[category.id]);
        }
      });
      
      res.status(200).json(formatApiResponse({ categories: categoryTree }));
    } catch (error) {
      logger.error('خطأ في الحصول على الفئات:', error);
      next(error);
    }
  },
  
  /**
   * الحصول على فئة بواسطة المعرف
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على الفئة
      const category = await Category.findById(id);
      
      if (!category) {
        throw new NotFoundError('الفئة غير موجودة');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(category.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذه الفئة');
      }
      
      // الحصول على الفئات الفرعية
      const children = await Category.findChildren(id);
      
      // إضافة الفئات الفرعية للفئة
      category.children = children;
      
      res.status(200).json(formatApiResponse({ category }));
    } catch (error) {
      logger.error('خطأ في الحصول على الفئة:', error);
      next(error);
    }
  },
  
  /**
   * إنشاء فئة جديدة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async createCategory(req, res, next) {
    try {
      const { storeId } = req.params;
      const {
        externalId,
        name,
        parentId,
        description,
        image,
        isActive = true,
        slug,
        order,
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
      
      // التحقق من اسم الفئة
      if (!name || name.trim() === '') {
        throw new ValidationError('يرجى توفير اسم الفئة');
      }
      
      // التحقق من وجود الفئة الأب إذا تم تحديدها
      if (parentId) {
        const parentCategory = await Category.findById(parentId);
        
        if (!parentCategory) {
          throw new NotFoundError('الفئة الأب غير موجودة');
        }
        
        if (parentCategory.store_id !== parseInt(storeId)) {
          throw new ValidationError('الفئة الأب لا تنتمي إلى نفس المتجر');
        }
      }
      
      // إنشاء الفئة
      const category = await Category.create({
        storeId: parseInt(storeId),
        externalId,
        name,
        parentId: parentId || null,
        description,
        image,
        isActive,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        order: order || 0,
        metadata
      });
      
      res.status(201).json(formatApiResponse({ 
        category 
      }, 'success', 'تم إنشاء الفئة بنجاح'));
    } catch (error) {
      logger.error('خطأ في إنشاء الفئة:', error);
      next(error);
    }
  },
  
  /**
   * تحديث فئة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        parentId,
        description,
        image,
        isActive,
        slug,
        order,
        metadata
      } = req.body;
      
      // الحصول على الفئة
      const category = await Category.findById(id);
      
      if (!category) {
        throw new NotFoundError('الفئة غير موجودة');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(category.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذه الفئة');
      }
      
      // التحقق من وجود الفئة الأب إذا تم تحديدها
      if (parentId && parentId !== category.parent_id) {
        // التحقق من أن الفئة الأب ليست الفئة نفسها
        if (parseInt(parentId) === parseInt(id)) {
          throw new ValidationError('لا يمكن أن تكون الفئة أب لنفسها');
        }
        
        const parentCategory = await Category.findById(parentId);
        
        if (!parentCategory) {
          throw new NotFoundError('الفئة الأب غير موجودة');
        }
        
        if (parentCategory.store_id !== category.store_id) {
          throw new ValidationError('الفئة الأب لا تنتمي إلى نفس المتجر');
        }
      }
      
      // تحديث الفئة
      const updatedCategory = await Category.update(id, {
        name,
        parentId,
        description,
        image,
        isActive,
        slug,
        order,
        metadata
      });
      
      res.status(200).json(formatApiResponse({ 
        category: updatedCategory 
      }, 'success', 'تم تحديث الفئة بنجاح'));
    } catch (error) {
      logger.error('خطأ في تحديث الفئة:', error);
      next(error);
    }
  },
  
  /**
   * حذف فئة
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      // الحصول على الفئة
      const category = await Category.findById(id);
      
      if (!category) {
        throw new NotFoundError('الفئة غير موجودة');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(category.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بحذف هذه الفئة');
      }
      
      // حذف الفئة
      await Category.delete(id);
      
      res.status(200).json(formatApiResponse(null, 'success', 'تم حذف الفئة بنجاح'));
    } catch (error) {
      logger.error('خطأ في حذف الفئة:', error);
      next(error);
    }
  }
};

module.exports = categoryController;