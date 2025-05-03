import { get, post, put } from './api';

/**
 * خدمة المصادقة
 * توفر وظائف للتعامل مع المصادقة والمستخدمين
 */
export const authService = {
  /**
   * تسجيل الدخول
   * @param {string} email - البريد الإلكتروني
   * @param {string} password - كلمة المرور
   * @returns {Promise} وعد ببيانات المستخدم ورمز المصادقة
   */
  async login(email, password) {
    try {
      const response = await post('/auth/login', { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تسجيل حساب جديد
   * @param {Object} userData - بيانات المستخدم الجديد
   * @returns {Promise} وعد ببيانات المستخدم ورمز المصادقة
   */
  async register(userData) {
    try {
      const response = await post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تسجيل الخروج
   * @returns {Promise} وعد بنتيجة العملية
   */
  async logout() {
    try {
      const response = await post('/auth/logout');
      return response;
    } catch (error) {
      // حتى في حالة الفشل، نعتبر المستخدم قد سجل الخروج محلياً
      return { success: true };
    }
  },

  /**
   * جلب بيانات المستخدم الحالي
   * @returns {Promise} وعد ببيانات المستخدم
   */
  async getCurrentUser() {
    try {
      const response = await get('/auth/me');
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث بيانات المستخدم
   * @param {Object} userData - البيانات المحدثة
   * @returns {Promise} وعد ببيانات المستخدم المحدثة
   */
  async updateProfile(userData) {
    try {
      const response = await put('/auth/profile', userData);
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تغيير كلمة المرور
   * @param {string} currentPassword - كلمة المرور الحالية
   * @param {string} newPassword - كلمة المرور الجديدة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await put('/auth/password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * طلب استعادة كلمة المرور
   * @param {string} email - البريد الإلكتروني
   * @returns {Promise} وعد بنتيجة العملية
   */
  async forgotPassword(email) {
    try {
      const response = await post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إعادة تعيين كلمة المرور
   * @param {string} token - رمز إعادة التعيين
   * @param {string} newPassword - كلمة المرور الجديدة
   * @returns {Promise} وعد بنتيجة العملية
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * التحقق من صلاحية رمز إعادة تعيين كلمة المرور
   * @param {string} token - رمز إعادة التعيين
   * @returns {Promise} وعد بنتيجة التحقق
   */
  async verifyResetToken(token) {
    try {
      const response = await get('/auth/verify-reset-token', { token });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تفعيل حساب المستخدم
   * @param {string} token - رمز التفعيل
   * @returns {Promise} وعد بنتيجة العملية
   */
  async activateAccount(token) {
    try {
      const response = await post('/auth/activate', { token });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * إعادة إرسال رمز التفعيل
   * @param {string} email - البريد الإلكتروني
   * @returns {Promise} وعد بنتيجة العملية
   */
  async resendActivation(email) {
    try {
      const response = await post('/auth/resend-activation', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * التحقق مما إذا كان المستخدم مصادق عليه
   * @returns {boolean} حالة المصادقة
   */
  isAuthenticated() {
    return !!localStorage.getItem('multi_store_token');
  }
};

export default authService;