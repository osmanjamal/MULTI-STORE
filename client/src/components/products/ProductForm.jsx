import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Input, Select, Textarea, Spinner, Toggle } from '../common';
import { useProduct } from '../../hooks/useProduct';
import { useStore } from '../../hooks/useStore';
import VariantForm from './VariantForm';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const { stores, activeStore, setActiveStore } = useStore();
  const { loading, getProduct, createProduct, updateProduct } = useProduct();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sku: '',
    barcode: '',
    vendor: '',
    productType: '',
    tags: '',
    status: 'active',
    options: [],
    images: [],
    variants: [],
    metadata: {}
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [optionNames, setOptionNames] = useState(['الحجم', 'اللون', '']);
  
  useEffect(() => {
    if (isEditMode && id) {
      const fetchProduct = async () => {
        try {
          const product = await getProduct(id);
          setFormData({
            ...product,
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags
          });
          setHasVariants(product.variants && product.variants.length > 1);
          
          if (product.options && product.options.length > 0) {
            setOptionNames(product.options.map(option => option.name || ''));
          }
        } catch (error) {
          console.error('فشل في جلب بيانات المنتج:', error);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, getProduct]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // مسح الخطأ عند تغيير القيمة
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleStoreChange = (storeId) => {
    const selected = stores.find(store => store.id === parseInt(storeId));
    setActiveStore(selected);
  };
  
  const handleToggleVariants = () => {
    setHasVariants(prev => !prev);
    
    if (!hasVariants) {
      // إذا كان التبديل إلى وضع المتغيرات، قم بإنشاء متغير افتراضي
      setFormData({
        ...formData,
        variants: [
          {
            title: 'افتراضي',
            sku: formData.sku,
            barcode: formData.barcode,
            price: 0,
            compareAtPrice: 0,
            options: {}
          }
        ]
      });
    } else {
      // إذا كان التبديل إلى وضع المنتج البسيط، قم بإزالة المتغيرات
      setFormData({
        ...formData,
        variants: []
      });
    }
  };
  
  const handleOptionChange = (index, value) => {
    const newOptionNames = [...optionNames];
    newOptionNames[index] = value;
    setOptionNames(newOptionNames);
  };
  
  const handleVariantsChange = (variants) => {
    setFormData({ ...formData, variants });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'اسم المنتج مطلوب';
    }
    
    if (!activeStore) {
      newErrors.storeId = 'يجب اختيار متجر';
    }
    
    if (hasVariants && (!formData.variants || formData.variants.length === 0)) {
      newErrors.variants = 'يجب إضافة متغير واحد على الأقل';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        storeId: activeStore.id,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      // إذا كان المنتج بمتغيرات، قم بتحديث خيارات المنتج
      if (hasVariants) {
        const options = optionNames
          .filter(name => name.trim() !== '')
          .map((name, index) => ({
            name,
            values: Array.from(new Set(formData.variants.map(variant => 
              variant.options?.[`option${index + 1}`] || ''
            ))).filter(value => value)
          }));
        
        productData.options = options;
      }
      
      if (isEditMode) {
        await updateProduct(id, productData);
      } else {
        await createProduct(productData);
      }
      
      navigate('/products');
    } catch (error) {
      console.error('فشل في حفظ المنتج:', error);
      setErrors({ submit: 'حدث خطأ أثناء حفظ المنتج' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <Card title={isEditMode ? 'تحميل بيانات المنتج...' : 'إضافة منتج جديد'}>
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }
  
  return (
    <Card title={isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-medium">المتجر</label>
          <Select 
            value={activeStore?.id || ''} 
            onChange={(e) => handleStoreChange(e.target.value)}
            error={errors.storeId}
            disabled={isEditMode}
            className="w-full"
          >
            <option value="" disabled>اختر متجر</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </Select>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">اسم المنتج</label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            placeholder="أدخل اسم المنتج"
            className="w-full"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">وصف المنتج</label>
          <Textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="أدخل وصف المنتج"
            rows={5}
            className="w-full"
          />
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">رمز المنتج (SKU)</label>
            <Input
              type="text"
              name="sku"
              value={formData.sku || ''}
              onChange={handleInputChange}
              placeholder="رمز المنتج"
              disabled={hasVariants}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">الباركود</label>
            <Input
              type="text"
              name="barcode"
              value={formData.barcode || ''}
              onChange={handleInputChange}
              placeholder="باركود المنتج"
              disabled={hasVariants}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">المورد</label>
            <Input
              type="text"
              name="vendor"
              value={formData.vendor || ''}
              onChange={handleInputChange}
              placeholder="اسم المورد"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">نوع المنتج</label>
            <Input
              type="text"
              name="productType"
              value={formData.productType || ''}
              onChange={handleInputChange}
              placeholder="نوع المنتج"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">العلامات</label>
          <Input
            type="text"
            name="tags"
            value={formData.tags || ''}
            onChange={handleInputChange}
            placeholder="أدخل العلامات مفصولة بفواصل"
            className="w-full"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">الحالة</label>
          <Select 
            name="status"
            value={formData.status || 'active'} 
            onChange={handleInputChange}
            className="w-full"
          >
            <option value="active">فعّال</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </Select>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <Toggle
              checked={hasVariants}
              onChange={handleToggleVariants}
            />
            <span className="font-medium">المنتج له متغيرات (مقاسات، ألوان، إلخ)</span>
          </label>
        </div>
        
        {hasVariants && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">خيارات المنتج</h3>
              <p className="text-gray-500 text-sm">حدد خيارات المنتج مثل الحجم، اللون، المادة، إلخ.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {optionNames.map((name, index) => (
                <div key={index}>
                  <label className="block mb-2 font-medium">الخيار {index + 1}</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`مثال: الحجم، اللون، إلخ`}
                    className="w-full"
                    disabled={index > 0 && !optionNames[index - 1]}
                  />
                </div>
              ))}
            </div>
            
            <VariantForm 
              variants={formData.variants || []}
              optionNames={optionNames.filter(name => name.trim() !== '')}
              onChange={handleVariantsChange}
              error={errors.variants}
            />
          </div>
        )}
        
        {errors.submit && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}
        
        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            color="secondary"
            onClick={() => navigate('/products')}
          >
            إلغاء
          </Button>
          <Button 
            type="submit" 
            color="primary"
            loading={isSubmitting}
          >
            {isEditMode ? 'حفظ التغييرات' : 'إضافة المنتج'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProductForm;