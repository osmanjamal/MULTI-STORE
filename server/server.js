const app = require('./app');
const http = require('http');
const { logger } = require('./utils/logger');

// تحميل متغيرات البيئة
require('dotenv').config();

// تعيين المنفذ
const PORT = process.env.PORT || 3000;

// إنشاء الخادم
const server = http.createServer(app);

// بدء الخادم
server.listen(PORT, () => {
  logger.info(`الخادم يعمل على المنفذ ${PORT} في بيئة ${process.env.NODE_ENV}`);
});

// التعامل مع استثناءات عدم التعامل معها
process.on('unhandledRejection', (err) => {
  logger.error('استثناء غير معالج: ', err);
  // إغلاق الخادم وإنهاء العملية
  server.close(() => process.exit(1));
});