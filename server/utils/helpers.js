const crypto = require('crypto');

/**
 * مجموعة من الوظائف المساعدة العامة
 */

// إنشاء معرف فريد
const generateUUID = () => {
  return crypto.randomUUID();
};

// إنشاء رمز عشوائي
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// تشفير نص
const encrypt = (text, secret = process.env.ENCRYPTION_KEY) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// فك تشفير نص
const decrypt = (text, secret = process.env.ENCRYPTION_KEY) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// تأخير تنفيذ
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// استخراج كود SKU من باركود
const extractSkuFromBarcode = (barcode) => {
  // يمكن تخصيص هذه الوظيفة حسب تنسيق الباركود المستخدم
  return barcode;
};

// تحليل سلسلة توقيت cron
const parseCronExpression = (cronString) => {
  const parts = cronString.split(' ');
  if (parts.length !== 5) {
    throw new Error('تنسيق cron غير صالح');
  }
  
  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4]
  };
};

// تقسيم مصفوفة إلى مجموعات أصغر
const chunkArray = (array, chunkSize) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

// نسخ كائن عميق
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// تجميع المتكررات في مصفوفة
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

module.exports = {
  generateUUID,
  generateRandomToken,
  encrypt,
  decrypt,
  sleep,
  extractSkuFromBarcode,
  parseCronExpression,
  chunkArray,
  deepClone,
  groupBy
};