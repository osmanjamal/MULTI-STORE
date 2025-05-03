const express = require('express');
const router = express.Router();
const productController = require('../controllers/product/productController');
const variantController = require('../controllers/product/variantController');
const categoryController = require('../controllers/product/categoryController');
const { auth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// إدارة المنتجات
router.get('/', auth, apiLimiter, productController.getAllProducts);
router.get('/store/:storeId', auth, productController.getProductsByStore);
router.get('/:id', auth, productController.getProduct);
router.post('/', auth, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

// إدارة المتغيرات
router.get('/:productId/variants', auth, variantController.getVariantsByProduct);
router.get('/variants/:id', auth, variantController.getVariant);
router.post('/:productId/variants', auth, variantController.createVariant);
router.put('/variants/:id', auth, variantController.updateVariant);
router.delete('/variants/:id', auth, variantController.deleteVariant);

// إدارة الفئات
router.get('/categories', auth, categoryController.getAllCategories);
router.get('/categories/:id', auth, categoryController.getCategory);
router.post('/categories', auth, categoryController.createCategory);
router.put('/categories/:id', auth, categoryController.updateCategory);
router.delete('/categories/:id', auth, categoryController.deleteCategory);

// مزامنة المنتجات
router.post('/sync/:storeId', auth, productController.syncProducts);

module.exports = router;