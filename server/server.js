const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Cargar variables de entorno
dotenv.config();

// Inicializar la aplicación Express
const app = express();
// في بداية الملف
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

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

// استخدام morgan لتسجيل طلبات HTTP
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // عرض السجلات في الترمينال أيضًا

// إعداد معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);
  
  // تسجيل الخطأ في ملف
  const errorLogStream = fs.createWriteStream(
    path.join(logsDir, 'error.log'),
    { flags: 'a' }
  );
  
  errorLogStream.write(`[${new Date().toISOString()}] ${err.stack}\n`);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  });
});


// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Conexión a la base de datos
connectDB();

// Definir rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/store', require('./routes/store'));
app.use('/api/product', require('./routes/product'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/order', require('./routes/order'));
app.use('/api/sync', require('./routes/sync'));
app.use('/api/webhook', require('./routes/webhook'));

// Ruta principal
app.get('/', (req, res) => {
  res.send('API del sistema de sincronización de múltiples tiendas');
});

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});