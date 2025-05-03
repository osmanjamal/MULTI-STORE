const Joi = require('joi');

// مخططات التحقق
const schemas = {
  // مخطط المستخدم
  user: {
    create: Joi.object({
      name: Joi.string().min(3).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }),
    update: Joi.object({
      name: Joi.string().min(3).max(50),
      email: Joi.string().email(),
      password: Joi.string().min(6)
    })
  },
  
  // مخطط المتجر
  store: {
    create: Joi.object({
      name: Joi.string().min(3).max(100).required(),
      type: Joi.string().valid('shopify', 'lazada', 'shopee', 'woocommerce').required(),
      url: Joi.string().uri().required(),
      apiKey: Joi.string().when('type', {
        is: 'shopify',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      apiSecret: Joi.string().when('type', {
        is: 'shopify',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      accessToken: Joi.string().when('type', {
        is: Joi.valid('lazada', 'shopee'),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      consumerKey: Joi.string().when('type', {
        is: 'woocommerce',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      consumerSecret: Joi.string().when('type', {
        is: 'woocommerce',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      isMain: Joi.boolean().default(false)
    }),
    update: Joi.object({
      name: Joi.string().min(3).max(100),
      url: Joi.string().uri(),
      apiKey: Joi.string(),
      apiSecret: Joi.string(),
      accessToken: Joi.string(),
      consumerKey: Joi.string(),
      consumerSecret: Joi.string(),
      isMain: Joi.boolean()
    })
  },
  
  // مخطط الاتصال
  connection: {
    create: Joi.object({
      sourceStoreId: Joi.number().required(),
      targetStoreId: Joi.number().required(),
      syncProducts: Joi.boolean().default(true),
      syncInventory: Joi.boolean().default(true),
      syncOrders: Joi.boolean().default(false),
      bidirectional: Joi.boolean().default(false)
    }),
    update: Joi.object({
      syncProducts: Joi.boolean(),
      syncInventory: Joi.boolean(),
      syncOrders: Joi.boolean(),
      bidirectional: Joi.boolean()
    })
  },
  
  // مخطط قاعدة المزامنة
  syncRule: {
    create: Joi.object({
      name: Joi.string().required(),
      sourceStoreId: Joi.number().required(),
      targetStoreId: Joi.number().required(),
      type: Joi.string().valid('product', 'inventory', 'order').required(),
      conditions: Joi.object().default({}),
      transformations: Joi.object().default({}),
      isActive: Joi.boolean().default(true),
      schedule: Joi.string().default('')
    }),
    update: Joi.object({
      name: Joi.string(),
      conditions: Joi.object(),
      transformations: Joi.object(),
      isActive: Joi.boolean(),
      schedule: Joi.string()
    })
  }
};

// دالة التحقق من الطلب
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      status: 'fail', 
      message: error.details[0].message 
    });
  }
  next();
};

module.exports = {
  schemas,
  validate
};