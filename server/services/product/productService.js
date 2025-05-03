const Product = require('../../models/product');
const Variant = require('../../models/variant');
const { NotFoundError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

exports.getAllProducts = async (storeId, filters = {}, page = 1, limit = 20) => {
  return await Product.search(filters, storeId, page, limit);
};

exports.getProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new NotFoundError('المنتج غير موجود');
  
  // جلب المتغيرات
  const variants = await Variant.findByProductId(id);
  product.variants = variants;
  
  return product;
};

exports.getProductByExternalId = async (externalId, storeId) => {
  const product = await Product.findByExternalId(externalId, storeId);
  if (!product) return null;
  
  // جلب المتغيرات
  const variants = await Variant.findByProductId(product.id);
  product.variants = variants;
  
  return product;
};

exports.createProduct = async (productData) => {
  logger.info(`إنشاء منتج جديد: ${productData.title}`);
  
  // إنشاء المنتج
  const product = await Product.create(productData);
  
  // إنشاء المتغيرات إذا وجدت
  if (productData.variants && productData.variants.length > 0) {
    for (const variantData of productData.variants) {
      variantData.productId = product.id;
      await Variant.create(variantData);
    }
  }
  
  return await this.getProduct(product.id);
};

exports.updateProduct = async (id, productData) => {
  const product = await Product.findById(id);
  if (!product) throw new NotFoundError('المنتج غير موجود');
  
  logger.info(`تحديث منتج: ${id}`);
  
  // تحديث المنتج
  const updatedProduct = await Product.update(id, productData);
  
  // تحديث المتغيرات إذا وجدت
  if (productData.variants) {
    // جلب المتغيرات الحالية
    const currentVariants = await Variant.findByProductId(id);
    
    // تحديث أو إنشاء المتغيرات
    for (const variantData of productData.variants) {
      if (variantData.id) {
        await Variant.update(variantData.id, variantData);
      } else {
        variantData.productId = id;
        await Variant.create(variantData);
      }
    }
    
    // حذف المتغيرات غير الموجودة في البيانات الجديدة
    const newVariantIds = productData.variants
      .filter(v => v.id)
      .map(v => v.id);
    
    for (const variant of currentVariants) {
      if (!newVariantIds.includes(variant.id)) {
        await Variant.delete(variant.id);
      }
    }
  }
  
  return await this.getProduct(id);
};

exports.deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new NotFoundError('المنتج غير موجود');
  
  logger.info(`حذف منتج: ${id}`);
  
  // حذف المتغيرات
  const variants = await Variant.findByProductId(id);
  for (const variant of variants) {
    await Variant.delete(variant.id);
  }
  
  return await Product.delete(id);
};