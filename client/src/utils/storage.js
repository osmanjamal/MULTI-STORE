/**
 * أدوات التخزين المحلي
 * توفر دوال للتعامل مع التخزين المحلي والجلسة في المتصفح
 */

// مفتاح البادئة للتخزين المحلي الخاص بالتطبيق
const STORAGE_PREFIX = 'multi_store_';

/**
 * حفظ قيمة في التخزين المحلي
 * @param {string} key - المفتاح
 * @param {*} value - القيمة (سيتم تحويلها إلى JSON)
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 */
export const setItem = (key, value, useSession = false) => {
  try {
    // إضافة البادئة إلى المفتاح
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    
    // تحويل القيمة إلى نص JSON
    const serializedValue = JSON.stringify(value);
    
    // اختيار نوع التخزين
    const storage = useSession ? sessionStorage : localStorage;
    
    // حفظ القيمة
    storage.setItem(prefixedKey, serializedValue);
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ البيانات في التخزين المحلي:', error);
    return false;
  }
};

/**
 * قراءة قيمة من التخزين المحلي
 * @param {string} key - المفتاح
 * @param {*} defaultValue - القيمة الافتراضية إذا لم يتم العثور على المفتاح
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 * @returns {*} القيمة المسترجعة
 */
export const getItem = (key, defaultValue = null, useSession = false) => {
  try {
    // إضافة البادئة إلى المفتاح
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    
    // اختيار نوع التخزين
    const storage = useSession ? sessionStorage : localStorage;
    
    // قراءة القيمة
    const serializedValue = storage.getItem(prefixedKey);
    
    // إرجاع القيمة الافتراضية إذا لم يتم العثور على المفتاح
    if (serializedValue === null) {
      return defaultValue;
    }
    
    // تحويل القيمة من نص JSON
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('خطأ في قراءة البيانات من التخزين المحلي:', error);
    return defaultValue;
  }
};

/**
 * حذف قيمة من التخزين المحلي
 * @param {string} key - المفتاح
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 */
export const removeItem = (key, useSession = false) => {
  try {
    // إضافة البادئة إلى المفتاح
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    
    // اختيار نوع التخزين
    const storage = useSession ? sessionStorage : localStorage;
    
    // حذف القيمة
    storage.removeItem(prefixedKey);
    
    return true;
  } catch (error) {
    console.error('خطأ في حذف البيانات من التخزين المحلي:', error);
    return false;
  }
};

/**
 * التحقق من وجود مفتاح في التخزين المحلي
 * @param {string} key - المفتاح
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 * @returns {boolean} يوجد أم لا
 */
export const hasItem = (key, useSession = false) => {
  try {
    // إضافة البادئة إلى المفتاح
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    
    // اختيار نوع التخزين
    const storage = useSession ? sessionStorage : localStorage;
    
    // التحقق من وجود المفتاح
    return storage.getItem(prefixedKey) !== null;
  } catch (error) {
    console.error('خطأ في التحقق من وجود البيانات في التخزين المحلي:', error);
    return false;
  }
};

/**
 * مسح جميع بيانات التطبيق من التخزين المحلي
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 */
export const clearStorage = (useSession = false) => {
  try {
    // اختيار نوع التخزين
    const storage = useSession ? sessionStorage : localStorage;
    
    // الحصول على قائمة المفاتيح
    const keys = Object.keys(storage);
    
    // حذف المفاتيح التي تبدأ بالبادئة
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        storage.removeItem(key);
      }
    });
    
    return true;
  } catch (error) {
    console.error('خطأ في مسح بيانات التطبيق من التخزين المحلي:', error);
    return false;
  }
};

/**
 * الحصول على جميع مفاتيح التطبيق من التخزين المحلي
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 * @returns {Array} قائمة المفاتيح (بدون البادئة)
 */
export const getAllKeys = (useSession = false) => {
  try {
    // اختيار نوع التخزين
    const storage = useSession ? sessionStorage : localStorage;
    
    // الحصول على قائمة المفاتيح
    const keys = Object.keys(storage);
    
    // تصفية وإزالة البادئة من المفاتيح
    return keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ''));
  } catch (error) {
    console.error('خطأ في الحصول على مفاتيح التطبيق من التخزين المحلي:', error);
    return [];
  }
};

/**
 * تحميل جميع بيانات التطبيق من التخزين المحلي
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 * @returns {Object} كائن يحتوي على جميع البيانات
 */
export const getAllItems = (useSession = false) => {
  try {
    // الحصول على جميع المفاتيح
    const keys = getAllKeys(useSession);
    
    // تكوين كائن يحتوي على جميع البيانات
    const items = {};
    keys.forEach((key) => {
      items[key] = getItem(key, null, useSession);
    });
    
    return items;
  } catch (error) {
    console.error('خطأ في تحميل بيانات التطبيق من التخزين المحلي:', error);
    return {};
  }
};

/**
 * حفظ مجموعة من العناصر في التخزين المحلي
 * @param {Object} items - كائن يحتوي على المفاتيح والقيم
 * @param {boolean} useSession - استخدام تخزين الجلسة بدلاً من التخزين المحلي
 */
export const setMultipleItems = (items, useSession = false) => {
  try {
    // حفظ كل عنصر
    Object.entries(items).forEach(([key, value]) => {
      setItem(key, value, useSession);
    });
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ مجموعة من العناصر في التخزين المحلي:', error);
    return false;
  }
};

/**
 * التحقق من دعم التخزين المحلي في المتصفح
 * @param {boolean} checkSession - التحقق من دعم تخزين الجلسة بدلاً من التخزين المحلي
 * @returns {boolean} مدعوم أم لا
 */
export const isStorageSupported = (checkSession = false) => {
  try {
    const storageType = checkSession ? 'sessionStorage' : 'localStorage';
    const storage = window[storageType];
    
    const testKey = `${STORAGE_PREFIX}test`;
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  setItem,
  getItem,
  removeItem,
  hasItem,
  clearStorage,
  getAllKeys,
  getAllItems,
  setMultipleItems,
  isStorageSupported,
};