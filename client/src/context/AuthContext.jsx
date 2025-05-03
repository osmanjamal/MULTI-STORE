import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

// إنشاء سياق المصادقة
export const AuthContext = createContext();

const TOKEN_KEY = 'multi_store_token';
const USER_DATA_KEY = 'multi_store_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // وظيفة تحميل بيانات المستخدم
  const loadUserData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // محاولة تحميل بيانات المستخدم من التخزين المحلي أولاً
      const cachedUser = localStorage.getItem(USER_DATA_KEY);
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      
      // طلب بيانات المستخدم الحالي من الخادم
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // تحديث بيانات المستخدم في التخزين المحلي
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (err) {
      console.error('فشل تحميل بيانات المستخدم:', err);
      setError('فشل تحميل بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
      // حذف البيانات المخزنة محلياً في حالة الخطأ
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  // تحميل بيانات المستخدم عند تحميل الصفحة أو تغيير الرمز
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);
  
  // وظيفة تسجيل الدخول
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      setToken(response.token);
      setUser(response.user);
      
      // تخزين البيانات محلياً
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      
      return true;
    } catch (err) {
      console.error('فشل تسجيل الدخول:', err);
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد والمحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة إنشاء حساب جديد
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      setToken(response.token);
      setUser(response.user);
      
      // تخزين البيانات محلياً
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      
      return true;
    } catch (err) {
      console.error('فشل إنشاء الحساب:', err);
      setError(err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تسجيل الخروج
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('حدث خطأ أثناء تسجيل الخروج:', err);
    } finally {
      // حذف البيانات المخزنة محلياً
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };
  
  // وظيفة تحديث بيانات المستخدم
  const updateUserProfile = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(updatedData);
      setUser(updatedUser);
      
      // تحديث بيانات المستخدم في التخزين المحلي
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      return true;
    } catch (err) {
      console.error('فشل تحديث الملف الشخصي:', err);
      setError(err.message || 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تغيير كلمة المرور
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      console.error('فشل تغيير كلمة المرور:', err);
      setError(err.message || 'فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية والمحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة طلب استعادة كلمة المرور
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.forgotPassword(email);
      return true;
    } catch (err) {
      console.error('فشل طلب استعادة كلمة المرور:', err);
      setError(err.message || 'فشل طلب استعادة كلمة المرور. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة إعادة تعيين كلمة المرور
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(token, newPassword);
      return true;
    } catch (err) {
      console.error('فشل إعادة تعيين كلمة المرور:', err);
      setError(err.message || 'فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى أو طلب رابط جديد.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // القيم التي سيتم توفيرها من خلال السياق
  const contextValue = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError: () => setError(null)
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;