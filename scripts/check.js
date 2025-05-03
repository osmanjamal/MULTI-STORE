/**
 * سكربت فحص سلامة المشروع
 * يقوم هذا السكربت بفحص هيكل المشروع والتحقق من وجود جميع الملفات والمتطلبات
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk'); // قم بتثبيت هذه الحزمة: npm install chalk

// تحديد المسار الرئيسي للمشروع
const rootDir = path.resolve(__dirname, '..');
console.log(chalk.blue('⚙️ بدء فحص مشروع مزامنة المتاجر المتعددة...'));

// فحص وجود المجلدات الرئيسية
const requiredDirs = [
  'server',
  'client',
  'database',
  'scripts'
];

console.log(chalk.yellow('\n📁 فحص المجلدات الرئيسية:'));
let dirsOk = true;
requiredDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(chalk.green(`✅ مجلد ${dir} موجود`));
  } else {
    console.log(chalk.red(`❌ مجلد ${dir} غير موجود`));
    dirsOk = false;
  }
});

// فحص ملفات الإعداد الأساسية
console.log(chalk.yellow('\n📄 فحص ملفات الإعداد:'));
let configOk = true;

// فحص ملف env الخادم
const serverEnvPath = path.join(rootDir, 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
  console.log(chalk.green('✅ ملف .env للخادم موجود'));
  
  // فحص محتوى ملف env
  const envContent = fs.readFileSync(serverEnvPath, 'utf8');
  const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(chalk.green(`  ✅ متغير ${envVar} موجود`));
    } else {
      console.log(chalk.red(`  ❌ متغير ${envVar} غير موجود`));
      configOk = false;
    }
  });
} else {
  console.log(chalk.red('❌ ملف .env للخادم غير موجود'));
  configOk = false;
}

// فحص التبعيات
console.log(chalk.yellow('\n📦 فحص التبعيات:'));

try {
  console.log(chalk.blue('  🔍 فحص تبعيات الخادم...'));
  execSync('cd ' + path.join(rootDir, 'server') + ' && npm ls --depth=0', { stdio: 'ignore' });
  console.log(chalk.green('  ✅ تبعيات الخادم مثبتة بشكل صحيح'));
} catch (error) {
  console.log(chalk.red('  ❌ مشاكل في تبعيات الخادم'));
  console.log(chalk.yellow('  ℹ️ قم بتشغيل: cd server && npm install'));
}

try {
  console.log(chalk.blue('  🔍 فحص تبعيات العميل...'));
  execSync('cd ' + path.join(rootDir, 'client') + ' && npm ls --depth=0', { stdio: 'ignore' });
  console.log(chalk.green('  ✅ تبعيات العميل مثبتة بشكل صحيح'));
} catch (error) {
  console.log(chalk.red('  ❌ مشاكل في تبعيات العميل'));
  console.log(chalk.yellow('  ℹ️ قم بتشغيل: cd client && npm install'));
}

// فحص اتصال قاعدة البيانات
console.log(chalk.yellow('\n🗄️ فحص الاتصال بقاعدة البيانات:'));
try {
  console.log(chalk.blue('  🔍 جاري الاتصال بقاعدة البيانات...'));
  const mongoose = require(path.join(rootDir, 'server', 'node_modules', 'mongoose'));
  const dotenv = require(path.join(rootDir, 'server', 'node_modules', 'dotenv'));
  
  dotenv.config({ path: serverEnvPath });
  
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log(chalk.green('  ✅ تم الاتصال بقاعدة البيانات بنجاح'));
      mongoose.connection.close();
    })
    .catch(err => {
      console.log(chalk.red('  ❌ فشل الاتصال بقاعدة البيانات'));
      console.log(chalk.red(`  ❌ الخطأ: ${err.message}`));
    });
} catch (error) {
  console.log(chalk.red('  ❌ خطأ في التحقق من الاتصال بقاعدة البيانات'));
  console.log(chalk.red(`  ❌ الخطأ: ${error.message}`));
}

// النتيجة النهائية
console.log(chalk.yellow('\n📝 ملخص الفحص:'));
if (dirsOk && configOk) {
  console.log(chalk.green('✅ المشروع جاهز للتشغيل'));
  console.log(chalk.blue('\nلبدء المشروع:'));
  console.log(chalk.white('1. تشغيل الخادم: cd server && npm run dev'));
  console.log(chalk.white('2. تشغيل العميل: cd client && npm start'));
} else {
  console.log(chalk.red('❌ يوجد مشاكل في المشروع تحتاج إلى معالجة قبل التشغيل'));
}

console.log(chalk.blue('\n⚙️ انتهى فحص المشروع'));