const crypto = require('crypto');
const { AppError } = require('../utils/errors');
const { logger } = require('../utils/logger');
const appConfig = require('../config/app');

/**
 * وسيط للتحقق من توقيع الويب هوك
 */
const validateShopifyWebhook = (req, res, next) => {
  try {
    if (!appConfig.webhook.verifySignature) {
      return next();
    }
    
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    if (!hmacHeader) {
      throw new AppError('توقيع الويب هوك مفقود', 401);
    }
    
    const body = req.rawBody; // يجب تكوين express للحصول على req.rawBody
    if (!body) {
      throw new AppError('جسم الطلب فارغ', 400);
    }
    
    const digest = crypto
      .createHmac('sha256', appConfig.webhook.secret)
      .update(body, 'utf8')
      .digest('base64');
    
    if (digest !== hmacHeader) {
      throw new AppError('توقيع الويب هوك غير صالح', 401);
    }
    
    next();
  } catch (error) {
    logger.error('خطأ في التحقق من الويب هوك:', error);
    return res.status(error.statusCode || 401).json({
      status: 'error',
      message: error.message || 'فشل التحقق من الويب هوك'
    });
  }
};

/**
 * وسيط للتحقق من توقيع الويب هوك للازادا
 */
const validateLazadaWebhook = (req, res, next) => {
  // تنفيذ التحقق من توقيع ويب هوك لازادا
  next();
};

/**
 * وسيط للتحقق من توقيع الويب هوك لشوبي
 */
const validateShopeeWebhook = (req, res, next) => {
  // تنفيذ التحقق من توقيع ويب هوك شوبي
  next();
};

/**
 * وسيط للتحقق من توقيع الويب هوك لووكومرس
 */
const validateWooCommerceWebhook = (req, res, next) => {
  // تنفيذ التحقق من توقيع ويب هوك ووكومرس
  next();
};

/**
 * اختيار وسيط التحقق المناسب بناءً على نوع المتجر
 */
const validateWebhook = (req, res, next) => {
  const type = req.params.type || req.query.type;
  
  switch (type) {
    case 'shopify':
      return validateShopifyWebhook(req, res, next);
    case 'lazada':
      return validateLazadaWebhook(req, res, next);
    case 'shopee':
      return validateShopeeWebhook(req, res, next);
    case 'woocommerce':
      return validateWooCommerceWebhook(req, res, next);
    default:
      return next(new AppError('نوع المتجر غير معروف', 400));
  }
};

module.exports = { validateWebhook };