import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { Alert } from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      setError('');
      setLoading(true);
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <LoginForm onSubmit={handleLogin} loading={loading} />
        
        <div className="mt-4 text-center">
          <p>
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              إنشاء حساب جديد
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
            <a href="#">نسيت كلمة المرور؟</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;