import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Alert } from '../../components/common';
import { FiKey, FiCopy, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ApiSettings = () => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production Key',
      key: 'pk_9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      secret: '6d58bc6bf8f1d9c14f3d6e9eb9c5a5b1a9c2d6e4f8b2c6a8b5d4c3a6b9c8e6f2',
      active: true
    },
    {
      id: 2,
      name: 'Development Key',
      key: 'pk_dev_2a2f8f5d9c3b7a6e1d0c9b8a7f6e5d4c3b2a1c9f8e7d6c5b4a3d2e1f0c9b8a7',
      secret: 'sk_dev_4f6e8d0c1b2a3d5c7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
      active: true
    }
  ]);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('تم نسخ المفتاح بنجاح');
  };

  const handleRegenerateKey = (id) => {
    // Here you would call your API to regenerate the key
    toast.success('تم تجديد المفتاح بنجاح');
  };

  const handleToggleKey = (id) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, active: !key.active } : key
    ));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">إعدادات API</h1>
            <p className="mt-2 text-sm text-gray-600">
              إدارة مفاتيح API لتكامل تطبيقك مع النظام
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* API Keys List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">مفاتيح API</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {apiKeys.map(key => (
                    <div key={key.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <FiKey className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="text-base font-medium text-gray-900">{key.name}</h3>
                            <p className="text-sm text-gray-500">
                              آخر استخدام: منذ 2 أيام
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleKey(key.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              key.active ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`transform transition ease-in-out duration-200 inline-block h-4 w-4 transform rounded-full bg-white ${
                              key.active ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Public Key
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={key.key}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm"
                            />
                            <button
                              onClick={() => handleCopyKey(key.key)}
                              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              <FiCopy className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Secret Key
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              value={key.secret}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm"
                            />
                            <button
                              onClick={() => handleCopyKey(key.secret)}
                              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              <FiCopy className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleRegenerateKey(key.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FiRefreshCw className="w-4 h-4" />
                            تجديد المفتاح
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <FiKey className="w-4 h-4" />
                    إنشاء مفتاح جديد
                  </button>
                </div>
              </div>
            </div>

            {/* API Documentation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">وثائق API</h2>
                
                <p className="text-sm text-gray-600 mb-6">
                  استخدم مفاتيح API هذه لتكامل تطبيقك مع نظامنا. اقرأ الوثائق للحصول على تعليمات مفصلة.
                </p>

                <Alert 
                  variant="warning" 
                  title="تحذير"
                  message="لا تشارك مفاتيح API مع أي شخص غير مصرح له. احتفظ بها في مكان آمن."
                />

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">الإضافات المدعومة</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      REST API
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Webhooks
                    </li> 
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                     <div className="w-2 h-2 rounded-full bg-green-500" />
                     OAuth 2.0
                   </li>
                 </ul>
               </div>

               <div className="mt-6 pt-6 border-t border-gray-200">
                 <a 
                   href="/docs/api" 
                   className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                 >
                   عرض وثائق API
                   <FiExternalLink className="w-4 h-4" />
                 </a>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </Layout>
 );
};

export default ApiSettings; 