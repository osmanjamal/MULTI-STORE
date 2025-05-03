const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const { setupDb } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { setupJobs } = require('./jobs');

// إنشاء تطبيق express
const app = express();

// إعداد قاعدة البيانات
setupDb();

// الوسائط العامة
app.use(helmet()); // أمان إضافي
app.use(cors()); // السماح بمشاركة الموارد عبر الأصول
app.use(express.json()); // تحليل طلبات JSON
app.use(express.urlencoded({ extended: true })); // تحليل طلبات النموذج
app.use(compression()); // ضغط الاستجابات

// سجلات التطوير
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// إعداد المهام المجدولة
setupJobs();

// تعريف مسارات API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/store', require('./routes/store'));
app.use('/api/product', require('./routes/product'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/order', require('./routes/order'));
app.use('/api/sync', require('./routes/sync'));
app.use('/api/webhook', require('./routes/webhook'));

// تقديم الملفات الثابتة في الإنتاج
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// معالجة الأخطاء
app.use(errorHandler);

module.exports = app;