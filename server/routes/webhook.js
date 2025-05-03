const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/sync/webhookController');
const { validateWebhook } = require('../middleware/webhookValidator');
const { webhookLimiter } = require('../middleware/rateLimiter');

// استقبال الويب هوك من المتاجر المختلفة
router.post('/shopify', webhookLimiter, validateWebhook, webhookController.handleShopifyWebhook);
router.post('/woocommerce', webhookLimiter, validateWebhook, webhookController.handleWooCommerceWebhook);
router.post('/lazada', webhookLimiter, validateWebhook, webhookController.handleLazadaWebhook);
router.post('/shopee', webhookLimiter, validateWebhook, webhookController.handleShopeeWebhook);

// إدارة الويب هوك
router.get('/', webhookController.getWebhooks);
router.post('/register/:storeId', webhookController.registerWebhooks);
router.delete('/unregister/:storeId', webhookController.unregisterWebhooks);

module.exports = router;