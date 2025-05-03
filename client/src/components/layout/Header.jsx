import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* الشعار */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <img
                src="/assets/images/logo.png"
                alt="شعار مزامنة المتاجر المتعددة"
                className="h-8 w-auto ml-2"
              />
              <span className="font-bold text-lg text-gray-900">مزامنة المتاجر</span>
            </Link>
          </div>

          {/* عناصر القائمة الرئيسية للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse ml-4">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              لوحة القيادة
            </Link>
            <Link to="/stores" className="text-gray-700 hover:text-blue-600">
              المتاجر
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600">
              المنتجات
            </Link>
            <Link to="/inventory" className="text-gray-700 hover:text-blue-600">
              المخزون
            </Link>
            <Link to="/orders" className="text-gray-700 hover:text-blue-600">
              الطلبات
            </Link>
            <Link to="/sync/rules" className="text-gray-700 hover:text-blue-600">
              المزامنة
            </Link>
          </nav>

          {/* إشعارات وقائمة المستخدم */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {/* زر الإشعارات */}
            <div className="relative">
              <button
                type="button"
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">عرض الإشعارات</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* قائمة الإشعارات */}
              {notificationsOpen && (
                <div className="origin-top-left absolute left-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">الإشعارات</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">اكتملت مزامنة المنتجات</p>
                      <p className="text-xs text-gray-500">منذ 5 دقائق</p>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">تم إضافة 3 منتجات جديدة</p>
                      <p className="text-xs text-gray-500">منذ ساعة</p>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <p className="text-sm font-medium text-blue-600">عرض كل الإشعارات</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* قائمة الملف الشخصي */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center max-w-xs rounded-full text-sm focus:outline-none"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <span className="sr-only">فتح قائمة المستخدم</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  {user?.name?.charAt(0) || 'م'}
                </div>
                <span className="mr-2 text-sm font-medium text-gray-700">
                  {user?.name || 'مستخدم'}
                </span>
                <svg
                  className="mr-1 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              
              {/* قائمة المستخدم */}
              {profileMenuOpen && (
                <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <Link
                    to="/settings/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    الملف الشخصي
                  </Link>
                  <Link
                    to="/settings/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    إعدادات الحساب
                  </Link>
                  <Link
                    to="/settings/api"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    إعدادات API
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;