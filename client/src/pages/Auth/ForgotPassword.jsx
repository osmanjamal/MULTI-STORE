import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return setError('يرجى إدخال البريد الإلكتروني');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await forgotPassword(email);
      setSuccess('تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إرسال بريد إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">استعادة كلمة المرور</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="أدخل بريدك الإلكتروني"
              required
            />
          </div>
          
          <Button
            type="submit"
            loading={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200"
          >
            إرسال تعليمات إعادة التعيين
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              العودة إلى تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;