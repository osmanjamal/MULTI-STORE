/**
 * أداة التسجيل
 * توفر دوال لتسجيل الأحداث والأخطاء في التطبيق
 */

// مستويات التسجيل
export const LogLevel = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  };
  
  // الحد الأدنى لمستوى التسجيل (يمكن تغييره حسب بيئة التشغيل)
  let MIN_LOG_LEVEL = LogLevel.DEBUG;
  // تعطيل التسجيل في بيئة الإنتاج
  const DISABLED = process.env.NODE_ENV === 'production';
  // الاحتفاظ بسجل للرسائل
  const LOG_HISTORY = [];
  // الحد الأقصى لعدد الرسائل في السجل
  const MAX_HISTORY_SIZE = 100;
  
  /**
   * ضبط مستوى التسجيل
   * @param {string} level - مستوى التسجيل
   */
  export const setLogLevel = (level) => {
    if (Object.values(LogLevel).includes(level)) {
      MIN_LOG_LEVEL = level;
    }
  };
  
  /**
   * الحصول على سجل الرسائل
   * @returns {Array} سجل الرسائل
   */
  export const getLogHistory = () => {
    return [...LOG_HISTORY];
  };
  
  /**
   * مسح سجل الرسائل
   */
  export const clearLogHistory = () => {
    LOG_HISTORY.length = 0;
  };
  
  /**
   * إضافة رسالة إلى السجل
   * @param {string} level - مستوى التسجيل
   * @param {string} message - الرسالة
   * @param {*} data - بيانات إضافية
   * @private
   */
  const addToHistory = (level, message, data) => {
    LOG_HISTORY.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    });
    
    // الحفاظ على حجم السجل ضمن الحد الأقصى
    if (LOG_HISTORY.length > MAX_HISTORY_SIZE) {
      LOG_HISTORY.shift();
    }
  };
  
  /**
   * تسجيل رسالة
   * @param {string} level - مستوى التسجيل
   * @param {string} message - الرسالة
   * @param {*} data - بيانات إضافية
   * @param {boolean} forceLog - فرض التسجيل حتى لو كان أقل من الحد الأدنى
   * @private
   */
  const log = (level, message, data = null, forceLog = false) => {
    // التحقق من مستوى التسجيل
    const shouldLog = forceLog || !DISABLED || isLevelEnabled(level);
    
    if (!shouldLog) return;
    
    // إضافة إلى السجل
    addToHistory(level, message, data);
    
    // تحديد طريقة التسجيل في وحدة التحكم
    let consoleMethod;
    switch (level) {
      case LogLevel.DEBUG:
        consoleMethod = console.debug;
        break;
      case LogLevel.INFO:
        consoleMethod = console.info;
        break;
      case LogLevel.WARN:
        consoleMethod = console.warn;
        break;
      case LogLevel.ERROR:
        consoleMethod = console.error;
        break;
      default:
        consoleMethod = console.log;
    }
    
    // تسجيل الرسالة
    if (data !== null) {
      consoleMethod(`[${level.toUpperCase()}] ${message}`, data);
    } else {
      consoleMethod(`[${level.toUpperCase()}] ${message}`);
    }
  };
  
  /**
   * التحقق من تفعيل مستوى التسجيل
   * @param {string} level - مستوى التسجيل
   * @returns {boolean} مُفعّل أم لا
   * @private
   */
  const isLevelEnabled = (level) => {
    const levels = Object.values(LogLevel);
    const minLevelIndex = levels.indexOf(MIN_LOG_LEVEL);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  };
  
  /**
   * تسجيل رسالة على مستوى تصحيح الأخطاء
   * @param {string} message - الرسالة
   * @param {*} data - بيانات إضافية
   */
  export const debug = (message, data = null) => {
    log(LogLevel.DEBUG, message, data);
  };
  
  /**
   * تسجيل رسالة على مستوى المعلومات
   * @param {string} message - الرسالة
   * @param {*} data - بيانات إضافية
   */
  export const info = (message, data = null) => {
    log(LogLevel.INFO, message, data);
  };
  
  /**
   * تسجيل رسالة على مستوى التحذير
   * @param {string} message - الرسالة
   * @param {*} data - بيانات إضافية
   */
  export const warn = (message, data = null) => {
    log(LogLevel.WARN, message, data);
  };
  
  /**
   * تسجيل رسالة على مستوى الخطأ
   * @param {string} message - الرسالة
   * @param {*} data - بيانات إضافية
   */
  export const error = (message, data = null) => {
    log(LogLevel.ERROR, message, data, true); // دائماً تسجيل الأخطاء
  };
  
  /**
   * قياس زمن تنفيذ دالة
   * @param {Function} fn - الدالة المراد قياس زمنها
   * @param {string} label - تسمية للقياس
   * @returns {Function} دالة مغلفة تقوم بالقياس
   */
  export const measureTime = (fn, label = 'Execution time') => {
    return async (...args) => {
      const startTime = performance.now();
      try {
        return await fn(...args);
      } finally {
        const endTime = performance.now();
        const duration = endTime - startTime;
        debug(`${label}: ${duration.toFixed(2)}ms`);
      }
    };
  };
  
  /**
   * تسجيل بداية ونهاية العمليات لتتبع الأداء
   * @param {string} operationName - اسم العملية
   * @returns {Object} كائن يحتوي على دالة إنهاء العملية
   */
  export const startOperation = (operationName) => {
    const startTime = performance.now();
    debug(`Operation started: ${operationName}`);
    
    return {
      end: (result = null) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        debug(`Operation completed: ${operationName} (${duration.toFixed(2)}ms)`, result);
        return duration;
      },
      fail: (error) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        warn(`Operation failed: ${operationName} (${duration.toFixed(2)}ms)`, error);
        return duration;
      },
    };
  };
  
  /**
   * إنشاء مُسجّل مخصص لسياق معين
   * @param {string} context - سياق التسجيل
   * @returns {Object} كائن مُسجّل مخصص
   */
  export const createContextLogger = (context) => {
    const prefix = `[${context}]`;
    
    return {
      debug: (message, data = null) => debug(`${prefix} ${message}`, data),
      info: (message, data = null) => info(`${prefix} ${message}`, data),
      warn: (message, data = null) => warn(`${prefix} ${message}`, data),
      error: (message, data = null) => error(`${prefix} ${message}`, data),
      measureTime: (fn, label = 'Execution time') => measureTime(fn, `${prefix} ${label}`),
      startOperation: (operationName) => startOperation(`${prefix} ${operationName}`),
    };
  };
  
  export default {
    LogLevel,
    setLogLevel,
    getLogHistory,
    clearLogHistory,
    debug,
    info,
    warn,
    error,
    measureTime,
    startOperation,
    createContextLogger,
  };