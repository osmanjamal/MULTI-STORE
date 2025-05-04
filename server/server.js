const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// التحقق من وجود أدوات تصحيح الأخطاء
const isDebugMode = process.env.VSCODE_INSPECTOR_OPTIONS || process.env.NODE_V8_COVERAGE;

if (!isDebugMode) {
  // قم بتحميل متغيرات البيئة
  dotenv.config();
}

// استيراد إعداد قاعدة البيانات
const { setupDb } = require('./config/database');

// إنشاء تطبيق express
const app = express();

// إنشاء مجلد السجلات إذا لم يكن موجودًا
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// إنشاء سجلات الوصول
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// إعداد الوسائط العامة
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// إعداد سجلات الوصول
app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// إعداد قاعدة البيانات
// عطل إعداد قاعدة البيانات مؤقتاً
// setupDb();

// شغل الخادم بدون قاعدة بيانات
console.log('⚠️ تشغيل بدون قاعدة بيانات - وضع تجريبي');

// تعريف المسارات
// في /server/server.js - عطل المسارات التي تسبب مشاكل
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/store', require('./routes/store'));
// app.use('/api/product', require('./routes/product'));
// app.use('/api/inventory', require('./routes/inventory'));
// app.use('/api/order', require('./routes/order'));
// app.use('/api/sync', require('./routes/sync'));
// app.use('/api/webhook', require('./routes/webhook'));

// أضف هذا بدلاً منها مؤقتاً
app.get('/api/*', (req, res) => {
  res.json({ message: 'API قيد التطوير' });
});

// المسار الرئيسي
app.get('/', (req, res) => {
  res.json({
    message: 'مرحباً بك في نظام مزامنة المتاجر المتعددة',
    version: '1.0.0',
    status: 'active'
  });
});

// التعامل مع المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({
    error: 'المسار غير موجود',
    path: req.path
  });
});

// معالج الأخطاء العام
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${err.stack}`);
  
  // تسجيل الخطأ في ملف
  const errorLogStream = fs.createWriteStream(
    path.join(logsDir, 'error.log'),
    { flags: 'a' }
  );
  
  errorLogStream.write(`[${timestamp}] ${err.stack}\n`);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'حدث خطأ في الخادم',
      status: err.status || 500
    }
  });
});

// تحديد المنفذ
const PORT = process.env.PORT || 5000;

// بدء الخادم
app.listen(PORT, () => {
  console.log(`
  =======================================
  🚀 الخادم يعمل على المنفذ ${PORT}
  📝 البيئة: ${process.env.NODE_ENV || 'development'}
  🌐 الرابط: http://localhost:${PORT}
  =======================================
  `);
});

module.exports = app;