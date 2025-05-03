import { get, post, put, del, upload, download } from './api';

/**
 * خدمة المنتجات
 * توفر وظائف للتعامل مع المنتجات وفئاتها
 */
export const productService = {
  /**
   * جلب قائمة المنتجات
   * @param {string} storeId - معرف المتجر
   * @param {Object} params - معايير البحث والفلترة
   * @returns {Promise} وعد بقائمة المنتجات ومعلومات الصفحات
   */
  async getProducts(storeId, params = {}) {
    try {
      const response = await get(`/stores/${storeId}/products`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب منتج واحد بالمعرف
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @returns {Promise} وعد ببيانات المنتج
   */
  async getProductById(storeId, productId) {
    try {
      const response = await get(`/stores/${storeId}/products/${productId}`);
      return response.product;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إنشاء منتج جديد
   * @param {string} storeId - معرف المتجر
   * @param {Object} productData - بيانات المنتج الجديد
   * @returns {Promise} وعد ببيانات المنتج الجديد
   */
  async createProduct(storeId, productData) {
    try {
      const response = await post(`/stores/${storeId}/products`, productData);
      return response.product;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث بيانات منتج
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {Object} updatedData - البيانات المحدثة
   * @returns {Promise} وعد ببيانات المنتج المحدثة
   */
  async updateProduct(storeId, productId, updatedData) {
    try {
      const response = await put(
        `/stores/${storeId}/products/${productId}`,
        updatedData
      );
      return response.product;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حذف منتج
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @returns {Promise} وعد بنتيجة العملية
   */
  async deleteProduct(storeId, productId) {
    try {
      const response = await del(`/stores/${storeId}/products/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحميل صور للمنتج
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {FormData} formData - بيانات الصور
   * @param {Function} onProgress - دالة للتقدم (اختيارية)
   * @returns {Promise} وعد بمعلومات الصور المحملة
   */
  async uploadProductImages(storeId, productId, formData, onProgress = null) {
    try {
      const response = await upload(
        `/stores/${storeId}/products/${productId}/images`,
        formData,
        onProgress
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حذف صورة منتج
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {string} imageId - معرف الصورة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async deleteProductImage(storeId, productId, imageId) {
    try {
      const response = await del(
        `/stores/${storeId}/products/${productId}/images/${imageId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب فئات المنتجات
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بقائمة الفئات
   */
  async getCategories(storeId) {
    try {
      const response = await get(`/stores/${storeId}/categories`);
      return response.categories;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إنشاء فئة جديدة
   * @param {string} storeId - معرف المتجر
   * @param {Object} categoryData - بيانات الفئة الجديدة
   * @returns {Promise} وعد ببيانات الفئة الجديدة
   */
  async createCategory(storeId, categoryData) {
    try {
      const response = await post(
        `/stores/${storeId}/categories`,
        categoryData
      );
      return response.category;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث بيانات فئة
   * @param {string} storeId - معرف المتجر
   * @param {string} categoryId - معرف الفئة
   * @param {Object} updatedData - البيانات المحدثة
   * @returns {Promise} وعد ببيانات الفئة المحدثة
   */
  async updateCategory(storeId, categoryId, updatedData) {
    try {
      const response = await put(
        `/stores/${storeId}/categories/${categoryId}`,
        updatedData
      );
      return response.category;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حذف فئة
   * @param {string} storeId - معرف المتجر
   * @param {string} categoryId - معرف الفئة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async deleteCategory(storeId, categoryId) {
    try {
      const response = await del(`/stores/${storeId}/categories/${categoryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * استيراد المنتجات
   * @param {string} storeId - معرف المتجر
   * @param {FormData} fileData - بيانات ملف الاستيراد
   * @param {Object} options - خيارات الاستيراد
   * @returns {Promise} وعد بنتيجة عملية الاستيراد
   */
  async importProducts(storeId, fileData, options = {}) {
    try {
      // إضافة خيارات الاستيراد إلى FormData
      Object.keys(options).forEach((key) => {
        fileData.append(key, options[key]);
      });

      const response = await upload(
        `/stores/${storeId}/products/import`,
        fileData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تصدير المنتجات
   * @param {string} storeId - معرف المتجر
   * @param {Object} options - خيارات التصدير
   * @returns {Promise} وعد برابط تنزيل الملف المصدر
   */
  async exportProducts(storeId, options = {}) {
    try {
      const format = options.format || 'csv';
      const response = await download(
        `/stores/${storeId}/products/export`,
        options,
        `products_export_${new Date().toISOString()}.${format}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب روابط المنتجات بين المتاجر
   * @param {string} sourceStoreId - معرف المتجر المصدر
   * @param {string} targetStoreId - معرف المتجر الهدف
   * @returns {Promise} وعد بقائمة الروابط
   */
  async getProductMappings(sourceStoreId, targetStoreId) {
    try {
      const response = await get('/product-mappings', {
        sourceStoreId,
        targetStoreId,
      });
      return response.mappings;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إنشاء ربط بين منتجين
   * @param {string} sourceProductId - معرف المنتج المصدر
   * @param {string} targetProductId - معرف المنتج الهدف
   * @param {string} sourceStoreId - معرف المتجر المصدر
   * @param {string} targetStoreId - معرف المتجر الهدف
   * @returns {Promise} وعد ببيانات الربط الجديد
   */
  async createProductMapping(
    sourceProductId,
    targetProductId,
    sourceStoreId,
    targetStoreId
  ) {
    try {
      const response = await post('/product-mappings', {
        sourceProductId,
        targetProductId,
        sourceStoreId,
        targetStoreId,
      });
      return response.mapping;
    } catch (error) {
      throw error;
    }
  },

  /**
   * حذف ربط بين منتجين
   * @param {string} mappingId - معرف الربط
   * @returns {Promise} وعد بنتيجة العملية
   */
  async deleteProductMapping(mappingId) {
    try {
      const response = await del(`/product-mappings/${mappingId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * البحث في المنتجات عبر جميع المتاجر
   * @param {string} query - نص البحث
   * @param {Object} options - خيارات البحث
   * @returns {Promise} وعد بنتائج البحث
   */
  async searchProducts(query, options = {}) {
    try {
      const response = await get('/products/search', {
        query,
        ...options,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب السمات المتاحة للمنتجات
   * @param {string} storeId - معرف المتجر
   * @returns {Promise} وعد بقائمة السمات
   */
  async getProductAttributes(storeId) {
    try {
      const response = await get(`/stores/${storeId}/product-attributes`);
      return response.attributes;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب منتجات مشابهة
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {number} limit - عدد النتائج (اختياري)
   * @returns {Promise} وعد بقائمة المنتجات المشابهة
   */
  async getSimilarProducts(storeId, productId, limit = 5) {
    try {
      const response = await get(
        `/stores/${storeId}/products/${productId}/similar`,
        { limit }
      );
      return response.products;
    } catch (error) {
      throw error;
    }
  },

  /**
   * جلب مراجعات المنتج
   * @param {string} storeId - معرف المتجر
   * @param {string} productId - معرف المنتج
   * @param {Object} params - معايير الفلترة
   * @returns {Promise} وعد بقائمة المراجعات
   */
  async getProductReviews(storeId, productId, params = {}) {
    try {
      const response = await get(
        `/stores/${storeId}/products/${productId}/reviews`,
        params
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default productService;