import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      toast.success('تم تسجيل الدخول بنجاح');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تسجيل الدخول');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('تم إنشاء الحساب بنجاح');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل إنشاء الحساب');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل إرسال رابط إعادة التعيين');
      return false;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('تم تغيير كلمة المرور بنجاح');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تغيير كلمة المرور');
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      const updatedUser = response.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('تم تحديث الملف الشخصي بنجاح');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تحديث الملف الشخصي');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('تم تغيير كلمة المرور بنجاح');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تغيير كلمة المرور');
      return false;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };
};

export default useAuth;