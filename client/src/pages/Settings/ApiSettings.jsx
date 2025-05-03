import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

const ApiSettings = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState(null);
  
  const { getApiKeys, generateApiKey, revokeApiKey } = useAuth();

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setLoading(true);
        const keys = await getApiKeys();
        setApiKeys(keys || []);
      } catch (err) {
        setError('فشل تحميل مفاتيح API');
        console.error('API keys fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, [getApiKeys]);

  const handleGenerateKey = async () => {
    try {
      setGenerating(true);
      setError('');
      
      const newKey = await generateApiKey();
      setNewApiKey(newKey.key);
      
      // Actualizar la lista de claves
      setApiKeys([...apiKeys, newKey]);
      
      // Mostrar modal con la nueva clave
      setShowNewKeyModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إنشاء مفتاح API جديد. يرجى المحاولة مرة أخرى.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    setKeyToRevoke(null);
    
    try {
      setConfirming(true);
      setError('');
      setSuccess('');
      
      await revokeApiKey(keyId);
      
      // Actualizar la lista de claves
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      
      setSuccess('تم إلغاء مفتاح API بنجاح');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إلغاء مفتاح API. يرجى المحاولة مرة أخرى.');
    } finally {
      setConfirming(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccess('تم نسخ المفتاح إلى الحافظة');
      })
      .catch(() => {
        setError('فشل نسخ المفتاح. يرجى النسخ يدويًا.');
      });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إعدادات API</h1>
          <Button
            onClick={handleGenerateKey}
            loading={generating}
            disabled={generating}
          >
            إنشاء مفتاح API جديد
          </Button>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">مفاتيح API</h2>
          
          <p className="text-gray-600 mb-6">
            استخدم مفاتيح API للاتصال بالنظام من تطبيقاتك الخارجية. لا تشارك مفاتيح API الخاصة بك مع أي شخص.
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader size="lg" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
              <p className="text-gray-500 mb-4">لا توجد مفاتيح API حالية</p>
              <Button
                onClick={handleGenerateKey}
                loading={generating}
                disabled={generating}
              >
                إنشاء مفتاح API جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      آخر استخدام
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {key.name || 'مفتاح API'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.lastUsed ? formatDate(key.lastUsed) : 'لم يستخدم بعد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => setKeyToRevoke(key)}
                          className="text-red-600 hover:text-red-900"
                          disabled={confirming}
                        >
                          إلغاء
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">وثائق API</h2>
          <p className="text-gray-600 mb-4">
            اطلع على وثائق API لمعرفة كيفية استخدام واجهة برمجة التطبيقات لدمج النظام مع تطبيقاتك.
          </p>
          
            href="/docs/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            عرض وثائق API
          </a>
        </div>
      </div>
      
      {/* Modal para mostrar nueva clave API */}
      <Modal
        isOpen={showNewKeyModal}
        onClose={() => setShowNewKeyModal(false)}
        title="مفتاح API الجديد"
      >
        <div className="p-6">
          <Alert type="warning" message="هذه هي المرة الوحيدة التي سيتم فيها عرض مفتاح API بالكامل. يرجى نسخه وتخزينه في مكان آمن." className="mb-4" />
          
          <div className="bg-gray-100 p-4 rounded-md font-mono mb-4 break-all">
            {newApiKey}
          </div>
          
          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button
              onClick={() => copyToClipboard(newApiKey)}
            >
              نسخ المفتاح
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowNewKeyModal(false)}
            >
              تم
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal de confirmación para revocar clave */}
      <Modal
        isOpen={keyToRevoke !== null}
        onClose={() => setKeyToRevoke(null)}
        title="تأكيد إلغاء مفتاح API"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            هل أنت متأكد من رغبتك في إلغاء هذا المفتاح؟ ستتوقف جميع التطبيقات التي تستخدم هذا المفتاح عن العمل.
          </p>
          
          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button
              variant="secondary"
              onClick={() => setKeyToRevoke(null)}
              disabled={confirming}
            >
              إلغاء
            </Button>
            
            <Button
              variant="danger"
              onClick={() => handleRevokeKey(keyToRevoke.id)}
              loading={confirming}
              disabled={confirming}
            >
              تأكيد الإلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ApiSettings;