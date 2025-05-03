const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order/orderController');
const fulfillmentController = require('../controllers/order/fulfillmentController');
const { auth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// إدارة الطلبات
router.get('/', auth, apiLimiter, orderController.getAllOrders);
router.get('/store/:storeId', auth, orderController.getOrdersByStore);
router.get('/:id', auth, orderController.getOrder);
router.post('/', auth, orderController.createOrder);
router.put('/:id', auth, orderController.updateOrder);

// إتمام الطلبات
router.get('/:orderId/fulfillments', auth, fulfillmentController.getFulfillments);
router.post('/:orderId/fulfill', auth, fulfillmentController.createFulfillment);
router.get('/fulfillments/:id', auth, fulfillmentController.getFulfillment);
router.put('/fulfillments/:id', auth, fulfillmentController.updateFulfillment);
router.delete('/fulfillments/:id', auth, fulfillmentController.deleteFulfillment);

// مزامنة الطلبات
router.post('/sync/:storeId', auth, orderController.syncOrders);

module.exports = router;