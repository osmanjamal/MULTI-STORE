/**
 * دوال مساعدة عامة
 * مجموعة من الدوال المساعدة المتنوعة للاستخدام في التطبيق
 */

/**
 * تأخير تنفيذ العملية لفترة زمنية محددة
 * @param {number} ms - وقت التأخير بالمللي ثانية
 * @returns {Promise} وعد يتم حله بعد انتهاء فترة التأخير
 */
export const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  
  /**
   * إنشاء معرف فريد
   * @returns {string} معرف فريد
   */
  export const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  /**
   * نسخ نص إلى الحافظة
   * @param {string} text - النص المراد نسخه
   * @returns {Promise} وعد بنتيجة العملية
   */
  export const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // الطريقة التقليدية للنسخ
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    } catch (error) {
      console.error('فشل نسخ النص إلى الحافظة:', error);
      return false;
    }
  };
  
  /**
   * تحويل كائن إلى سلسلة استعلام URL
   * @param {Object} params - المعلمات
   * @returns {string} سلسلة الاستعلام
   */
  export const objectToQueryString = (params) => {
    return Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map((key) => {
        // معالجة المصفوفات
        if (Array.isArray(params[key])) {
          return params[key]
            .map((value) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        }
        
        // معالجة كائنات التاريخ
        if (params[key] instanceof Date) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toISOString())}`;
        }
        
        // معالجة الكائنات
        if (typeof params[key] === 'object') {
          return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(params[key]))}`;
        }
        
        // الحالة العادية
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      })
      .join('&');
  };
  
  /**
   * تحويل سلسلة استعلام URL إلى كائن
   * @param {string} queryString - سلسلة الاستعلام
   * @returns {Object} الكائن
   */
  export const queryStringToObject = (queryString) => {
    const params = {};
    
    // إزالة علامة الاستفهام من البداية إذا كانت موجودة
    const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    
    // التقسيم إلى أزواج المفتاح والقيمة
    query.split('&').forEach((pair) => {
      if (!pair) return;
      
      const [key, value] = pair.split('=').map(decodeURIComponent);
      
      // معالجة المصفوفات (المفاتيح المتكررة)
      if (params[key]) {
        if (Array.isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        params[key] = value;
      }
    });
    
    return params;
  };
  
  /**
   * تأجيل تنفيذ دالة لفترة زمنية بعد آخر استدعاء
   * @param {Function} func - الدالة المراد تأجيلها
   * @param {number} wait - وقت الانتظار بالمللي ثانية
   * @returns {Function} دالة مؤجلة
   */
  export const debounce = (func, wait = 300) => {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * تحديد معدل تنفيذ دالة
   * @param {Function} func - الدالة المراد تحديد معدلها
   * @param {number} limit - الحد الزمني بالمللي ثانية
   * @returns {Function} دالة محددة المعدل
   */
  export const throttle = (func, limit = 300) => {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };
  
  /**
   * تسطيح مصفوفة متعددة الأبعاد
   * @param {Array} arr - المصفوفة المراد تسطيحها
   * @returns {Array} المصفوفة المسطحة
   */
  export const flattenArray = (arr) => {
    return arr.reduce((flat, toFlatten) => {
      return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
    }, []);
  };
  
  /**
   * تجميع عناصر مصفوفة حسب خاصية
   * @param {Array} arr - المصفوفة
   * @param {string|Function} key - اسم الخاصية أو دالة تستخرج المفتاح
   * @returns {Object} كائن مجمع حسب المفتاح
   */
  export const groupBy = (arr, key) => {
    return arr.reduce((result, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      
      result[groupKey].push(item);
      return result;
    }, {});
  };
  
  /**
   * إنشاء نسخة عميقة من كائن
   * @param {*} obj - الكائن المراد نسخه
   * @returns {*} نسخة عميقة من الكائن
   */
  export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    // التعامل مع المصفوفات
    if (Array.isArray(obj)) {
      return obj.map((item) => deepClone(item));
    }
    
    // التعامل مع التاريخ
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    // التعامل مع الكائنات العادية
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    
    return clonedObj;
  };
  
  /**
   * التحقق من تساوي كائنين
   * @param {*} obj1 - الكائن الأول
   * @param {*} obj2 - الكائن الثاني
   * @returns {boolean} نتيجة المقارنة
   */
  export const isEqual = (obj1, obj2) => {
    // التعامل مع الحالات الأساسية
    if (obj1 === obj2) return true;
    
    // التحقق من الأنواع
    if (
      typeof obj1 !== typeof obj2 ||
      Array.isArray(obj1) !== Array.isArray(obj2) ||
      obj1 === null ||
      obj2 === null
    ) {
      return false;
    }
    
    // التعامل مع المصفوفات
    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      
      return obj1.every((item, index) => isEqual(item, obj2[index]));
    }
    
    // التعامل مع التاريخ
    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }
    
    // التعامل مع الكائنات
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      if (keys1.length !== keys2.length) return false;
      
      return keys1.every((key) => isEqual(obj1[key], obj2[key]));
    }
    
    return false;
  };
  
  /**
   * دمج كائنات بشكل عميق
   * @param {Object} target - الكائن الهدف
   * @param {...Object} sources - الكائنات المراد دمجها
   * @returns {Object} الكائن بعد الدمج
   */
  export const deepMerge = (target, ...sources) => {
    if (!sources.length) return target;
    
    const source = sources.shift();
    
    if (target && source && typeof target === 'object' && typeof source === 'object') {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (source[key] === undefined) {
            continue;
          }
          
          if (
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            source[key] !== null
          ) {
            if (!target[key] || typeof target[key] !== 'object') {
              target[key] = {};
            }
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    }
    
    return deepMerge(target, ...sources);
  };
  
  /**
   * تحويل حجم الملف إلى وحدة مناسبة
   * @param {number} bytes - حجم الملف بالبايت
   * @param {number} decimals - عدد الأرقام العشرية
   * @returns {string} الحجم بالوحدة المناسبة
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  };
  
  /**
   * استخراج امتداد الملف من اسمه
   * @param {string} filename - اسم الملف
   * @returns {string} امتداد الملف
   */
  export const getFileExtension = (filename) => {
    if (!filename) return '';
    
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  };
  
  /**
   * تحويل لون من تنسيق HEX إلى RGB
   * @param {string} hex - اللون بتنسيق HEX
   * @returns {Object|null} كائن يحتوي على قيم RGB
   */
  export const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };
  
  /**
   * تحويل لون من تنسيق RGB إلى HEX
   * @param {number} r - قيمة اللون الأحمر (0-255)
   * @param {number} g - قيمة اللون الأخضر (0-255)
   * @param {number} b - قيمة اللون الأزرق (0-255)
   * @returns {string} اللون بتنسيق HEX
   */
  export const rgbToHex = (r, g, b) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  
  /**
   * ترجمة نص بين لغتين مختلفتين
   * ملاحظة: يتطلب إضافة خدمة ترجمة
   * @param {string} text - النص المراد ترجمته
   * @param {string} targetLang - اللغة الهدف
   * @param {string} sourceLang - لغة المصدر (اختياري)
   * @returns {Promise} وعد بالنص المترجم
   */
  export const translateText = async (text, targetLang, sourceLang = 'auto') => {
    // هنا يمكن إضافة كود للاتصال بخدمة ترجمة مثل Google Translate API
    // مثال بسيط لتوضيح الفكرة
    try {
      // هذا مثال فقط ويحتاج إلى استبداله بخدمة حقيقية
      const translations = {
        'en-ar': {
          'Hello': 'مرحباً',
          'Welcome': 'أهلاً وسهلاً',
        },
        'ar-en': {
          'مرحباً': 'Hello',
          'أهلاً وسهلاً': 'Welcome',
        },
      };
      
      const key = `${sourceLang}-${targetLang}`;
      
      // محاكاة تأخير الاتصال بالخدمة
      await delay(300);
      
      return translations[key][text] || text;
    } catch (error) {
      console.error('فشل ترجمة النص:', error);
      return text; // إرجاع النص الأصلي في حالة الفشل
    }
  };
  
  /**
   * تحويل اسم مفتاح من camelCase إلى snake_case
   * @param {string} key - المفتاح
   * @returns {string} المفتاح بالتنسيق snake_case
   */
  export const camelToSnake = (key) => {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  };
  
  /**
   * تحويل اسم مفتاح من snake_case إلى camelCase
   * @param {string} key - المفتاح
   * @returns {string} المفتاح بالتنسيق camelCase
   */
  export const snakeToCamel = (key) => {
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };
  
  /**
   * تحويل جميع مفاتيح الكائن من camelCase إلى snake_case
   * @param {Object} obj - الكائن
   * @returns {Object} كائن بمفاتيح بتنسيق snake_case
   */
  export const objectKeysToCamel = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(objectKeysToCamel);
    }
    
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = snakeToCamel(key);
        newObj[camelKey] = objectKeysToCamel(obj[key]);
      }
    }
    
    return newObj;
  };
  
  /**
   * تحويل جميع مفاتيح الكائن من camelCase إلى snake_case
   * @param {Object} obj - الكائن
   * @returns {Object} كائن بمفاتيح بتنسيق snake_case
   */
  export const objectKeysToSnake = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(objectKeysToSnake);
    }
    
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = camelToSnake(key);
        newObj[snakeKey] = objectKeysToSnake(obj[key]);
      }
    }
    
    return newObj;
  };
  
  /**
   * استخراج domain من عنوان URL
   * @param {string} url - عنوان URL
   * @returns {string} اسم الدومين
   */
  export const extractDomain = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      // إذا كان العنوان غير صالح، حاول استخراج الدومين بشكل يدوي
      const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/;
      const matches = url.match(domainRegex);
      return matches ? matches[1] : '';
    }
  };
  
  export default {
    delay,
    generateId,
    copyToClipboard,
    objectToQueryString,
    queryStringToObject,
    debounce,
    throttle,
    flattenArray,
    groupBy,
    deepClone,
    isEqual,
    deepMerge,
    formatFileSize,
    getFileExtension,
    hexToRgb,
    rgbToHex,
    translateText,
    camelToSnake,
    snakeToCamel,
    objectKeysToCamel,
    objectKeysToSnake,
    extractDomain,
  };