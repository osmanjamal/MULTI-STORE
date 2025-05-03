/**
 * أدوات التحقق
 * توفر دوال للتحقق من صحة البيانات
 */

/**
 * التحقق من البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} نتيجة التحقق
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    
    // تعبير منتظم للتحقق من البريد الإلكتروني
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  /**
   * التحقق من قوة كلمة المرور
   * @param {string} password - كلمة المرور
   * @returns {Object} كائن يحتوي على النتيجة والقوة والملاحظات
   */
  export const validatePassword = (password) => {
    if (!password) {
      return {
        isValid: false,
        strength: 0,
        messages: ['كلمة المرور مطلوبة'],
      };
    }
    
    const result = {
      isValid: false,
      strength: 0,
      messages: [],
    };
    
    // قائمة بالمتطلبات
    const requirements = [
      {
        test: password.length >= 8,
        message: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل',
      },
      {
        test: /[A-Z]/.test(password),
        message: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل',
      },
      {
        test: /[a-z]/.test(password),
        message: 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل',
      },
      {
        test: /[0-9]/.test(password),
        message: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل',
      },
      {
        test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
        message: 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل',
      },
    ];
    
    // حساب النتيجة والقوة
    let passedTests = 0;
    requirements.forEach((req) => {
      if (!req.test) {
        result.messages.push(req.message);
      } else {
        passedTests++;
      }
    });
    
    // تحديد القوة (0-100)
    result.strength = (passedTests / requirements.length) * 100;
    
    // تحديد الصلاحية
    result.isValid = passedTests >= 3 && password.length >= 8;
    
    return result;
  };
  
  /**
   * التحقق من أن القيمة غير فارغة
   * @param {*} value - القيمة للتحقق
   * @returns {boolean} نتيجة التحقق
   */
  export const isNotEmpty = (value) => {
    if (value === null || value === undefined) return false;
    
    if (typeof value === 'string') return value.trim().length > 0;
    
    if (Array.isArray(value)) return value.length > 0;
    
    if (typeof value === 'object') return Object.keys(value).length > 0;
    
    return true;
  };
  
  /**
   * التحقق من صحة رقم الهاتف
   * @param {string} phone - رقم الهاتف
   * @param {string} countryCode - رمز الدولة (الافتراضي: SA - السعودية)
   * @returns {boolean} نتيجة التحقق
   */
  export const isValidPhone = (phone, countryCode = 'SA') => {
    if (!phone) return false;
    
    // إزالة المسافات والرموز
    const cleaned = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
    
    // التعبيرات المنتظمة حسب الدولة
    const patterns = {
      SA: /^((\+966)|0)?5[0-9]{8}$/, // السعودية
      AE: /^((\+971)|0)?5[0-9]{8}$/, // الإمارات
      KW: /^((\+965)|0)?[569][0-9]{7}$/, // الكويت
      QA: /^((\+974)|0)?[3567][0-9]{7}$/, // قطر
      BH: /^((\+973)|0)?[36][0-9]{7}$/, // البحرين
      OM: /^((\+968)|0)?9[0-9]{7}$/, // عمان
      // يمكن إضافة المزيد من الدول حسب الحاجة
    };
    
    // استخدام النمط المناسب أو استخدام تحقق عام إذا لم يتم العثور على الدولة
    const pattern = patterns[countryCode] || /^\+?[0-9]{10,15}$/;
    
    return pattern.test(cleaned);
  };
  
  /**
   * التحقق من صحة الرقم
   * @param {*} value - القيمة للتحقق
   * @returns {boolean} نتيجة التحقق
   */
  export const isValidNumber = (value) => {
    if (value === null || value === undefined || value === '') return false;
    
    // التحقق من أن القيمة رقم
    return !isNaN(Number(value));
  };
  
  /**
   * التحقق من أن القيمة ضمن نطاق محدد
   * @param {number} value - القيمة للتحقق
   * @param {number} min - الحد الأدنى
   * @param {number} max - الحد الأقصى
   * @returns {boolean} نتيجة التحقق
   */
  export const isInRange = (value, min, max) => {
    if (!isValidNumber(value)) return false;
    
    const num = Number(value);
    
    // التحقق من الحدود إذا تم تحديدها
    const checkMin = min !== undefined && min !== null;
    const checkMax = max !== undefined && max !== null;
    
    if (checkMin && checkMax) {
      return num >= min && num <= max;
    } else if (checkMin) {
      return num >= min;
    } else if (checkMax) {
      return num <= max;
    }
    
    // إذا لم يتم تحديد الحدود، فالقيمة صالحة
    return true;
  };
  
  /**
   * التحقق من صحة URL
   * @param {string} url - عنوان URL
   * @returns {boolean} نتيجة التحقق
   */
  export const isValidUrl = (url) => {
    if (!url) return false;
    
    try {
      // محاولة إنشاء كائن URL
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * التحقق من تطابق القيم
   * @param {*} value1 - القيمة الأولى
   * @param {*} value2 - القيمة الثانية
   * @returns {boolean} نتيجة التحقق
   */
  export const isMatching = (value1, value2) => {
    return value1 === value2;
  };
  
  /**
   * التحقق من صحة التاريخ
   * @param {string|Date} date - التاريخ
   * @returns {boolean} نتيجة التحقق
   */
  export const isValidDate = (date) => {
    if (!date) return false;
    
    // التحويل إلى كائن تاريخ
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // التحقق من صحة التاريخ
    return !isNaN(dateObj.getTime());
  };
  
  /**
   * التحقق من أن التاريخ في المستقبل
   * @param {string|Date} date - التاريخ
   * @returns {boolean} نتيجة التحقق
   */
  export const isFutureDate = (date) => {
    if (!isValidDate(date)) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    
    return dateObj > now;
  };
  
  /**
   * التحقق من أن التاريخ في الماضي
   * @param {string|Date} date - التاريخ
   * @returns {boolean} نتيجة التحقق
   */
  export const isPastDate = (date) => {
    if (!isValidDate(date)) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    
    return dateObj < now;
  };
  
  /**
   * التحقق من نوع الملف
   * @param {File} file - الملف
   * @param {Array} allowedTypes - أنواع الملفات المسموح بها
   * @returns {boolean} نتيجة التحقق
   */
  export const isValidFileType = (file, allowedTypes) => {
    if (!file || !allowedTypes || !allowedTypes.length) return false;
    
    // الحصول على نوع MIME للملف
    const fileType = file.type;
    
    return allowedTypes.includes(fileType);
  };
  
  /**
   * التحقق من حجم الملف
   * @param {File} file - الملف
   * @param {number} maxSizeInBytes - الحد الأقصى للحجم بالبايت
   * @returns {boolean} نتيجة التحقق
   */
  export const isValidFileSize = (file, maxSizeInBytes) => {
    if (!file || !maxSizeInBytes) return false;
    
    return file.size <= maxSizeInBytes;
  };
  
  /**
   * التحقق من وجود قيمة في مصفوفة
   * @param {*} value - القيمة للتحقق
   * @param {Array} array - المصفوفة للبحث فيها
   * @returns {boolean} نتيجة التحقق
   */
  export const isInArray = (value, array) => {
    if (!array || !Array.isArray(array)) return false;
    
    return array.includes(value);
  };
  
  /**
   * نموذج التحقق الشامل
   * يمكن استخدامه للتحقق من كائن بأكمله باستخدام قواعد محددة
   * @param {Object} values - قيم الحقول
   * @param {Object} rules - قواعد التحقق
   * @returns {Object} نتائج التحقق
   */
  export const validateForm = (values, rules) => {
    const errors = {};
    
    // التحقق من كل حقل حسب القواعد المحددة
    Object.keys(rules).forEach((field) => {
      const fieldRules = rules[field];
      const value = values[field];
      
      // تنفيذ كل قاعدة على الحقل
      fieldRules.forEach((rule) => {
        // التخطي إذا كان الحقل غير مطلوب وفارغ
        if (
          rule.type !== 'required' &&
          (value === null || value === undefined || value === '')
        ) {
          return;
        }
        
        let isValid = true;
        let message = rule.message || 'قيمة غير صالحة';
        
        // تطبيق القاعدة المناسبة
        switch (rule.type) {
          case 'required':
            isValid = isNotEmpty(value);
            break;
          case 'email':
            isValid = isValidEmail(value);
            break;
          case 'password':
            isValid = validatePassword(value).isValid;
            break;
          case 'phone':
            isValid = isValidPhone(value, rule.countryCode);
            break;
          case 'number':
            isValid = isValidNumber(value);
            break;
          case 'range':
            isValid = isInRange(value, rule.min, rule.max);
            break;
          case 'url':
            isValid = isValidUrl(value);
            break;
          case 'match':
            isValid = isMatching(value, values[rule.field]);
            break;
          case 'date':
            isValid = isValidDate(value);
            break;
          case 'futureDate':
            isValid = isFutureDate(value);
            break;
          case 'pastDate':
            isValid = isPastDate(value);
            break;
          case 'custom':
            // استخدام دالة مخصصة للتحقق إذا تم توفيرها
            isValid = rule.validator(value, values);
            break;
          default:
            isValid = true;
        }
        
        // إضافة الخطأ إذا كان التحقق فاشلاً
        if (!isValid && !errors[field]) {
          errors[field] = message;
        }
      });
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
  
  export default {
    isValidEmail,
    validatePassword,
    isNotEmpty,
    isValidPhone,
    isValidNumber,
    isInRange,
    isValidUrl,
    isMatching,
    isValidDate,
    isFutureDate,
    isPastDate,
    isValidFileType,
    isValidFileSize,
    isInArray,
    validateForm,
  };