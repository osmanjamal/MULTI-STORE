const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory/inventoryController');
const stockController = require('../controllers/inventory/stockController');
const { auth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// إدارة المخزون
router.get('/', auth, apiLimiter, inventoryController.getAllInventory);
router.get('/store/:storeId', auth, inventoryController.getInventoryByStore);
router.get('/product/:productId', auth, inventoryController.getInventoryByProduct);
router.get('/:id', auth, inventoryController.getInventory);
router.post('/', auth, inventoryController.createInventory);
router.put('/:id', auth, inventoryController.updateInventory);
router.delete('/:id', auth, inventoryController.deleteInventory);

// تعديل المخزون
router.post('/adjust/:id', auth, stockController.adjustStock);
router.post('/sync/:storeId', auth, inventoryController.syncInventory);

module.exports = router;