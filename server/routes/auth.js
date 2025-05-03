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

// إدارة المستخدمين
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, validate(schemas.user.update), userController.updateProfile);
router.put('/password', auth, userController.updatePassword);

module.exports = router;