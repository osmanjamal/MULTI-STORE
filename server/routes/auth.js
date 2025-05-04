const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const userController = require('../controllers/auth/userController');
const { auth } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const { schemas } = require('../utils/validators');
const { loginLimiter } = require('../middleware/rateLimiter');

// المصادقة
router.post('/register', validate(schemas.user.create), authController.register);
router.post('/login', loginLimiter, validate(schemas.user.login), authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);

// إدارة المستخدمين (استخدام الدوال الموجودة)
router.get('/users', auth, userController.getAllUsers);
router.get('/users/:id', auth, userController.getUserById);
router.put('/users/:id', auth, validate(schemas.user.update), userController.updateUser);
router.put('/users/:id/role', auth, userController.updateUserRole);
router.delete('/users/:id', auth, userController.deleteUser);

module.exports = router;