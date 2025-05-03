const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync/syncController');
const syncRuleController = require('../controllers/sync/syncRuleController');
const logController = require('../controllers/sync/logController');
const { auth } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const { schemas } = require('../utils/validators');

// إدارة المزامنة
router.post('/run', auth, syncController.runSync);
router.post('/products/:sourceId/:targetId', auth, syncController.syncProducts);
router.post('/inventory/:sourceId/:targetId', auth, syncController.syncInventory);
router.post('/orders/:sourceId/:targetId', auth, syncController.syncOrders);

// إدارة قواعد المزامنة
router.get('/rules', auth, syncRuleController.getAllRules);
router.get('/rules/:id', auth, syncRuleController.getRule);
router.post('/rules', auth, validate(schemas.syncRule.create), syncRuleController.createRule);
router.put('/rules/:id', auth, validate(schemas.syncRule.update), syncRuleController.updateRule);
router.delete('/rules/:id', auth, syncRuleController.deleteRule);

// إدارة سجلات المزامنة
router.get('/logs', auth, logController.getAllLogs);
router.get('/logs/:id', auth, logController.getLog);
router.delete('/logs/cleanup', auth, logController.cleanupLogs);

module.exports = router;