import React, { useState, useEffect } from 'react';
import { useSync } from '../../hooks/useSync';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FaSave, FaRedo, FaCog } from 'react-icons/fa';

const SyncSettings = () => {
  const { settings, loading, error, fetchSettings, updateSettings, runAllSyncRules } = useSync();
  
  const [formData, setFormData] = useState({
    maxConcurrentSyncs: 3,
    defaultSyncInterval: 60,
    retryFailedSync: true,
    maxRetryAttempts: 3,
    retryDelay: 5,
    notifyOnError: true,
    notifyOnSuccess: false,
    notificationEmail: '',
    autoCreateProducts: true,
    updateExistingProducts: true,
    syncDeletedItems: false,
    logLevel: 'info',
    logRetentionDays: 30,
    webhookSecret: '',
    throttling: {
      enabled: true,
      requestsPerMinute: 60
    }
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRunAllModal, setShowRunAllModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  useEffect(() => {
    const loadSettings = async () => {
      const fetchedSettings = await fetchSettings();
      if (fetchedSettings) {
        setFormData(fetchedSettings);
      }
    };
    
    loadSettings();
  }, [fetchSettings]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (formData.maxConcurrentSyncs < 1) {
      errors.maxConcurrentSyncs = 'يجب أن يكون العدد أكبر من صفر';
    }
    
    if (formData.defaultSyncInterval < 5) {
      errors.defaultSyncInterval = 'يجب أن تكون الفترة 5 دقائق على الأقل';
    }
    
    if (formData.retryFailedSync && formData.maxRetryAttempts < 1) {
      errors.maxRetryAttempts = 'يجب أن يكون العدد أكبر من صفر';
    }
    
    if (formData.notifyOnError || formData.notifyOnSuccess) {
      if (!formData.notificationEmail) {
        errors.notificationEmail = 'يرجى إدخال البريد الإلكتروني للإشعارات';
      } else if (!/\S+@\S+\.\S+/.test(formData.notificationEmail)) {
        errors.notificationEmail = 'يرجى إدخال بريد إلكتروني صحيح';
      }
    }
    
    if (formData.logRetentionDays < 1) {
      errors.logRetentionDays = 'يجب أن تكون فترة الاحتفاظ يوم واحد على الأقل';
    }
    
    if (formData.throttling.enabled && formData.throttling.requestsPerMinute < 1) {
      errors['throttling.requestsPerMinute'] = 'يجب أن يكون العدد أكبر من صفر';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    const success = await updateSettings(formData);
    
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    
    setIsLoading(false);
  };
  
  const handleRunAllSync = () => {
    setShowRunAllModal(true);
  };
  
  const confirmRunAllSync = async () => {
    setIsLoading(true);
    await runAllSyncRules();
    setShowRunAllModal(false);
    setIsLoading(false);
  };
  
  const cancelRunAllSync = () => {
    setShowRunAllModal(false);
  };
  
  if (loading) return <Loader />;
  
  return (
    <div className="sync-settings-container">
      <div className="sync-settings-header">
        <h2 className="settings-title">إعدادات المزامنة</h2>
        <div className="settings-actions">
          <Button type="secondary" onClick={handleRunAllSync}>
            <FaRedo className="mr-2" /> تشغيل كافة المزامنات
          </Button>
        </div>
      </div>
      
      {error && <Alert type="error" message={error} />}
      {saveSuccess && <Alert type="success" message="تم حفظ الإعدادات بنجاح" />}
      
      <form onSubmit={handleSubmit} className="sync-settings-form">
        <div className="settings-section">
          <h3 className="section-title">
            <FaCog className="section-icon" /> إعدادات عامة
          </h3>
          
          <div className="form-group">
            <label htmlFor="maxConcurrentSyncs">الحد الأقصى للمزامنات المتزامنة</label>
            <input
              type="number"
              id="maxConcurrentSyncs"
              name="maxConcurrentSyncs"
              value={formData.maxConcurrentSyncs}
              onChange={handleChange}
              min="1"
              className={formErrors.maxConcurrentSyncs ? 'input-error' : ''}
            />
            {formErrors.maxConcurrentSyncs && <div className="error-message">{formErrors.maxConcurrentSyncs}</div>}
            <div className="field-description">عدد عمليات المزامنة التي يمكن تشغيلها في نفس الوقت</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="defaultSyncInterval">الفترة الافتراضية للمزامنة (دقائق)</label>
            <input
              type="number"
              id="defaultSyncInterval"
              name="defaultSyncInterval"
              value={formData.defaultSyncInterval}
              onChange={handleChange}
              min="5"
              className={formErrors.defaultSyncInterval ? 'input-error' : ''}
            />
            {formErrors.defaultSyncInterval && <div className="error-message">{formErrors.defaultSyncInterval}</div>}
            <div className="field-description">الفترة الافتراضية بين عمليات المزامنة الدورية</div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="autoCreateProducts"
                checked={formData.autoCreateProducts}
                onChange={handleChange}
              />
              إنشاء منتجات جديدة تلقائياً
            </label>
            <div className="field-description">إنشاء منتجات جديدة في المتجر الهدف إذا لم تكن موجودة</div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="updateExistingProducts"
                checked={formData.updateExistingProducts}
                onChange={handleChange}
              />
              تحديث المنتجات الموجودة
            </label>
            <div className="field-description">تحديث المنتجات الموجودة في المتجر الهدف</div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="syncDeletedItems"
                checked={formData.syncDeletedItems}
                onChange={handleChange}
              />
              مزامنة العناصر المحذوفة
            </label>
            <div className="field-description">حذف العناصر من المتجر الهدف عندما يتم حذفها من المتجر المصدر</div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">إعدادات إعادة المحاولة</h3>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="retryFailedSync"
                checked={formData.retryFailedSync}
                onChange={handleChange}
              />
              إعادة محاولة المزامنات الفاشلة
            </label>
            <div className="field-description">إعادة محاولة عمليات المزامنة التي فشلت تلقائياً</div>
          </div>
          
          {formData.retryFailedSync && (
            <>
              <div className="form-group">
                <label htmlFor="maxRetryAttempts">الحد الأقصى لمحاولات إعادة المزامنة</label>
                <input
                  type="number"
                  id="maxRetryAttempts"
                  name="maxRetryAttempts"
                  value={formData.maxRetryAttempts}
                  onChange={handleChange}
                  min="1"
                  className={formErrors.maxRetryAttempts ? 'input-error' : ''}
                />
                {formErrors.maxRetryAttempts && <div className="error-message">{formErrors.maxRetryAttempts}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="retryDelay">فترة الانتظار قبل إعادة المحاولة (دقائق)</label>
                <input
                  type="number"
                  id="retryDelay"
                  name="retryDelay"
                  value={formData.retryDelay}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">إعدادات الإشعارات</h3>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notifyOnError"
                checked={formData.notifyOnError}
                onChange={handleChange}
              />
              إرسال إشعار عند حدوث خطأ
            </label>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notifyOnSuccess"
                checked={formData.notifyOnSuccess}
                onChange={handleChange}
              />
              إرسال إشعار عند نجاح المزامنة
            </label>
          </div>
          
          {(formData.notifyOnError || formData.notifyOnSuccess) && (
            <div className="form-group">
              <label htmlFor="notificationEmail">البريد الإلكتروني للإشعارات</label>
              <input
                type="email"
                id="notificationEmail"
                name="notificationEmail"
                value={formData.notificationEmail}
                onChange={handleChange}
                className={formErrors.notificationEmail ? 'input-error' : ''}
              />
              {formErrors.notificationEmail && <div className="error-message">{formErrors.notificationEmail}</div>}
            </div>
          )}
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">إعدادات السجلات</h3>
          
          <div className="form-group">
            <label htmlFor="logLevel">مستوى تفاصيل السجلات</label>
            <select
              id="logLevel"
              name="logLevel"
              value={formData.logLevel}
              onChange={handleChange}
            >
              <option value="error">أخطاء فقط</option>
              <option value="warn">أخطاء وتحذيرات</option>
              <option value="info">معلومات عامة</option>
              <option value="debug">تفاصيل للتصحيح</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="logRetentionDays">فترة الاحتفاظ بالسجلات (أيام)</label>
            <input
              type="number"
              id="logRetentionDays"
              name="logRetentionDays"
              value={formData.logRetentionDays}
              onChange={handleChange}
              min="1"
              className={formErrors.logRetentionDays ? 'input-error' : ''}
            />
            {formErrors.logRetentionDays && <div className="error-message">{formErrors.logRetentionDays}</div>}
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">إعدادات متقدمة</h3>
          
          <div className="form-group">
            <label htmlFor="webhookSecret">مفتاح سري للويب هوك</label>
            <div className="webhook-secret-field">
              <input
                type="password"
                id="webhookSecret"
                name="webhookSecret"
                value={formData.webhookSecret}
                onChange={handleChange}
              />
              <button
                type="button"
                className="generate-secret-button"
                onClick={() => {
                  const newSecret = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);
                  setFormData(prev => ({ ...prev, webhookSecret: newSecret }));
                }}
              >
                توليد
              </button>
            </div>
            <div className="field-description">مفتاح سري للتحقق من صحة طلبات الويب هوك الواردة</div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="throttling.enabled"
                checked={formData.throttling.enabled}
                onChange={handleChange}
              />
              تفعيل تحديد معدل الطلبات (Throttling)
            </label>
            <div className="field-description">تحديد عدد الطلبات إلى واجهات برمجة التطبيقات الخارجية</div>
          </div>
          
          {formData.throttling.enabled && (
            <div className="form-group">
              <label htmlFor="throttlingRequestsPerMinute">الحد الأقصى للطلبات في الدقيقة</label>
              <input
                type="number"
                id="throttlingRequestsPerMinute"
                name="throttling.requestsPerMinute"
                value={formData.throttling.requestsPerMinute}
                onChange={handleChange}
                min="1"
                className={formErrors['throttling.requestsPerMinute'] ? 'input-error' : ''}
              />
              {formErrors['throttling.requestsPerMinute'] && 
                <div className="error-message">{formErrors['throttling.requestsPerMinute']}</div>}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <Button type="primary" submit disabled={isLoading}>
            <FaSave className="mr-2" /> حفظ الإعدادات
          </Button>
        </div>
      </form>
      
      {showRunAllModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>تأكيد تشغيل كافة المزامنات</h3>
            <p>هل أنت متأكد من رغبتك في تشغيل جميع قواعد المزامنة النشطة الآن؟</p>
            <p className="modal-warning">قد يؤدي هذا إلى زيادة الحمل على المتاجر وواجهات برمجة التطبيقات.</p>
            <div className="modal-actions">
              <Button type="primary" onClick={confirmRunAllSync} disabled={isLoading}>تشغيل الكل</Button>
              <Button type="secondary" onClick={cancelRunAllSync}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncSettings;