const fs = require('fs');
const path = require('path');

// قائمة بالملفات والدوال المطلوبة
const routes = {
  'routes/auth.js': ['authController.register', 'authController.login', 'authController.logout', 'authController.getMe', 'userController.getProfile', 'userController.updateProfile', 'userController.updatePassword'],
  'routes/store.js': [], // سنتحقق منها لاحقاً
  'routes/product.js': [],
  'routes/inventory.js': [],
  'routes/order.js': [],
  'routes/sync.js': [],
  'routes/webhook.js': []
};

// التحقق من وجود الدوال المطلوبة
console.log('🔍 جاري التحقق من الملفات...\n');

Object.entries(routes).forEach(([filePath, required]) => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    try {
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      
      // التحقق من الدوال المطلوبة
      required.forEach(func => {
        if (!fileContent.includes(func)) {
          console.log(`❌ ${filePath}: الدالة ${func} غير موجودة`);
        }
      });
      
      // التحقق من require statements
      const requires = fileContent.match(/require\(['"][^'"]+['"]\)/g) || [];
      requires.forEach(req => {
        const reqPath = req.match(/['"]([^'"]+)['"]/)[1];
        if (reqPath.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(fullPath), reqPath);
          if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.js')) {
            console.log(`❌ ${filePath}: الملف المطلوب ${reqPath} غير موجود`);
          }
        }
      });
      
      console.log(`✅ ${filePath}: تم التحقق`);
    } catch (error) {
      console.log(`❌ ${filePath}: خطأ في قراءة الملف - ${error.message}`);
    }
  } else {
    console.log(`❌ ${filePath}: الملف غير موجود`);
  }
});

console.log('\n🔍 التحقق من controllers...');

// التحقق من ملفات controllers
const controllers = [
  'controllers/auth/authController.js',
  'controllers/auth/userController.js',
  'controllers/store/storeController.js',
  'controllers/product/productController.js',
  'controllers/inventory/inventoryController.js',
  'controllers/order/orderController.js',
  'controllers/sync/syncController.js',
  'controllers/sync/webhookController.js'
];

controllers.forEach(controller => {
  const fullPath = path.join(__dirname, controller);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${controller}: الملف غير موجود`);
  } else {
    try {
      require(fullPath);
      console.log(`✅ ${controller}: تم التحميل بنجاح`);
    } catch (error) {
      console.log(`❌ ${controller}: خطأ - ${error.message}`);
    }
  }
});