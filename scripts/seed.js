/**
 * سكريبت لزراعة بيانات عينة في قاعدة البيانات
 * يقوم هذا السكريبت بتشغيل جميع ملفات زراعة البيانات بالترتيب الصحيح
 */

const mongoose = require('mongoose');
const connectDB = require('../server/config/database');
const seedUsers = require('../database/seeds/users');
const seedStores = require('../database/seeds/stores');
const seedProducts = require('../database/seeds/products');

// الدالة الرئيسية لتنفيذ جميع ملفات زراعة البيانات
const seedAll = async () => {
  try {
    // الاتصال بقاعدة البيانات
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await connectDB();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    // التأكيد مع المستخدم
    console.log('⚠️ تحذير: سيؤدي هذا الإجراء إلى حذف جميع البيانات الموجودة واستبدالها ببيانات عينة.');
    console.log('⚠️ لا تقم بتنفيذ هذا في بيئة إنتاج تحتوي على بيانات حقيقية.');
    
    // متابعة عملية زراعة البيانات
    console.log('\n🌱 بدء عملية زراعة البيانات...');
    
    // زراعة المستخدمين
    console.log('\n📊 زراعة بيانات المستخدمين...');
    await seedUsers();
    
    // زراعة المتاجر
    console.log('\n📊 زراعة بيانات المتاجر...');
    await seedStores();
    
    // زراعة المنتجات
    console.log('\n📊 زراعة بيانات المنتجات...');
    await seedProducts();
    
    // رسالة الانتهاء
    console.log('\n🎉 تم زراعة بيانات العينة بنجاح!');
    console.log('\nيمكنك تسجيل الدخول باستخدام بيانات الاعتماد التالية:');
    console.log('  المسؤول: admin@example.com / admin123');
    console.log('  المستخدم: user@example.com / user123');
    
    // إغلاق الاتصال
    await mongoose.connection.close();
    console.log('✅ تم إغلاق الاتصال بقاعدة البيانات');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ خطأ في زراعة البيانات:', error);
    
    // إغلاق الاتصال
    try {
      await mongoose.connection.close();
      console.log('✅ تم إغلاق الاتصال بقاعدة البيانات');
    } catch (closeError) {
      console.error('❌ خطأ في إغلاق الاتصال بقاعدة البيانات:', closeError);
    }
    
    process.exit(1);
  }
};

// تنفيذ الدالة الرئيسية
seedAll();