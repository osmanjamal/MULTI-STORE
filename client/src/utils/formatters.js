/**
 * أدوات التنسيق
 * توفر دوال لتنسيق مختلف أنواع البيانات
 */

/**
 * تنسيق العملة
 * @param {number} amount - المبلغ
 * @param {string} currency - رمز العملة (الافتراضي: SAR)
 * @param {string} locale - الإعدادات المحلية (الافتراضي: ar-SA)
 * @returns {string} النص المنسق
 */
export const formatCurrency = (amount, currency = 'SAR', locale = 'ar-SA') => {
    if (amount === null || amount === undefined) return '-';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * تنسيق التاريخ
   * @param {string|Date} date - التاريخ
   * @param {string} format - نمط التنسيق (short, medium, long, full)
   * @param {string} locale - الإعدادات المحلية (الافتراضي: ar-SA)
   * @returns {string} التاريخ المنسق
   */
  export const formatDate = (date, format = 'medium', locale = 'ar-SA') => {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // للتحقق من صحة التاريخ
    if (isNaN(dateObj.getTime())) return '-';
    
    const options = {
      short: { day: 'numeric', month: 'numeric', year: 'numeric' },
      medium: { day: 'numeric', month: 'short', year: 'numeric' },
      long: { day: 'numeric', month: 'long', year: 'numeric' },
      full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    };
    
    return dateObj.toLocaleDateString(locale, options[format] || options.medium);
  };
  
  /**
   * تنسيق الوقت
   * @param {string|Date} date - التاريخ والوقت
   * @param {boolean} includeSeconds - تضمين الثواني
   * @param {string} locale - الإعدادات المحلية (الافتراضي: ar-SA)
   * @returns {string} الوقت المنسق
   */
  export const formatTime = (date, includeSeconds = false, locale = 'ar-SA') => {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // للتحقق من صحة التاريخ
    if (isNaN(dateObj.getTime())) return '-';
    
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    
    if (includeSeconds) {
      options.second = '2-digit';
    }
    
    return dateObj.toLocaleTimeString(locale, options);
  };
  
  /**
   * تنسيق التاريخ والوقت معاً
   * @param {string|Date} date - التاريخ والوقت
   * @param {string} dateFormat - نمط تنسيق التاريخ
   * @param {boolean} includeSeconds - تضمين الثواني
   * @param {string} locale - الإعدادات المحلية (الافتراضي: ar-SA)
   * @returns {string} التاريخ والوقت المنسقان
   */
  export const formatDateTime = (
    date,
    dateFormat = 'medium',
    includeSeconds = false,
    locale = 'ar-SA'
  ) => {
    if (!date) return '-';
    
    return `${formatDate(date, dateFormat, locale)} ${formatTime(
      date,
      includeSeconds,
      locale
    )}`;
  };
  
  /**
   * تنسيق الرقم
   * @param {number} number - الرقم
   * @param {number} minimumFractionDigits - الحد الأدنى للأرقام العشرية
   * @param {number} maximumFractionDigits - الحد الأقصى للأرقام العشرية
   * @param {string} locale - الإعدادات المحلية (الافتراضي: ar-SA)
   * @returns {string} الرقم المنسق
   */
  export const formatNumber = (
    number,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'ar-SA'
  ) => {
    if (number === null || number === undefined) return '-';
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(number);
  };
  
  /**
   * تنسيق النسبة المئوية
   * @param {number} value - القيمة (0-1)
   * @param {number} digits - عدد الأرقام العشرية
   * @param {string} locale - الإعدادات المحلية (الافتراضي: ar-SA)
   * @returns {string} النسبة المئوية المنسقة
   */
  export const formatPercent = (value, digits = 2, locale = 'ar-SA') => {
    if (value === null || value === undefined) return '-';
    
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  };
  
  /**
   * تنسيق الحجم (بايت، كيلوبايت، ميجابايت، إلخ)
   * @param {number} bytes - الحجم بالبايت
   * @param {number} decimals - عدد الأرقام العشرية
   * @returns {string} الحجم المنسق
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  };
  
  /**
   * تنسيق رقم الهاتف
   * @param {string} phone - رقم الهاتف
   * @returns {string} رقم الهاتف المنسق
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    
    // إزالة جميع الأحرف غير الرقمية
    const cleaned = phone.replace(/\D/g, '');
    
    // التنسيق حسب الطول
    if (cleaned.length === 10) {
      // تنسيق أرقام محلية (مثل: 05xxxxxxxx)
      return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
    } else if (cleaned.length === 12 || cleaned.length === 13) {
      // تنسيق أرقام دولية (مثل: +966xxxxxxxxx)
      return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8, 11)} ${cleaned.substring(11)}`;
    }
    
    // إرجاع الرقم كما هو إذا لم يطابق أياً من التنسيقات المعروفة
    return phone;
  };
  
  /**
   * تنسيق الحالة
   * @param {string} status - الحالة
   * @returns {Object} كائن يحتوي على نص وفئة CSS
   */
  export const formatStatus = (status) => {
    const statusMap = {
      // حالات المنتج
      active: { text: 'نشط', class: 'status-success' },
      inactive: { text: 'غير نشط', class: 'status-muted' },
      draft: { text: 'مسودة', class: 'status-info' },
      
      // حالات المخزون
      in_stock: { text: 'متوفر', class: 'status-success' },
      low_stock: { text: 'منخفض', class: 'status-warning' },
      out_of_stock: { text: 'غير متوفر', class: 'status-danger' },
      
      // حالات الطلب
      pending: { text: 'قيد الانتظار', class: 'status-info' },
      processing: { text: 'قيد المعالجة', class: 'status-primary' },
      shipped: { text: 'تم الشحن', class: 'status-info' },
      completed: { text: 'مكتمل', class: 'status-success' },
      cancelled: { text: 'ملغي', class: 'status-danger' },
      refunded: { text: 'مسترد', class: 'status-warning' },
      
      // حالات المزامنة
      idle: { text: 'غير نشط', class: 'status-muted' },
      running: { text: 'قيد التنفيذ', class: 'status-primary' },
      success: { text: 'ناجح', class: 'status-success' },
      error: { text: 'خطأ', class: 'status-danger' },
      warning: { text: 'تحذير', class: 'status-warning' },
      stopped: { text: 'متوقف', class: 'status-danger' },
    };
    
    // إرجاع التنسيق المعروف أو قيمة افتراضية
    return statusMap[status] || { text: status, class: 'status-default' };
  };
  
  /**
   * تحويل سلسلة نصية إلى عنوان URL آمن (slug)
   * @param {string} text - النص
   * @returns {string} عنوان URL
   */
  export const slugify = (text) => {
    if (!text) return '';
    
    // تحويل الأحرف العربية إلى أحرف لاتينية مقابلة (ترجمة صوتية)
    const arabicToLatin = {
      'أ': 'a', 'إ': 'e', 'آ': 'a', 'ا': 'a',
      'ب': 'b', 'ت': 't', 'ث': 'th',
      'ج': 'j', 'ح': 'h', 'خ': 'kh',
      'د': 'd', 'ذ': 'th',
      'ر': 'r', 'ز': 'z',
      'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
      'ط': 't', 'ظ': 'z',
      'ع': 'a', 'غ': 'gh',
      'ف': 'f', 'ق': 'q', 'ك': 'k',
      'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w',
      'ي': 'y', 'ى': 'a', 'ئ': 'e',
      'ء': 'a', 'ؤ': 'o',
      'ة': 'h',
    };
    
    // استبدال الأحرف العربية
    let latinText = text;
    for (const [arabic, latin] of Object.entries(arabicToLatin)) {
      const regex = new RegExp(arabic, 'g');
      latinText = latinText.replace(regex, latin);
    }
    
    return latinText
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // استبدال المسافات بشرطات
      .replace(/&/g, '-and-') // استبدال & بـ 'and'
      .replace(/[^\w\-]+/g, '') // إزالة جميع الأحرف غير الكلمات
      .replace(/\-\-+/g, '-') // استبدال شرطات متعددة بشرطة واحدة
      .replace(/^-+/, '') // إزالة الشرطات من البداية
      .replace(/-+$/, ''); // إزالة الشرطات من النهاية
  };
  
  /**
   * قص النص وإضافة علامة القطع
   * @param {string} text - النص
   * @param {number} length - الحد الأقصى للطول
   * @returns {string} النص المقصوص
   */
  export const truncateText = (text, length = 100) => {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  };
  
  /**
   * تحويل الاسم إلى أول حرف مكبر
   * @param {string} name - الاسم
   * @returns {string} الاسم المحوّل
   */
  export const capitalizeFirstLetter = (name) => {
    if (!name) return '';
    
    // الأسماء العربية ليس لها حالة الأحرف (كبيرة/صغيرة)، لذا نعيدها كما هي
    if (/[\u0600-\u06FF]/.test(name)) {
      return name;
    }
    
    // تحويل الأسماء اللاتينية
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  
  export default {
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatPercent,
    formatFileSize,
    formatPhoneNumber,
    formatStatus,
    slugify,
    truncateText,
    capitalizeFirstLetter,
  };