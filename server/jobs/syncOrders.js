const { pool } = require('../config/database');
const { logger } = require('../utils/logger');
const SyncRule = require('../models/syncRule');
const Store = require('../models/store');
const SyncLog = require('../models/syncLog');
const syncService = require('../services/sync/syncService');
const { SyncError } = require('../utils/errors');
const { sleep } = require('../utils/helpers');

/**
 * مزامنة الطلبات لقاعدة مزامنة واحدة
 * @param {Object} rule - قاعدة المزامنة
 * @returns {Promise<Object>} - نتائج المزامنة
 */
const syncOrdersByRule = async (rule) => {
  const sourceStore = await Store.findByIdWithCredentials(rule.source_store_id);
  const targetStore = await Store.findByIdWithCredentials(rule.target_store_id);

  if (!sourceStore || !targetStore) {
    throw new SyncError('لم يتم العثور على المتاجر المرتبطة بقاعدة المزامنة');
  }

  logger.info(`بدء مزامنة الطلبات من ${sourceStore.name} إلى ${targetStore.name}`);

  // إنشاء سجل مزامنة
  const syncLog = await SyncLog.create({
    syncRuleId: rule.id,
    sourceStoreId: sourceStore.id,
    targetStoreId: targetStore.id,
    type: 'order',
    status: 'in_progress',
    action: 'sync',
    entityType: 'order',
    details: {
      ruleName: rule.name,
      startTime: new Date().toISOString()
    }
  });

  try {
    // تنفيذ المزامنة باستخدام خدمة المزامنة
    const result = await syncService.syncOrders(sourceStore, targetStore, rule);

    // تحديث سجل المزامنة بالنجاح
    await SyncLog.update(syncLog.id, {
      status: 'completed',
      details: {
        ...syncLog.details,
        endTime: new Date().toISOString(),
        totalOrders: result.totalOrders,
        createdOrders: result.createdOrders,
        updatedOrders: result.updatedOrders,
        skippedOrders: result.skippedOrders,
        failedOrders: result.failedOrders
      }
    });

    logger.info(`اكتملت مزامنة الطلبات من ${sourceStore.name} إلى ${targetStore.name} بنجاح`);
    return result;
  } catch (error) {
    // تحديث سجل المزامنة بالفشل
    await SyncLog.update(syncLog.id, {
      status: 'failed',
      error: error.message,
      details: {
        ...syncLog.details,
        endTime: new Date().toISOString(),
        errorDetails: error.stack
      }
    });

    logger.error(`فشل مزامنة الطلبات من ${sourceStore.name} إلى ${targetStore.name}:`, error);
    throw error;
  }
};

/**
 * مزامنة الطلبات لجميع قواعد المزامنة النشطة
 * @returns {Promise<Array>} - نتائج المزامنة
 */
const syncAllOrders = async () => {
  try {
    logger.info('بدء مزامنة الطلبات لجميع المتاجر');

    // الحصول على جميع المتاجر
    const result = await pool.query(
      `SELECT DISTINCT id FROM stores WHERE type IN ('shopify', 'woocommerce', 'lazada', 'shopee')`
    );

    const stores = result.rows;
    const results = [];

    for (const store of stores) {
      // الحصول على قواعد المزامنة النشطة للطلبات
      const rules = await SyncRule.findActiveBySourceStore(store.id, 'order');

      for (const rule of rules) {
        try {
          // المزامنة بفترات قصيرة لتجنب تجاوز حدود API
          await sleep(2000);
          const ruleResult = await syncOrdersByRule(rule);
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            sourceStoreId: rule.source_store_id,
            targetStoreId: rule.target_store_id,
            success: true,
            result: ruleResult
          });
        } catch (error) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            sourceStoreId: rule.source_store_id,
            targetStoreId: rule.target_store_id,
            success: false,
            error: error.message
          });
        }
      }
    }

    logger.info('اكتملت عملية مزامنة الطلبات لجميع المتاجر');
    return results;
  } catch (error) {
    logger.error('حدث خطأ أثناء مزامنة الطلبات لجميع المتاجر:', error);
    throw error;
  }
};

module.exports = {
  syncOrdersByRule,
  syncAllOrders
};