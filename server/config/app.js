module.exports = {
    appName: 'Multi-Store Sync',
    environment: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    
    // إعدادات الأمان
    security: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpire: process.env.JWT_EXPIRE || '7d',
      jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7
    },
    
    // إعدادات المزامنة
    sync: {
      maxProductsPerBatch: 50,
      syncInterval: '*/15 * * * *', // كل 15 دقيقة
      retryFailedSyncs: true,
      maxRetries: 3,
      retryDelay: 5 * 60 * 1000 // 5 دقائق بالمللي ثانية
    },
    
    // إعدادات الويب هوك
    webhook: {
      verifySignature: true,
      secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret'
    }
  };