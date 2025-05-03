import axios from 'axios';

// قراءة عنوان API من ملف البيئة أو استخدام القيمة الافتراضية
const API_URL = 'http://localhost:4000/api';

// إنشاء نسخة من axios مع الإعدادات الافتراضية
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة معترض للطلبات لإضافة رمز المصادقة
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('multi_store_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// إضافة معترض للاستجابات لمعالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة خطأ انتهاء صلاحية الرمز (401)
    if (error.response && error.response.status === 401) {
      // حذف رمز المصادقة من التخزين المحلي
      localStorage.removeItem('multi_store_token');
      localStorage.removeItem('multi_store_user');
      
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // استخراج رسالة الخطأ
    const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ غير معروف';
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * دالة مساعدة لتنفيذ طلبات GET
 * @param {string} url - عنوان الطلب
 * @param {Object} params - معايير الاستعلام
 * @returns {Promise} وعد بالبيانات
 */
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دالة مساعدة لتنفيذ طلبات POST
 * @param {string} url - عنوان الطلب
 * @param {Object} data - البيانات المرسلة
 * @param {Object} options - خيارات إضافية
 * @returns {Promise} وعد بالبيانات
 */
export const post = async (url, data = {}, options = {}) => {
  try {
    const response = await api.post(url, data, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دالة مساعدة لتنفيذ طلبات PUT
 * @param {string} url - عنوان الطلب
 * @param {Object} data - البيانات المرسلة
 * @param {Object} options - خيارات إضافية
 * @returns {Promise} وعد بالبيانات
 */
export const put = async (url, data = {}, options = {}) => {
  try {
    const response = await api.put(url, data, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دالة مساعدة لتنفيذ طلبات PATCH
 * @param {string} url - عنوان الطلب
 * @param {Object} data - البيانات المرسلة
 * @param {Object} options - خيارات إضافية
 * @returns {Promise} وعد بالبيانات
 */
export const patch = async (url, data = {}, options = {}) => {
  try {
    const response = await api.patch(url, data, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دالة مساعدة لتنفيذ طلبات DELETE
 * @param {string} url - عنوان الطلب
 * @param {Object} options - خيارات إضافية
 * @returns {Promise} وعد بالبيانات
 */
export const del = async (url, options = {}) => {
  try {
    const response = await api.delete(url, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دالة مساعدة لتحميل الملفات
 * @param {string} url - عنوان الطلب
 * @param {FormData} formData - بيانات النموذج
 * @param {Function} onProgress - دالة للتقدم (اختيارية)
 * @returns {Promise} وعد بالبيانات
 */
export const upload = async (url, formData, onProgress = null) => {
  const options = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  if (onProgress) {
    options.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(percentCompleted);
    };
  }
  
  try {
    const response = await api.post(url, formData, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * دالة مساعدة لتنزيل الملفات
 * @param {string} url - عنوان الطلب
 * @param {Object} params - معايير الاستعلام
 * @param {string} filename - اسم الملف المُنزل
 * @returns {Promise} وعد بالبيانات
 */
export const download = async (url, params = {}, filename = '') => {
  try {
    const response = await api.get(url, {
      params,
      responseType: 'blob',
    });
    
    // إنشاء رابط تنزيل
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // استخدام اسم الملف المقدم أو استخراجه من الاستجابة
    const contentDisposition = response.headers['content-disposition'];
    const extractedFilename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/["']/g, '')
      : filename || 'download';
    
    link.setAttribute('download', extractedFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, filename: extractedFilename };
  } catch (error) {
    throw error;
  }
};

// تصدير كائن api للاستخدام المباشر عند الحاجة
export default api;
