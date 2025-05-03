const winston = require('winston');
const path = require('path');

// تهيئة تنسيق السجل
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// إعداد مستويات السجل
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// اختيار مستوى السجل بناءً على البيئة
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// إنشاء مثيل مسجل
const logger = winston.createLogger({
  levels: logLevels,
  level: level(),
  format: logFormat,
  transports: [
    // سجل الأخطاء والتحذيرات إلى ملف
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    // سجل كل شيء إلى ملف
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    })
  ]
});

// إضافة وحدة نقل وحدة التحكم في بيئة غير الإنتاج
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }));
}

module.exports = { logger };