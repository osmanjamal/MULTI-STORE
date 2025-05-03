#!/bin/bash

# سكريبت الإعداد الأولي لمشروع مزامنة المتاجر المتعددة
# يقوم هذا السكريبت بتثبيت التبعيات وإعداد البيئة الأولية

echo "🚀 بدء إعداد مشروع مزامنة المتاجر المتعددة..."

# التحقق من تثبيت Node.js
if ! command -v node &> /dev/null; then
    echo "❌ لم يتم تثبيت Node.js. الرجاء تثبيت Node.js (الإصدار 14 أو أعلى) للمتابعة."
    exit 1
fi

# التحقق من إصدار Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ مطلوب Node.js v14 أو أعلى. الإصدار الحالي: $(node -v)"
    exit 1
fi

echo "✅ تم الكشف عن Node.js $(node -v)"
echo "✅ تم الكشف عن NPM $(npm -v)"

# إنشاء ملفات .env إذا لم تكن موجودة
if [ ! -f "./server/.env" ]; then
    echo "📝 إنشاء ملف .env للخادم..."
    cp ./server/.env.example ./server/.env || echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/multi-store-sync
JWT_SECRET=مفتاح_سري_آمن_للتشفير
JWT_EXPIRE=7d

# مفاتيح API لشوبيفاي
SHOPIFY_API_KEY=مفتاح_API_شوبيفاي
SHOPIFY_API_SECRET=السر_API_شوبيفاي

# مفاتيح API للازادا
LAZADA_API_KEY=مفتاح_API_لازادا
LAZADA_API_SECRET=السر_API_لازادا

# مفاتيح API لشوبي
SHOPEE_API_KEY=مفتاح_API_شوبي
SHOPEE_API_SECRET=السر_API_شوبي

# مفاتيح API لووكومرس
WOOCOMMERCE_API_KEY=مفتاح_API_ووكومرس
WOOCOMMERCE_API_SECRET=السر_API_ووكومرس" > ./server/.env
    
    echo "✅ تم إنشاء ملف .env للخادم"
    echo "⚠️ الرجاء تعديل ملف ./server/.env بمفاتيح API والإعدادات الخاصة بك"
fi

# تثبيت تبعيات الخادم
echo "📦 تثبيت تبعيات الخادم..."
cd ./server && npm install
if [ $? -ne 0 ]; then
    echo "❌ خطأ في تثبيت تبعيات الخادم"
    exit 1
fi
echo "✅ تم تثبيت تبعيات الخادم بنجاح"

# تثبيت تبعيات العميل
echo "📦 تثبيت تبعيات العميل..."
cd ../client && npm install
if [ $? -ne 0 ]; then
    echo "❌ خطأ في تثبيت تبعيات العميل"
    exit 1
fi
echo "✅ تم تثبيت تبعيات العميل بنجاح"

# العودة إلى المجلد الرئيسي
cd ..

# سؤال المستخدم ما إذا كان يرغب في زراعة بيانات عينة
read -p "هل ترغب في زراعة بيانات عينة في قاعدة البيانات؟ (ن/ي): " SEED_DB
if [[ $SEED_DB =~ ^[يYy]$ ]]; then
    echo "🌱 زراعة بيانات عينة في قاعدة البيانات..."
    node ./database/seeds/users.js
    node ./database/seeds/stores.js
    node ./database/seeds/products.js
    echo "✅ تم زراعة بيانات العينة بنجاح"
fi

echo "
🎉 تم الإعداد بنجاح!

لبدء الخادم في وضع التطوير:
  cd server && npm run dev

لبدء العميل في وضع التطوير:
  cd client && npm start

سيكون التطبيق متاحًا على:
  العميل: http://localhost:3000
  واجهة API: http://localhost:5000

يمكنك تسجيل الدخول باستخدام بيانات الاعتماد التالية (إذا قمت بزراعة بيانات العينة):
  المسؤول: admin@example.com / admin123
  المستخدم: user@example.com / user123

شكرًا لاستخدام نظام مزامنة المتاجر المتعددة!
"