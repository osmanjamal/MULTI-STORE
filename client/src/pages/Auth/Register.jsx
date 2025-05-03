import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import { Alert } from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      setError('');
      setLoading(true);
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل التسجيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">إنشاء حساب جديد</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <RegisterForm onSubmit={handleRegister} loading={loading} />
        
        <div className="mt-4 text-center">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;