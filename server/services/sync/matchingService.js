const { logger } = require('../../utils/logger');

/**
 * خدمة مطابقة المنتجات والمخزون والطلبات بناء على قواعد محددة
 */
exports.checkProductConditions = (product, conditions) => {
  logger.debug(`فحص شروط المنتج: ${product.id}`);
  
  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }
  
  // فحص العنوان
  if (conditions.title) {
    const pattern = new RegExp(conditions.title, 'i');
    if (!pattern.test(product.title)) {
      return false;
    }
  }
  
  // فحص الوصف
  if (conditions.description) {
    const pattern = new RegExp(conditions.description, 'i');
    if (!pattern.test(product.description)) {
      return false;
    }
  }
  
  // فحص نوع المنتج
  if (conditions.productType && conditions.productType !== product.product_type) {
    return false;
  }
  
  // فحص المورد
  if (conditions.vendor && conditions.vendor !== product.vendor) {
    return false;
  }
  
  // فحص العلامات
  if (conditions.tags) {
    const pattern = new RegExp(conditions.tags, 'i');
    if (!pattern.test(product.tags)) {
      return false;
    }
  }
  
  // فحص الحالة
  if (conditions.status && conditions.status !== product.status) {
    return false;
  }
  
  // فحص السعر
  if (conditions.minPrice && product.variants[0]?.price < conditions.minPrice) {
    return false;
  }
  
  if (conditions.maxPrice && product.variants[0]?.price > conditions.maxPrice) {
    return false;
  }
  
  return true;
};

/**
 * فحص شروط المخزون
 */
exports.checkInventoryConditions = (inventory, conditions) => {
  logger.debug(`فحص شروط المخزون: ${inventory.id}`);
  
  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }
  
  // فحص الكمية
  if (conditions.minQuantity && inventory.quantity < conditions.minQuantity) {
    return false;
  }
  
  if (conditions.maxQuantity && inventory.quantity > conditions.maxQuantity) {
    return false;
  }
  
  return true;
};

/**
 * فحص شروط الطلب
 */
exports.checkOrderConditions = (order, conditions) => {
  logger.debug(`فحص شروط الطلب: ${order.id}`);
  
  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }
  
  // فحص الحالة المالية
  if (conditions.financialStatus && conditions.financialStatus !== order.financial_status) {
    return false;
  }
  
  // فحص حالة الإتمام
  if (conditions.fulfillmentStatus && conditions.fulfillmentStatus !== order.fulfillment_status) {
    return false;
  }
  
  // فحص طريقة الدفع
  if (conditions.paymentMethod) {
    const pattern = new RegExp(conditions.paymentMethod, 'i');
    if (!pattern.test(order.payment_method)) {
      return false;
    }
  }
  
  // فحص الحد الأدنى للسعر الإجمالي
  if (conditions.minTotalPrice && parseFloat(order.total_price) < conditions.minTotalPrice) {
    return false;
  }
  
  // فحص الحد الأقصى للسعر الإجمالي
  if (conditions.maxTotalPrice && parseFloat(order.total_price) > conditions.maxTotalPrice) {
    return false;
  }
  
  return true;
};

/**
 * تطبيق تحويلات المنتج
 */
exports.applyProductTransformations = (product, transformations) => {
  logger.debug(`تطبيق تحويلات المنتج: ${product.id}`);
  
  if (!transformations || Object.keys(transformations).length === 0) {
    return product;
  }
  
  const transformedProduct = { ...product };
  
  // تحويل العنوان
  if (transformations.title) {
    transformedProduct.title = applyTemplate(transformations.title, product);
  }
  
  // تحويل الوصف
  if (transformations.description) {
    transformedProduct.description = applyTemplate(transformations.description, product);
  }
  
  // تحويل نوع المنتج
  if (transformations.productType) {
    transformedProduct.productType = transformations.productType;
  }
  
  // تحويل المورد
  if (transformations.vendor) {
    transformedProduct.vendor = transformations.vendor;
  }
  
  // تحويل العلامات
  if (transformations.tags) {
    transformedProduct.tags = applyTemplate(transformations.tags, product);
  }
  
  // تحويل الحالة
  if (transformations.status) {
    transformedProduct.status = transformations.status;
  }
  
  // تحويل السعر
  if (transformations.priceAdjustment && transformedProduct.variants) {
    const adjustment = parseFloat(transformations.priceAdjustment);
    
    if (!isNaN(adjustment)) {
      transformedProduct.variants = transformedProduct.variants.map(variant => ({
        ...variant,
        price: variant.price + adjustment
      }));
    }
  }
  
  // تحويل نسبة السعر
  if (transformations.pricePercentage && transformedProduct.variants) {
    const percentage = parseFloat(transformations.pricePercentage);
    
    if (!isNaN(percentage)) {
      transformedProduct.variants = transformedProduct.variants.map(variant => ({
        ...variant,
        price: variant.price * (1 + percentage / 100)
      }));
    }
  }
  
  return transformedProduct;
};

/**
 * تطبيق تحويلات الطلب
 */
exports.applyOrderTransformations = (order, transformations) => {
  logger.debug(`تطبيق تحويلات الطلب: ${order.id}`);
  
  // تنفيذ التحويلات المخصصة للطلب
  
  return order;
};

/**
 * تطبيق قالب نص مع استبدال المتغيرات
 */
function applyTemplate(template, data) {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    const keys = key.split('.');
    let value = data;
    
    for (const k of keys) {
      if (value === undefined || value === null) {
        return match;
      }
      
      value = value[k];
    }
    
    return value !== undefined && value !== null ? value : match;
  });
}