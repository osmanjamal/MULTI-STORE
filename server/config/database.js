const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// تكوين قاعدة البيانات
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// إعداد قاعدة البيانات
const setupDb = async () => {
  try {
    // اختبار الاتصال
    const client = await pool.connect();
    logger.info('تم الاتصال بقاعدة البيانات بنجاح');
    client.release();
    
    // يمكن إضافة مزيد من الإعداد أو الترحيل هنا
    
  } catch (err) {
    logger.error('فشل الاتصال بقاعدة البيانات:', err);
    process.exit(1);
  }
};

module.exports = { pool, setupDb };