import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    language: 'ar',
    timezone: 'Asia/Riyadh',
  });
  
  const { getCurrentUser, updateProfile } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          language: userData.language || 'ar',
          timezone: userData.timezone || 'Asia/Riyadh',
        });
      } catch (err) {
        setError('فشل تحميل بيانات الملف الشخصي');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [getCurrentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      await updateProfile(formData);
      setSuccess('تم تحديث بيانات الملف الشخصي بنجاح');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث بيانات الملف الشخصي. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إعدادات الملف الشخصي</h1>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    اللغة المفضلة
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={submitting}
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                    المنطقة الزمنية
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={submitting}
                  >
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                    <option value="Asia/Kuwait">الكويت (GMT+3)</option>
                    <option value="Asia/Bahrain">البحرين (GMT+3)</option>
                    <option value="Asia/Qatar">قطر (GMT+3)</option>
                    <option value="Europe/London">لندن (GMT+0)</option>
                    <option value="America/New_York">نيويورك (GMT-5)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                >
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfileSettings;