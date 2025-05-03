const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store/storeController');
const connectionController = require('../controllers/store/connectionController');
const { auth } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const { schemas } = require('../utils/validators');

// إدارة المتاجر
router.get('/', auth, storeController.getAllStores);
router.get('/:id', auth, storeController.getStore);
router.post('/', auth, validate(schemas.store.create), storeController.createStore);
router.put('/:id', auth, validate(schemas.store.update), storeController.updateStore);
router.delete('/:id', auth, storeController.deleteStore);

// إدارة الاتصالات بين المتاجر
router.get('/connections', auth, connectionController.getAllConnections);
router.get('/connections/:id', auth, connectionController.getConnection);
router.post('/connections', auth, validate(schemas.connection.create), connectionController.createConnection);
router.put('/connections/:id', auth, validate(schemas.connection.update), connectionController.updateConnection);
router.delete('/connections/:id', auth, connectionController.deleteConnection);

module.exports = router;