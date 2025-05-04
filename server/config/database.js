const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// إعداد تجريبي
const config = process.env.NODE_ENV === 'development' ? {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'test_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
} : {};

// التحقق من القيم
console.log('Database Config:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: config.password ? '***' : '<empty>'
});

const pool = new Pool(config);

const setupDb = async () => {
  try {
    const client = await pool.connect();
    logger.info('تم الاتصال بقاعدة البيانات بنجاح');
    client.release();
  } catch (err) {
    logger.error('فشل الاتصال بقاعدة البيانات:', err);
    // لا نوقف التطبيق في الوضع التجريبي
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
};

module.exports = { pool, setupDb };