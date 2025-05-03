multi-store-sync/
├── .github/                            # ملفات جيتهاب للتطوير المستمر
│   └── workflows/                      # تكوين العمليات الآلية
│       ├── ci.yml                      # التكامل المستمر
│       └── deploy.yml                  # النشر التلقائي
├── server/                             # الخادم الخلفي
│   ├── config/                         # ملفات الإعدادات
│   │   ├── database.js                 # إعدادات قاعدة البيانات
│   │   ├── marketplace/               # إعدادات منصات السوق المختلفة
│   │   │   ├── shopify.js              # إعدادات واجهة برمجة شوبيفاي
│   │   │   ├── lazada.js               # إعدادات واجهة برمجة لازادا
│   │   │   ├── shopee.js               # إعدادات واجهة برمجة شوبي
│   │   │   └── woocommerce.js          # إعدادات واجهة برمجة ووكومرس
│   │   └── app.js                      # إعدادات عامة للتطبيق
│   ├── controllers/                    # وحدات التحكم
│   │   ├── auth/                       # وحدات تحكم المصادقة
│   │   │   ├── authController.js       # التحكم في المصادقة
│   │   │   └── userController.js       # التحكم في المستخدمين
│   │   ├── store/                      # وحدات تحكم المتاجر
│   │   │   ├── storeController.js      # التحكم في المتاجر
│   │   │   └── connectionController.js # التحكم في الاتصالات بين المتاجر
│   │   ├── product/                    # وحدات تحكم المنتجات
│   │   │   ├── productController.js    # التحكم في المنتجات
│   │   │   ├── variantController.js    # التحكم في متغيرات المنتجات
│   │   │   └── categoryController.js   # التحكم في فئات المنتجات
│   │   ├── inventory/                  # وحدات تحكم المخزون
│   │   │   ├── inventoryController.js  # التحكم في المخزون
│   │   │   └── stockController.js      # التحكم في المخزون والعمليات
│   │   ├── order/                      # وحدات تحكم الطلبات
│   │   │   ├── orderController.js      # التحكم في الطلبات
│   │   │   └── fulfillmentController.js# التحكم في إتمام الطلبات
│   │   └── sync/                       # وحدات تحكم المزامنة
│   │       ├── syncController.js       # التحكم في المزامنة
│   │       ├── syncRuleController.js   # التحكم في قواعد المزامنة
│   │       ├── webhookController.js    # التحكم في الويب هوك
│   │       └── logController.js        # التحكم في سجلات المزامنة
│   ├── models/                         # نماذج البيانات
│   │   ├── user.js                     # نموذج المستخدم
│   │   ├── store.js                    # نموذج المتجر
│   │   ├── connection.js               # نموذج الاتصال بين المتاجر
│   │   ├── product.js                  # نموذج المنتج
│   │   ├── variant.js                  # نموذج متغير المنتج
│   │   ├── category.js                 # نموذج فئة المنتج
│   │   ├── inventory.js                # نموذج المخزون
│   │   ├── order.js                    # نموذج الطلب
│   │   ├── fulfillment.js              # نموذج إتمام الطلب
│   │   ├── syncRule.js                 # نموذج قاعدة المزامنة
│   │   ├── syncLog.js                  # نموذج سجل المزامنة
│   │   └── webhook.js                  # نموذج الويب هوك
│   ├── routes/                         # مسارات API
│   │   ├── auth.js                     # مسارات المصادقة
│   │   ├── store.js                    # مسارات المتاجر
│   │   ├── product.js                  # مسارات المنتجات
│   │   ├── inventory.js                # مسارات المخزون
│   │   ├── order.js                    # مسارات الطلبات
│   │   ├── sync.js                     # مسارات المزامنة
│   │   └── webhook.js                  # مسارات الويب هوك
│   ├── services/                       # الخدمات
│   │   ├── auth/                       # خدمات المصادقة
│   │   │   ├── authService.js          # خدمة المصادقة
│   │   │   └── tokenService.js         # خدمة الرموز
│   │   ├── marketplace/                # خدمات منصات السوق
│   │   │   ├── shopifyService.js       # خدمة شوبيفاي
│   │   │   ├── lazadaService.js        # خدمة لازادا
│   │   │   ├── shopeeService.js        # خدمة شوبي
│   │   │   └── woocommerceService.js   # خدمة ووكومرس
│   │   ├── product/                    # خدمات المنتجات
│   │   │   ├── productService.js       # خدمة المنتجات
│   │   │   ├── importService.js        # خدمة استيراد المنتجات
│   │   │   └── exportService.js        # خدمة تصدير المنتجات
│   │   ├── inventory/                  # خدمات المخزون
│   │   │   ├── inventoryService.js     # خدمة المخزون
│   │   │   └── stockAdjustmentService.js # خدمة تعديل المخزون
│   │   ├── order/                      # خدمات الطلبات
│   │   │   ├── orderService.js         # خدمة الطلبات
│   │   │   └── fulfillmentService.js   # خدمة إتمام الطلبات
│   │   └── sync/                       # خدمات المزامنة
│   │       ├── syncService.js          # خدمة المزامنة
│   │       ├── webhookService.js       # خدمة الويب هوك
│   │       ├── matchingService.js      # خدمة مطابقة المنتجات
│   │       └── logService.js           # خدمة سجلات المزامنة
│   ├── utils/                          # أدوات مساعدة
│   │   ├── logger.js                   # أداة التسجيل
│   │   ├── errors.js                   # معالجة الأخطاء
│   │   ├── validators.js               # أدوات التحقق
│   │   ├── formatter.js                # أدوات التنسيق
│   │   └── helpers.js                  # دوال مساعدة عامة
│   ├── middleware/                     # الوسائط البرمجية
│   │   ├── auth.js                     # وسيط المصادقة
│   │   ├── errorHandler.js             # وسيط معالجة الأخطاء
│   │   ├── rateLimiter.js              # وسيط تحديد معدل الطلبات
│   │   └── webhookValidator.js         # وسيط التحقق من الويب هوك
│   ├── jobs/                           # المهام المجدولة
│   │   ├── syncInventory.js            # مهمة مزامنة المخزون
│   │   ├── syncProducts.js             # مهمة مزامنة المنتجات
│   │   ├── syncOrders.js               # مهمة مزامنة الطلبات
│   │   └── cleanupLogs.js              # مهمة تنظيف السجلات
│   ├── migrations/                     # ملفات ترحيل قاعدة البيانات
│   ├── app.js                          # بداية تطبيق Express
│   ├── server.js                       # نقطة الدخول للخادم
│   └── package.json                    # حزم Node.js للخادم
├── client/                             # واجهة المستخدم
│   ├── public/                         # الملفات العامة
│   │   ├── favicon.ico                 # أيقونة الموقع
│   │   ├── index.html                  # ملف HTML الرئيسي
│   │   └── assets/                     # الموارد العامة
│   │       ├── images/                 # الصور العامة
│   │       └── icons/                  # الأيقونات
│   ├── src/                            # مصدر الكود
│   │   ├── assets/                     # الموارد المحلية
│   │   │   ├── images/                 # الصور
│   │   │   ├── icons/                  # الأيقونات
│   │   │   └── styles/                 # الأنماط العامة
│   │   ├── components/                 # مكونات React
│   │   │   ├── layout/                 # مكونات التخطيط
│   │   │   │   ├── Header.jsx          # رأس الصفحة
│   │   │   │   ├── Sidebar.jsx         # الشريط الجانبي
│   │   │   │   ├── Footer.jsx          # تذييل الصفحة
│   │   │   │   └── Layout.jsx          # التخطيط الرئيسي
│   │   │   ├── common/                 # مكونات مشتركة
│   │   │   │   ├── Button.jsx          # زر
│   │   │   │   ├── Card.jsx            # بطاقة
│   │   │   │   ├── Table.jsx           # جدول
│   │   │   │   ├── Modal.jsx           # نافذة منبثقة
│   │   │   │   ├── Alert.jsx           # تنبيه
│   │   │   │   ├── Loader.jsx          # مؤشر التحميل
│   │   │   │   └── Pagination.jsx      # ترقيم الصفحات
│   │   │   ├── auth/                   # مكونات المصادقة
│   │   │   │   ├── LoginForm.jsx       # نموذج تسجيل الدخول
│   │   │   │   └── RegisterForm.jsx    # نموذج التسجيل
│   │   │   ├── dashboard/              # مكونات لوحة القيادة
│   │   │   │   ├── StatsCard.jsx       # بطاقة الإحصائيات
│   │   │   │   ├── SyncStatus.jsx      # حالة المزامنة
│   │   │   │   └── ActivityLog.jsx     # سجل النشاط
│   │   │   ├── stores/                 # مكونات المتاجر
│   │   │   │   ├── StoreList.jsx       # قائمة المتاجر
│   │   │   │   ├── StoreForm.jsx       # نموذج المتجر
│   │   │   │   └── StoreCard.jsx       # بطاقة المتجر
│   │   │   ├── products/               # مكونات المنتجات
│   │   │   │   ├── ProductList.jsx     # قائمة المنتجات
│   │   │   │   ├── ProductForm.jsx     # نموذج المنتج
│   │   │   │   ├── ProductDetail.jsx   # تفاصيل المنتج
│   │   │   │   └── ProductMapping.jsx  # ربط المنتجات
│   │   │   ├── inventory/              # مكونات المخزون
│   │   │   │   ├── InventoryList.jsx   # قائمة المخزون
│   │   │   │   ├── InventoryForm.jsx   # نموذج المخزون
│   │   │   │   └── StockAdjustment.jsx # تعديل المخزون
│   │   │   ├── orders/                 # مكونات الطلبات
│   │   │   │   ├── OrderList.jsx       # قائمة الطلبات
│   │   │   │   ├── OrderDetail.jsx     # تفاصيل الطلب
│   │   │   │   └── FulfillmentForm.jsx # نموذج إتمام الطلب
│   │   │   └── sync/                   # مكونات المزامنة
│   │   │       ├── SyncRuleList.jsx    # قائمة قواعد المزامنة
│   │   │       ├── SyncRuleForm.jsx    # نموذج قاعدة المزامنة
│   │   │       ├── SyncLogList.jsx     # قائمة سجلات المزامنة
│   │   │       └── SyncSettings.jsx    # إعدادات المزامنة
│   │   ├── pages/                      # صفحات التطبيق
│   │   │   ├── Auth/                   # صفحات المصادقة
│   │   │   │   ├── Login.jsx           # صفحة تسجيل الدخول
│   │   │   │   ├── Register.jsx        # صفحة التسجيل
│   │   │   │   └── ForgotPassword.jsx  # صفحة استعادة كلمة المرور
│   │   │   ├── Dashboard.jsx           # صفحة لوحة القيادة
│   │   │   ├── Stores/                 # صفحات المتاجر
│   │   │   │   ├── StoresPage.jsx      # صفحة المتاجر
│   │   │   │   ├── AddStore.jsx        # صفحة إضافة متجر
│   │   │   │   └── EditStore.jsx       # صفحة تعديل متجر
│   │   │   ├── Products/               # صفحات المنتجات
│   │   │   │   ├── ProductsPage.jsx    # صفحة المنتجات
│   │   │   │   ├── AddProduct.jsx      # صفحة إضافة منتج
│   │   │   │   ├── EditProduct.jsx     # صفحة تعديل منتج
│   │   │   │   └── ProductMapping.jsx  # صفحة ربط المنتجات
│   │   │   ├── Inventory/              # صفحات المخزون
│   │   │   │   ├── InventoryPage.jsx   # صفحة المخزون
│   │   │   │   └── AdjustStock.jsx     # صفحة تعديل المخزون
│   │   │   ├── Orders/                 # صفحات الطلبات
│   │   │   │   ├── OrdersPage.jsx      # صفحة الطلبات
│   │   │   │   └── OrderDetail.jsx     # صفحة تفاصيل الطلب
│   │   │   ├── Sync/                   # صفحات المزامنة
│   │   │   │   ├── SyncRules.jsx       # صفحة قواعد المزامنة
│   │   │   │   ├── SyncLogs.jsx        # صفحة سجلات المزامنة
│   │   │   │   └── SyncSettings.jsx    # صفحة إعدادات المزامنة
│   │   │   └── Settings/               # صفحات الإعدادات
│   │   │       ├── ProfileSettings.jsx # إعدادات الملف الشخصي
│   │   │       ├── AccountSettings.jsx # إعدادات الحساب
│   │   │       └── ApiSettings.jsx     # إعدادات API
│   │   ├── context/                    # سياقات React
│   │   │   ├── AuthContext.jsx         # سياق المصادقة
│   │   │   ├── StoreContext.jsx        # سياق المتاجر
│   │   │   ├── ProductContext.jsx      # سياق المنتجات
│   │   │   └── SyncContext.jsx         # سياق المزامنة
│   │   ├── hooks/                      # خطافات React
│   │   │   ├── useAuth.js              # خطاف المصادقة
│   │   │   ├── useStore.js             # خطاف المتاجر
│   │   │   ├── useProduct.js           # خطاف المنتجات
│   │   │   ├── useInventory.js         # خطاف المخزون
│   │   │   ├── useOrder.js             # خطاف الطلبات
│   │   │   └── useSync.js              # خطاف المزامنة
│   │   ├── services/                   # خدمات الواجهة
│   │   │   ├── api.js                  # خدمة التعامل مع API
│   │   │   ├── auth.js                 # خدمة المصادقة
│   │   │   ├── store.js                # خدمة المتاجر
│   │   │   ├── product.js              # خدمة المنتجات
│   │   │   ├── inventory.js            # خدمة المخزون
│   │   │   ├── order.js                # خدمة الطلبات
│   │   │   └── sync.js                 # خدمة المزامنة
│   │   ├── utils/                      # أدوات مساعدة
│   │   │   ├── formatters.js           # أدوات التنسيق
│   │   │   ├── validators.js           # أدوات التحقق
│   │   │   ├── storage.js              # أدوات التخزين المحلي
│   │   │   └── helpers.js              # دوال مساعدة عامة
│   │   ├── config/                     # إعدادات الواجهة
│   │   │   ├── routes.js               # تكوين المسارات
│   │   │   └── theme.js                # تكوين السمة
│   │   ├── App.jsx                     # مكوّن React الرئيسي
│   │   ├── index.jsx                   # نقطة دخول React
│   │   └── routes.jsx                  # تكوين مسارات التطبيق
│   ├── package.json                    # حزم Node.js للواجهة
│   └── README.md                       # توثيق الواجهة
├── database/                           # ملفات قاعدة البيانات
│   ├── schema.sql                      # مخطط قاعدة البيانات
│   └── seeds/                          # بيانات أولية
│       ├── stores.js                   # بيانات المتاجر
│       ├── products.js                 # بيانات المنتجات
│       └── users.js                    # بيانات المستخدمين
├── docs/                               # التوثيق
│   ├── api/                            # توثيق API
│   │   ├── auth.md                     # توثيق API المصادقة
│   │   ├── stores.md                   # توثيق API المتاجر
│   │   ├── products.md                 # توثيق API المنتجات
│   │   ├── inventory.md                # توثيق API المخزون
│   │   ├── orders.md                   # توثيق API الطلبات
│   │   └── sync.md                     # توثيق API المزامنة
│   ├── setup.md                        # دليل الإعداد
│   ├── architecture.md                 # توثيق البنية
│   ├── sync.md                         # توثيق المزامنة
│   └── user-guide.md                   # دليل المستخدم
├── tests/                              # اختبارات
│   ├── server/                         # اختبارات الخادم
│   │   ├── controllers/                # اختبارات وحدات التحكم
│   │   ├── services/                   # اختبارات الخدمات
│   │   ├── models/                     # اختبارات النماذج
│   │   └── integration/                # اختبارات التكامل
│   └── client/                         # اختبارات الواجهة
│       ├── components/                 # اختبارات المكونات
│       ├── hooks/                      # اختبارات الخطافات
│       └── integration/                # اختبارات التكامل
├── scripts/                            # نصوص برمجية للتطوير والنشر
│   ├── setup.sh                        # نص إعداد المشروع
│   ├── deploy.sh                       # نص نشر المشروع
│   └── seed.js                         # نص إضافة بيانات أولية
├── .env.example                        # مثال لملف البيئة
├── .gitignore                          # ملفات مستثناة من git
├── .eslintrc                           # إعدادات ESLint
├── .prettierrc                         # إعدادات Prettier
├── jest.config.js                      # إعدادات Jest للاختبارات
├── docker-compose.yml                  # تكوين Docker Compose
├── Dockerfile                          # تكوين Docker
├── README.md                           # توثيق المشروع
└── package.json                        # حزم Node.js الرئيسية







multi-store-sync/
الحاوية الرئيسية للمشروع والتي تحتوي على جميع الملفات والمجلدات.
.github/
يحتوي على ملفات خاصة بجيتهاب للتطوير المستمر.
.github/workflows/
يضم ملفات تكوين سير العمل للتكامل المستمر والنشر التلقائي.
.github/workflows/ci.yml
ملف تكوين للتكامل المستمر، يحدد كيفية اختبار وبناء التطبيق تلقائياً عند دفع الكود.
.github/workflows/deploy.yml
ملف تكوين للنشر التلقائي، يحدد كيفية نشر التطبيق تلقائياً إلى بيئة الإنتاج.
server/
يحتوي على جميع ملفات الخادم الخلفي للتطبيق (Backend).
server/config/
يحتوي على ملفات الإعدادات للخادم.
server/config/database.js
ملف إعدادات الاتصال بقاعدة البيانات.
server/config/marketplace/
مجلد يحتوي على إعدادات منصات السوق المختلفة.
server/config/marketplace/shopify.js
إعدادات واجهة برمجة التطبيقات الخاصة بشوبيفاي.
server/config/marketplace/lazada.js
إعدادات واجهة برمجة التطبيقات الخاصة بلازادا.
server/config/marketplace/shopee.js
إعدادات واجهة برمجة التطبيقات الخاصة بشوبي.
server/config/marketplace/woocommerce.js
إعدادات واجهة برمجة التطبيقات الخاصة بووكومرس.
server/config/app.js
إعدادات عامة للتطبيق.
server/controllers/
يحتوي على وحدات التحكم التي تدير طلبات API.
server/controllers/auth/
وحدات تحكم المصادقة.
server/controllers/auth/authController.js
التحكم في عمليات المصادقة مثل تسجيل الدخول والخروج.
server/controllers/auth/userController.js
التحكم في عمليات المستخدمين مثل إدارة الملفات الشخصية.
server/controllers/store/
وحدات تحكم المتاجر.
server/controllers/store/storeController.js
التحكم في عمليات المتاجر مثل إضافة وتعديل وحذف المتاجر.
server/controllers/store/connectionController.js
التحكم في الاتصالات بين المتاجر المختلفة.
server/controllers/product/
وحدات تحكم المنتجات.
server/controllers/product/productController.js
التحكم في عمليات المنتجات الأساسية.
server/controllers/product/variantController.js
التحكم في متغيرات المنتجات (مثل الألوان والأحجام).
server/controllers/product/categoryController.js
التحكم في فئات المنتجات.
server/controllers/inventory/
وحدات تحكم المخزون.
server/controllers/inventory/inventoryController.js
التحكم في عمليات المخزون الأساسية.
server/controllers/inventory/stockController.js
التحكم في عمليات المخزون التفصيلية والتعديلات.
server/controllers/order/
وحدات تحكم الطلبات.
server/controllers/order/orderController.js
التحكم في عمليات الطلبات الأساسية.
server/controllers/order/fulfillmentController.js
التحكم في عمليات إتمام وشحن الطلبات.
server/controllers/sync/
وحدات تحكم المزامنة.
server/controllers/sync/syncController.js
التحكم في عمليات المزامنة الأساسية.
server/controllers/sync/syncRuleController.js
التحكم في قواعد المزامنة المخصصة.
server/controllers/sync/webhookController.js
التحكم في استقبال ومعالجة الويب هوك من المتاجر المختلفة.
server/controllers/sync/logController.js
التحكم في سجلات المزامنة وتتبع العمليات.
server/models/
نماذج البيانات التي تمثل هيكل قاعدة البيانات.
server/models/user.js
نموذج بيانات المستخدمين.
server/models/store.js
نموذج بيانات المتاجر.
server/models/connection.js
نموذج بيانات الاتصالات بين المتاجر.
server/models/product.js
نموذج بيانات المنتجات.
server/models/variant.js
نموذج بيانات متغيرات المنتجات.
server/models/category.js
نموذج بيانات فئات المنتجات.
server/models/inventory.js
نموذج بيانات المخزون.
server/models/order.js
نموذج بيانات الطلبات.
server/models/fulfillment.js
نموذج بيانات إتمام الطلبات.
server/models/syncRule.js
نموذج بيانات قواعد المزامنة.
server/models/syncLog.js
نموذج بيانات سجلات المزامنة.
server/models/webhook.js
نموذج بيانات الويب هوك.
server/routes/
مسارات API التي تحدد نقاط النهاية للتطبيق.
server/routes/auth.js
مسارات المصادقة مثل تسجيل الدخول والتسجيل.
server/routes/store.js
مسارات إدارة المتاجر.
server/routes/product.js
مسارات إدارة المنتجات.
server/routes/inventory.js
مسارات إدارة المخزون.
server/routes/order.js
مسارات إدارة الطلبات.
server/routes/sync.js
مسارات إدارة المزامنة.
server/routes/webhook.js
مسارات استقبال الويب هوك.
server/services/
خدمات منطق الأعمال للتطبيق.
server/services/auth/
خدمات المصادقة.
server/services/auth/authService.js
خدمة المصادقة التي تدير عمليات تسجيل الدخول والخروج.
server/services/auth/tokenService.js
خدمة إدارة الرموز المميزة للمصادقة.
server/services/marketplace/
خدمات التعامل مع منصات السوق.
server/services/marketplace/shopifyService.js
خدمة التعامل مع واجهة برمجة تطبيقات شوبيفاي.
server/services/marketplace/lazadaService.js
خدمة التعامل مع واجهة برمجة تطبيقات لازادا.
server/services/marketplace/shopeeService.js
خدمة التعامل مع واجهة برمجة تطبيقات شوبي.
server/services/marketplace/woocommerceService.js
خدمة التعامل مع واجهة برمجة تطبيقات ووكومرس.
server/services/product/
خدمات إدارة المنتجات.
server/services/product/productService.js
خدمة إدارة المنتجات الأساسية.
server/services/product/importService.js
خدمة استيراد المنتجات من مصادر مختلفة.
server/services/product/exportService.js
خدمة تصدير المنتجات إلى منصات أخرى.
server/services/inventory/
خدمات إدارة المخزون.
server/services/inventory/inventoryService.js
خدمة إدارة المخزون الأساسية.
server/services/inventory/stockAdjustmentService.js
خدمة تعديل المخزون وإجراء التغييرات.
server/services/order/
خدمات إدارة الطلبات.
server/services/order/orderService.js
خدمة إدارة الطلبات الأساسية.
server/services/order/fulfillmentService.js
خدمة إتمام وشحن الطلبات.
server/services/sync/
خدمات المزامنة.
server/services/sync/syncService.js
خدمة المزامنة الأساسية.
server/services/sync/webhookService.js
خدمة معالجة الويب هوك.
server/services/sync/matchingService.js
خدمة مطابقة المنتجات بين المتاجر المختلفة.
server/services/sync/logService.js
خدمة سجلات المزامنة وتتبع العمليات.
server/utils/
أدوات مساعدة عامة للخادم.
server/utils/logger.js
أداة تسجيل الأحداث والأخطاء.
server/utils/errors.js
أداة معالجة الأخطاء.
server/utils/validators.js
أداة التحقق من صحة البيانات.
server/utils/formatter.js
أداة تنسيق البيانات.
server/utils/helpers.js
دوال مساعدة عامة.
server/middleware/
الوسائط البرمجية التي تعالج الطلبات قبل وصولها إلى وحدات التحكم.
server/middleware/auth.js
وسيط المصادقة للتحقق من هوية المستخدم.
server/middleware/errorHandler.js
وسيط معالجة الأخطاء.
server/middleware/rateLimiter.js
وسيط تحديد معدل الطلبات لمنع هجمات الحرمان من الخدمة.
server/middleware/webhookValidator.js
وسيط التحقق من صحة طلبات الويب هوك.
server/jobs/
المهام المجدولة التي تعمل في الخلفية.
server/jobs/syncInventory.js
مهمة مجدولة لمزامنة المخزون تلقائياً.
server/jobs/syncProducts.js
مهمة مجدولة لمزامنة المنتجات تلقائياً.
server/jobs/syncOrders.js
مهمة مجدولة لمزامنة الطلبات تلقائياً.
server/jobs/cleanupLogs.js
مهمة مجدولة لتنظيف السجلات القديمة.
server/migrations/
ملفات ترحيل قاعدة البيانات.
server/app.js
بداية تطبيق Express التي تعد نقطة الدخول للخدمات.
server/server.js
نقطة الدخول الرئيسية للخادم.
server/package.json
تكوين حزم Node.js للخادم.
client/
واجهة المستخدم للتطبيق.
client/public/
الملفات العامة لواجهة المستخدم.
client/public/favicon.ico
أيقونة الموقع.
client/public/index.html
ملف HTML الرئيسي.
client/public/assets/
الموارد العامة.
client/public/assets/images/
الصور العامة.
client/public/assets/icons/
الأيقونات العامة.
client/src/
مصدر كود واجهة المستخدم.
client/src/assets/
الموارد المحلية لواجهة المستخدم.
client/src/assets/images/
الصور المحلية.
client/src/assets/icons/
الأيقونات المحلية.
client/src/assets/styles/
الأنماط العامة للتطبيق.
client/src/components/
مكونات React لواجهة المستخدم.
client/src/components/layout/
مكونات تخطيط واجهة المستخدم.
client/src/components/layout/Header.jsx
مكون رأس الصفحة.
client/src/components/layout/Sidebar.jsx
مكون الشريط الجانبي.
client/src/components/layout/Footer.jsx
مكون تذييل الصفحة.
client/src/components/layout/Layout.jsx
مكون التخطيط الرئيسي.
client/src/components/common/
مكونات مشتركة لواجهة المستخدم.
client/src/components/common/Button.jsx
مكون الزر.
client/src/components/common/Card.jsx
مكون البطاقة.
client/src/components/common/Table.jsx
مكون الجدول.
client/src/components/common/Modal.jsx
مكون النافذة المنبثقة.
client/src/components/common/Alert.jsx
مكون التنبيه.
client/src/components/common/Loader.jsx
مكون مؤشر التحميل.
client/src/components/common/Pagination.jsx
مكون ترقيم الصفحات.
client/src/components/auth/
مكونات المصادقة.
client/src/components/auth/LoginForm.jsx
مكون نموذج تسجيل الدخول.
client/src/components/auth/RegisterForm.jsx
مكون نموذج التسجيل.
client/src/components/dashboard/
مكونات لوحة القيادة.
client/src/components/dashboard/StatsCard.jsx
مكون بطاقة الإحصائيات.
client/src/components/dashboard/SyncStatus.jsx
مكون حالة المزامنة.
client/src/components/dashboard/ActivityLog.jsx
مكون سجل النشاط.
client/src/components/stores/
مكونات إدارة المتاجر.
client/src/components/stores/StoreList.jsx
مكون قائمة المتاجر.
client/src/components/stores/StoreForm.jsx
مكون نموذج المتجر.
client/src/components/stores/StoreCard.jsx
مكون بطاقة المتجر.
client/src/components/products/
مكونات إدارة المنتجات.
client/src/components/products/ProductList.jsx
مكون قائمة المنتجات.
client/src/components/products/ProductForm.jsx
مكون نموذج المنتج.
client/src/components/products/ProductDetail.jsx
مكون تفاصيل المنتج.
client/src/components/products/ProductMapping.jsx
مكون ربط المنتجات بين المتاجر المختلفة.
client/src/components/inventory/
مكونات إدارة المخزون.
client/src/components/inventory/InventoryList.jsx
مكون قائمة المخزون.
client/src/components/inventory/InventoryForm.jsx
مكون نموذج المخزون.
client/src/components/inventory/StockAdjustment.jsx
مكون تعديل المخزون.
client/src/components/orders/
مكونات إدارة الطلبات.
client/src/components/orders/OrderList.jsx
مكون قائمة الطلبات.
client/src/components/orders/OrderDetail.jsx
مكون تفاصيل الطلب.
client/src/components/orders/FulfillmentForm.jsx
مكون نموذج إتمام الطلب.
client/src/components/sync/
مكونات المزامنة.
client/src/components/sync/SyncRuleList.jsx
مكون قائمة قواعد المزامنة.
client/src/components/sync/SyncRuleForm.jsx
مكون نموذج قاعدة المزامنة.
client/src/components/sync/SyncLogList.jsx
مكون قائمة سجلات المزامنة.
client/src/components/sync/SyncSettings.jsx
مكون إعدادات المزامنة.
client/src/pages/
صفحات التطبيق الرئيسية.RetryO