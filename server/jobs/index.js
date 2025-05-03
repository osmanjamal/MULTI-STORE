const cron = require('node-cron');
const { logger } = require('../utils/logger');
const syncProducts = require('./syncProducts');
const syncInventory = require('./syncInventory');
const syncOrders = require('./syncOrders');
const cleanupLogs = require('./cleanupLogs');
const appConfig = require('../config/app');

/**
 * إعداد جميع المهام المجدولة
 */
const setupJobs = () => {
  logger.info('بدء إعداد المهام المجدولة...');

  // جدولة مزامنة المنتجات - كل ساعة
  cron.schedule('0 * * * *', async () => {
    logger.info('بدء مهمة مزامنة المنتجات المجدولة');
    try {
      await syncProducts.syncAllProducts();
      logger.info('اكتملت مهمة مزامنة المنتجات المجدولة بنجاح');
    } catch (error) {
      logger.error('فشلت مهمة مزامنة المنتجات المجدولة:', error);
    }
  });

  // جدولة مزامنة المخزون - كل 15 دقيقة
  cron.schedule(appConfig.sync.syncInterval, async () => {
    logger.info('بدء مهمة مزامنة المخزون المجدولة');
    try {
      await syncInventory.syncAllInventory();
      logger.info('اكتملت مهمة مزامنة المخزون المجدولة بنجاح');
    } catch (error) {
      logger.error('فشلت مهمة مزامنة المخزون المجدولة:', error);
    }
  });

  // جدولة مزامنة الطلبات - كل 30 دقيقة
  cron.schedule('*/30 * * * *', async () => {
    logger.info('بدء مهمة مزامنة الطلبات المجدولة');
    try {
      await syncOrders.syncAllOrders();
      logger.info('اكتملت مهمة مزامنة الطلبات المجدولة بنجاح');
    } catch (error) {
      logger.error('فشلت مهمة مزامنة الطلبات المجدولة:', error);
    }
  });

  // جدولة تنظيف السجلات - مرة واحدة يومياً في الساعة 2 صباحاً
  cron.schedule('0 2 * * *', async () => {
    logger.info('بدء مهمة تنظيف السجلات المجدولة');
    try {
      const deletedCount = await cleanupLogs.cleanupOldLogs();
      logger.info(`اكتملت مهمة تنظيف السجلات المجدولة بنجاح. تم حذف ${deletedCount} سجل`);
    } catch (error) {
      logger.error('فشلت مهمة تنظيف السجلات المجدولة:', error);
    }
  });

  // تسجيل معلومات حول المهام المجدولة
  logger.info('تم إعداد جميع المهام المجدولة بنجاح');
};

module.exports = { setupJobs };