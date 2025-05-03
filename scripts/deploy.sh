#!/bin/bash

# سكريبت النشر لمشروع مزامنة المتاجر المتعددة
# يقوم هذا السكريبت ببناء التطبيق وتجهيزه للإنتاج

echo "🚀 بدء نشر مشروع مزامنة المتاجر المتعددة..."

# التحقق من أننا في الفرع الرئيسي
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    read -p "⚠️ أنت لست في الفرع الرئيسي (main). هل ترغب في المتابعة بالنشر؟ (ن/ي): " CONTINUE
    if [[ ! $CONTINUE =~ ^[يYy]$ ]]; then
        echo "❌ تم إلغاء النشر"
        exit 1
    fi
fi

# التحقق من التغييرات غير المؤكدة
if [ -n "$(git status --porcelain)" ]; then
    read -p "⚠️ هناك تغييرات غير مؤكدة في المستودع. هل ترغب في المتابعة بالنشر؟ (ن/ي): " CONTINUE
    if [[ ! $CONTINUE =~ ^[يYy]$ ]]; then
        echo "❌ تم إلغاء النشر"
        exit 1
    fi
fi

# بناء العميل
echo "🏗️ بناء تطبيق العميل..."
cd ./client && npm run build
if [ $? -ne 0 ]; then
    echo "❌ خطأ في بناء تطبيق العميل"
    exit 1
fi
echo "✅ تم بناء تطبيق العميل بنجاح"

# العودة إلى المجلد الرئيسي
cd ..

# التحقق من وجود مجلد النشر
DEPLOY_DIR="./deploy"
if [ ! -d "$DEPLOY_DIR" ]; then
    mkdir -p "$DEPLOY_DIR"
    echo "✅ تم إنشاء مجلد النشر في $DEPLOY_DIR"
else
    # تنظيف مجلد النشر
    rm -rf "$DEPLOY_DIR"/*
    echo "✅ تم تنظيف مجلد النشر"
fi

# نسخ ملفات الخادم
echo "📋 نسخ ملفات الخادم..."
cp -r ./server/* "$DEPLOY_DIR/"
if [ $? -ne 0 ]; then
    echo "❌ خطأ في نسخ ملفات الخادم"
    exit 1
fi
echo "✅ تم نسخ ملفات الخادم بنجاح"

# نسخ ملفات العميل المبنية
echo "📋 نسخ ملفات العميل المبنية..."
mkdir -p "$DEPLOY_DIR/public"
cp -r ./client/build/* "$DEPLOY_DIR/public/"
if [ $? -ne 0 ]; then
    echo "❌ خطأ في نسخ ملفات العميل المبنية"
    exit 1
fi
echo "✅ تم نسخ ملفات العميل المبنية بنجاح"

# إنشاء ملف .env للإنتاج إذا لم يكن موجودًا
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo "📝 إنشاء ملف .env للإنتاج..."
    echo "NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multi-store-sync
JWT_SECRET=قم_بتغيير_هذا_إلى_سلسلة_عشوائية_آمنة
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
WOOCOMMERCE_API_SECRET=السر_API_ووكومرس" > "$DEPLOY_DIR/.env"
    
    echo "✅ تم إنشاء ملف .env للإنتاج"
    echo "⚠️ الرجاء تعديل ملف $DEPLOY_DIR/.env بمفاتيح API وإعدادات الإنتاج الخاصة بك"
fi

# إنشاء ملف README لمجلد النشر
echo "📝 إنشاء ملف README لمجلد النشر..."
echo "# نشر نظام مزامنة المتاجر المتعددة

يحتوي هذا المجلد على الملفات الجاهزة لنشر مشروع مزامنة المتاجر المتعددة في بيئة الإنتاج.

## هيكل الملفات

- \`./public\`: الملفات الثابتة لتطبيق العميل
- \`./\*\`: ملفات الخادم

## خطوات النشر

1. تثبيت التبعيات: \`npm install --production\`
2. تكوين ملف \`.env\` بمتغيرات بيئة الإنتاج
3. بدء الخادم: \`npm start\`

## توصيات

- استخدم مدير عمليات مثل PM2 للحفاظ على تشغيل التطبيق
- قم بتكوين خادم ويب مثل Nginx كبروكسي عكسي
- تأكد من تثبيت MongoDB وتشغيله

## أوامر مفيدة لـ PM2

- بدء التطبيق: \`pm2 start server.js --name multi-store-sync\`
- عرض السجلات: \`pm2 logs multi-store-sync\`
- إعادة تشغيل التطبيق: \`pm2 restart multi-store-sync\`
- إيقاف التطبيق: \`pm2 stop multi-store-sync\`

لمزيد من المعلومات، راجع الوثائق الرسمية.
" > "$DEPLOY_DIR/README.md"
echo "✅ تم إنشاء ملف README لمجلد النشر"

echo "
🎉 تم تجهيز النشر بنجاح!

الملفات المخصصة للنشر موجودة في: $DEPLOY_DIR

لإكمال النشر على خادم الإنتاج:

1. انسخ محتويات المجلد $DEPLOY_DIR إلى خادم الإنتاج الخاص بك
2. قم بتكوين ملف .env ببيانات اعتماد الإنتاج الخاصة بك
3. قم بتثبيت التبعيات باستخدام \`npm install --production\`
4. ابدأ الخادم باستخدام \`npm start\` أو يفضل استخدام PM2:
   \`pm2 start server.js --name multi-store-sync\`

شكرًا لاستخدام نظام مزامنة المتاجر المتعددة!
"