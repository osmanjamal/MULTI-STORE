import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSync } from '../../hooks/useSync';
import { useStore } from '../../hooks/useStore';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FaSave, FaTimes } from 'react-icons/fa';

const SyncRuleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const { createSyncRule, updateSyncRule, getSyncRule, loading, error } = useSync();
  const { stores, fetchStores, storesLoading } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'product',
    sourceStoreId: '',
    targetStoreId: '',
    isActive: true,
    schedule: 'manual',
    scheduleInterval: 60,
    filters: {
      categories: [],
      tags: [],
      priceRange: { min: 0, max: 0 }
    },
    mappings: {
      priceAdjustment: {
        type: 'none',
        value: 0
      },
      categoryMapping: {},
      fields: {
        title: true,
        description: true,
        images: true,
        variants: true,
        price: true,
        inventory: true
      }
    }
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  useEffect(() => {
    fetchStores();
    
    if (isEditing) {
      const fetchSyncRule = async () => {
        const rule = await getSyncRule(id);
        if (rule) {
          setFormData({
            ...rule,
            sourceStoreId: rule.sourceStore.id,
            targetStoreId: rule.targetStore.id
          });
        }
      };
      
      fetchSyncRule();
    }
  }, [id, isEditing, fetchStores, getSyncRule]);
  
  useEffect(() => {
    // Fetch categories for both stores when they are selected
    if (formData.sourceStoreId && formData.targetStoreId) {
      // This would be handled by a service to get categories from both stores
      // For now, we'll use dummy data
      setCategoryOptions([
        { id: 'cat1', name: 'ملابس' },
        { id: 'cat2', name: 'إلكترونيات' },
        { id: 'cat3', name: 'منزل ومطبخ' },
        { id: 'cat4', name: 'أحذية وحقائب' }
      ]);
    }
  }, [formData.sourceStoreId, formData.targetStoreId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleFieldToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      mappings: {
        ...prev.mappings,
        fields: {
          ...prev.mappings.fields,
          [field]: !prev.mappings.fields[field]
        }
      }
    }));
  };
  
  const handlePriceAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      mappings: {
        ...prev.mappings,
        priceAdjustment: {
          ...prev.mappings.priceAdjustment,
          [name]: value
        }
      }
    }));
  };
  
  const handleCategoryMapping = (sourceCategory, targetCategory) => {
    setFormData(prev => ({
      ...prev,
      mappings: {
        ...prev.mappings,
        categoryMapping: {
          ...prev.mappings.categoryMapping,
          [sourceCategory]: targetCategory
        }
      }
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'يجب إدخال اسم القاعدة';
    }
    
    if (!formData.sourceStoreId) {
      errors.sourceStoreId = 'يجب اختيار المتجر المصدر';
    }
    
    if (!formData.targetStoreId) {
      errors.targetStoreId = 'يجب اختيار المتجر الهدف';
    }
    
    if (formData.sourceStoreId === formData.targetStoreId) {
      errors.targetStoreId = 'يجب أن يكون المتجر الهدف مختلفاً عن المتجر المصدر';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let success = false;
    
    if (isEditing) {
      success = await updateSyncRule(id, formData);
    } else {
      success = await createSyncRule(formData);
    }
    
    if (success) {
      navigate('/sync/rules');
    }
  };
  
  const handleCancel = () => {
    navigate('/sync/rules');
  };
  
  if (loading || storesLoading) return <Loader />;
  
  return (
    <div className="sync-rule-form-container">
      <h2 className="form-title">{isEditing ? 'تعديل قاعدة المزامنة' : 'إضافة قاعدة مزامنة جديدة'}</h2>
      
      {error && <Alert type="error" message={error} />}
      
      <form onSubmit={handleSubmit} className="sync-rule-form">
        <div className="form-section">
          <h3 className="section-title">معلومات أساسية</h3>
          
          <div className="form-group">
            <label htmlFor="name">اسم القاعدة</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">وصف القاعدة</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="type">نوع المزامنة</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="product">مزامنة المنتجات</option>
              <option value="inventory">مزامنة المخزون</option>
              <option value="order">مزامنة الطلبات</option>
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">إعدادات المتاجر</h3>
          
          <div className="form-group">
            <label htmlFor="sourceStoreId">المتجر المصدر</label>
            <select
              id="sourceStoreId"
              name="sourceStoreId"
              value={formData.sourceStoreId}
              onChange={handleChange}
              className={formErrors.sourceStoreId ? 'input-error' : ''}
            >
              <option value="">اختر المتجر المصدر</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            {formErrors.sourceStoreId && <div className="error-message">{formErrors.sourceStoreId}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="targetStoreId">المتجر الهدف</label>
            <select
              id="targetStoreId"
              name="targetStoreId"
              value={formData.targetStoreId}
              onChange={handleChange}
              className={formErrors.targetStoreId ? 'input-error' : ''}
            >
              <option value="">اختر المتجر الهدف</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            {formErrors.targetStoreId && <div className="error-message">{formErrors.targetStoreId}</div>}
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">إعدادات الجدولة</h3>
          
          <div className="form-group">
            <label htmlFor="schedule">نوع الجدولة</label>
            <select
              id="schedule"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
            >
              <option value="manual">يدوي</option>
              <option value="interval">دوري (كل X دقيقة)</option>
              <option value="daily">يومي</option>
              <option value="webhook">عند التغيير (Webhook)</option>
            </select>
          </div>
          
          {formData.schedule === 'interval' && (
            <div className="form-group">
              <label htmlFor="scheduleInterval">فترة التكرار (دقائق)</label>
              <input
                type="number"
                id="scheduleInterval"
                name="scheduleInterval"
                value={formData.scheduleInterval}
                onChange={handleChange}
                min="5"
              />
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
              />
              تفعيل المزامنة
            </label>
          </div>
        </div>
        
        {formData.type === 'product' && (
          <div className="form-section">
            <h3 className="section-title">تخصيص المزامنة</h3>
            
            <div className="form-subsection">
              <h4 className="subsection-title">الحقول المراد مزامنتها</h4>
              <div className="fields-grid">
                <div className="field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.mappings.fields.title}
                      onChange={() => handleFieldToggle('title')}
                    />
                    العنوان
                  </label>
                </div>
                <div className="field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.mappings.fields.description}
                      onChange={() => handleFieldToggle('description')}
                    />
                    الوصف
                  </label>
                </div>
                <div className="field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.mappings.fields.images}
                      onChange={() => handleFieldToggle('images')}
                    />
                    الصور
                  </label>
                </div>
                <div className="field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.mappings.fields.variants}
                      onChange={() => handleFieldToggle('variants')}
                    />
                    المتغيرات
                  </label>
                </div>
                <div className="field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.mappings.fields.price}
                      onChange={() => handleFieldToggle('price')}
                    />
                    السعر
                  </label>
                </div>
                <div className="field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.mappings.fields.inventory}
                      onChange={() => handleFieldToggle('inventory')}
                    />
                    المخزون
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-subsection">
              <h4 className="subsection-title">تعديل الأسعار</h4>
              <div className="price-adjustment">
                <div className="form-group">
                  <label htmlFor="priceAdjustmentType">نوع التعديل</label>
                  <select
                    id="priceAdjustmentType"
                    name="type"
                    value={formData.mappings.priceAdjustment.type}
                    onChange={handlePriceAdjustmentChange}
                  >
                    <option value="none">بدون تعديل</option>
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">قيمة ثابتة</option>
                  </select>
                </div>
                
                {formData.mappings.priceAdjustment.type !== 'none' && (
                  <div className="form-group">
                    <label htmlFor="priceAdjustmentValue">
                      {formData.mappings.priceAdjustment.type === 'percentage' ? 'النسبة المئوية (%)' : 'القيمة'}
                    </label>
                    <input
                      type="number"
                      id="priceAdjustmentValue"
                      name="value"
                      value={formData.mappings.priceAdjustment.value}
                      onChange={handlePriceAdjustmentChange}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {categoryOptions.length > 0 && (
              <div className="form-subsection">
                <h4 className="subsection-title">ربط التصنيفات</h4>
                <div className="category-mappings">
                  {categoryOptions.map((category) => (
                    <div key={category.id} className="category-mapping-item">
                      <div className="source-category">{category.name}</div>
                      <div className="mapping-arrow">→</div>
                      <div className="target-category">
                        <select
                          value={formData.mappings.categoryMapping[category.id] || ''}
                          onChange={(e) => handleCategoryMapping(category.id, e.target.value)}
                        >
                          <option value="">بدون ربط</option>
                          {categoryOptions.map((targetCat) => (
                            <option key={targetCat.id} value={targetCat.id}>
                              {targetCat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="form-actions">
          <Button type="secondary" onClick={handleCancel}>
            <FaTimes className="mr-2" /> إلغاء
          </Button>
          <Button type="primary" submit>
            <FaSave className="mr-2" /> {isEditing ? 'حفظ التغييرات' : 'إنشاء القاعدة'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SyncRuleForm;