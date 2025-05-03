import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

const AccountSettings = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  const { changePassword, deleteAccount, logout } = useAuth();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validar las contraseñas
    if (newPassword !== confirmPassword) {
      return setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
    }
    
    if (newPassword.length < 8) {
      return setError('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل');
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      await changePassword({
        currentPassword,
        newPassword
      });
      
      setSuccess('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'حذف الحساب') {
      return setError('يرجى كتابة "حذف الحساب" للتأكيد');
    }
    
    try {
      setDeleting(true);
      setError('');
      
      await deleteAccount();
      
      // Cerrar sesión después de eliminar la cuenta
      logout();
      
      // La redirección a la página de inicio de sesión debería manejarse en el hook useAuth
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حذف الحساب. يرجى المحاولة مرة أخرى.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إعدادات الحساب</h1>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        {/* Cambiar contraseña */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">تغيير كلمة المرور</h2>
          
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                loading={submitting}
                disabled={submitting}
              >
                تغيير كلمة المرور
              </Button>
            </div>
          </form>
        </div>
        
        {/* Eliminar cuenta */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
          <h2 className="text-xl font-semibold mb-4 text-red-600">حذف الحساب</h2>
          <p className="text-gray-600 mb-4">
            سيؤدي حذف حسابك إلى إزالة جميع بياناتك وإلغاء وصولك إلى النظام بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
          </p>
          
          <div className="flex justify-end">
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              حذف الحساب
            </Button>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación para eliminar cuenta */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد حذف الحساب"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك ومتاجرك ومنتجاتك وسجلات المزامنة.
          </p>
          
          <p className="font-bold mb-4">
            للتأكيد، اكتب "حذف الحساب" في الحقل أدناه:
          </p>
          
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mb-4"
            placeholder="حذف الحساب"
            disabled={deleting}
          />
          
          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              إلغاء
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={deleting}
              disabled={deleteConfirmation !== 'حذف الحساب' || deleting}
            >
              تأكيد الحذف
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default AccountSettings;