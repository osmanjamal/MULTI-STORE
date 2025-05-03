import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';

const Sidebar = ({ open, setOpen }) => {
  const { stores } = useStore();

  // قائمة العناصر الرئيسية
  const mainNavItems = [
    {
      name: 'لوحة القيادة',
      href: '/dashboard',
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      )
    },
    {
      name: 'المتاجر',
      href: '/stores',
      icon: (
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      )
    },
    {
      name: 'المنتجات',
      href: '/products',
      icon: (
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      )
    },
    {
      name: 'المخزون',
      href: '/inventory',
      icon: (
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
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      )
    },
    {
      name: 'الطلبات',
      href: '/orders',
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      )
    }
  ];

  // قائمة عناصر المزامنة
  const syncNavItems = [
    {
      name: 'قواعد المزامنة',
      href: '/sync/rules',
      icon: (
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
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      )
    },
    {
      name: 'سجلات المزامنة',
      href: '/sync/logs',
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      )
    },
    {
      name: 'إعدادات المزامنة',
      href: '/sync/settings',
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )
    }
  ];

  // دالة مساعدة لرمز نوع المتجر
  const getStoreIcon = (type) => {
    switch (type) {
      case 'shopify':
        return (
          <svg
            className="h-5 w-5 text-teal-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13.98 20.99c0-.08.01-.16 0-.24-.04-.26-.2-.43-.46-.45-.12 0-.24-.01-.35 0-.11 0-.2.08-.18.18.03.21.09.41.17.6.06.14.15.26.29.33.11.06.23.02.34-.03.12-.05.16-.17.19-.29.01-.01 0-.06 0-.1zm-2.19-.44v.07c0 .22.05.42.19.6.08.11.19.17.33.16.02 0 .04 0 .06-.01.13-.04.18-.12.14-.26-.04-.14-.14-.21-.27-.26-.27-.09-.49.01-.45-.3zm4.69-5.46c0 .08-.05.11-.12.11-.42.04-.73.29-.79.7-.01.07-.04.1-.11.1-.95 0-1.89 0-2.84 0h-.11c0-.03-.01-.05-.01-.07-.11-.45-.22-.89-.33-1.34-.04-.16-.08-.32-.13-.5.2-.06.39-.11.57-.19.72-.29 1.31-.76 1.78-1.36.27-.35.5-.73.68-1.14.11-.26.19-.52.2-.81.01-.36-.04-.71-.15-1.05-.23-.65-.65-1.18-1.16-1.66-.32-.3-.65-.58-1-.85-.82-.64-1.64-1.28-2.46-1.92-.16-.13-.33-.24-.52-.32-.08-.03-.12-.08-.13-.16-.05-.4-.12-.8-.18-1.2-.04-.25-.07-.5-.11-.77h.17c.14 0 .14 0 .17-.14.06-.26.11-.53.19-.78.13-.44.53-.67.98-.62.3.03.58.12.85.25.56.25 1.02.64 1.44 1.08.63.66 1.16 1.39 1.65 2.15.56.89 1.07 1.81 1.58 2.73.74 1.34 1.47 2.68 2.21 4.02.11.2.2.42.26.64.07.26.04.53-.05.78-.16.5-.42.95-.73 1.38-.07.09-.08.19-.08.3.01.54.01 1.08.01 1.63zm-9.82-9.74c-.15.17-.27.37-.38.57-.34.63-.66 1.28-.99 1.92-.45.86-.9 1.73-1.34 2.59-.11.22-.23.44-.31.67-.12.31-.06.62.08.91.2.41.49.74.85.99.08.06.09.12.07.21-.04.19-.08.37-.11.56-.01.06-.03.08-.09.08-.54-.02-1.05-.16-1.52-.43-.4-.23-.74-.53-1.02-.9-.36-.48-.61-1.02-.79-1.6-.02-.08-.02-.17-.04-.26h.12c.1 0 .2 0 .3-.01.27-.02.48-.23.48-.5.01-.93 0-1.86 0-2.78 0-.14 0-.28.02-.42.02-.17.14-.3.31-.35.16-.05.32-.07.48-.11 1.03-.24 2.05-.49 3.08-.73.04-.01.08-.03.12-.05.22.09.45.2.68.29zm6.84 12.69c.35-.57.51-1.19.49-1.86-.32 0-.64-.01-.95 0-.26.01-.46.23-.51.48-.05.28-.08.57-.12.85-.03.21-.05.43-.08.65.23.06.46.12.69.12.17 0 .33-.09.48-.24zm-1.09 1.78c-.06-.34-.06-.34.27-.42.01 0 .02-.01.04-.01.07-.02.08-.06.05-.11-.19-.31-.32-.64-.37-1-.04-.29-.07-.59-.11-.88-.02-.15-.05-.3-.08-.45 0-.01-.03-.04-.04-.04-.54-.01-1.07 0-1.61 0 0 .02-.01.03-.01.04-.08.36-.17.72-.25 1.08-.14.63-.29 1.26-.44 1.88-.06.25-.13.5-.19.75 0 .01.01.03.02.04.06 0 .11.02.17.01.15-.02.29-.07.42-.14.35-.2.72-.31 1.13-.31.34 0 .66.07.95.24.05.02.08.03.09.01.13-.23.01-.47-.04-.69zm-5.56-2.77c.03-.13.07-.25.1-.38.08-.31.1-.63-.03-.93-.16-.37-.45-.63-.79-.84-.35-.22-.35-.22-.37-.63 0-.08.01-.17.01-.25.01-.12-.06-.17-.17-.11-.07.04-.13.09-.19.14-.28.24-.48.53-.6.88-.16.46-.08.9.15 1.31.11.21.26.39.42.55.2.21.44.35.7.44.2.07.36-.05.49-.21.06-.06.1-.15.13-.23.05-.12.1-.24.15-.36.02-.06.02-.11 0-.16-.06-.16-.05-.23.1-.28.14-.05.19.05.2.15 0 .29 0 .58-.01.87 0 .04-.02.07-.04.09-.05.07-.11.13-.17.2-.01.02-.03.03-.07.06.07.04.14.07.2.11.42.25.84.42 1.32.45.3.02.59-.03.86-.17.04-.02.07-.05.12-.08-.03-.04-.04-.06-.06-.08-.2-.19-.36-.41-.46-.67-.1-.28-.1-.57.02-.84.12-.26.3-.45.54-.59.04-.02.06-.05.06-.09 0-.16 0-.32 0-.48 0-.06-.03-.08-.08-.06-.02.01-.05.01-.07.02-.18.09-.37.16-.56.22-.16.05-.26.14-.31.3-.07.26-.14.51-.21.77-.09.29-.17.58-.26.87-.01.04-.05.04-.09.04-.45-.01-.85-.15-1.23-.38-.03-.02-.07-.02-.13-.04zm.87-11.96c-.03.04-.05.07-.07.1.01.01.01.02.02.03.02-.01.06-.01.07-.02.24-.21.48-.4.77-.54.39-.19.8-.29 1.23-.31.08 0 .13-.03.17-.1.14-.25.29-.49.43-.74.25-.44.5-.88.75-1.32.01-.03.02-.06.04-.11-.11.03-.19.06-.28.09-1.04.35-2.08.69-3.12 1.04-.06.02-.08.05-.07.11.03.33.04.66.06.99v.78z" />
          </svg>
        );
      case 'woocommerce':
        return (
          <svg
            className="h-5 w-5 text-purple-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.48 4.8a.57.57 0 01.4.16.62.62 0 01.17.4c0 .16-.07.3-.17.4a.57.57 0 01-.4.16.57.57 0 01-.4-.16.62.62 0 01-.17-.4c0-.16.07-.3.17-.4a.57.57 0 01.4-.16zm6.44 4.8c-.42 1.13-1.23 1.69-2.44 1.69-1.12-.01-1.79-.56-1.98-1.68-.12.56-.38 1-.78 1.32-.4.32-.9.48-1.54.48-.63 0-1.13-.17-1.5-.5-.38-.33-.6-.77-.66-1.33H7.5c-.01.25.07.45.23.6s.38.22.67.22c.31 0 .55-.08.74-.26.18-.17.28-.38.28-.63 0-.3-.08-.5-.24-.64-.16-.12-.48-.24-.96-.34-.75-.16-1.29-.48-1.63-.96a2.54 2.54 0 01-.5-1.56c0-.67.21-1.22.64-1.67.42-.46 1-.7 1.7-.72.74 0 1.32.21 1.73.64s.63.97.65 1.64h-.57c-.03-.45-.18-.81-.44-1.08a1.36 1.36 0 00-1.02-.39c-.43 0-.76.12-.99.37-.23.24-.35.56-.35.94 0 .35.12.62.34.8.22.18.57.32 1.04.42.74.16 1.28.46 1.63.92.34.44.51 1 .51 1.66 0 .31-.04.59-.1.84l.01.01a.7.7 0 00-.05.16h.04l.21-.01c.25.01.47-.05.68-.19.2-.15.33-.37.37-.67.02-.1.01-.33-.01-.7a20.8 20.8 0 01-.05-.97c0-.44.04-.84.12-1.2.08-.36.22-.67.42-.94.2-.27.48-.47.82-.62a2.9 2.9 0 011.27-.22c.63 0 1.16.17 1.57.5.41.34.7.78.87 1.33H17c-.15-.33-.34-.57-.57-.74-.22-.17-.51-.25-.87-.25-.47 0-.84.12-1.12.37-.28.24-.4.59-.4 1.03 0 .11 0 .22.02.34a11 11 0 01.06.86c.01.3.01.58 0 .84-.02.26-.03.47-.02.64z" />
          </svg>
        );
      case 'lazada':
        return (
          <svg
            className="h-5 w-5 text-orange-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7v-2z" />
          </svg>
        );
      case 'shopee':
        return (
          <svg
            className="h-5 w-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V9z" />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5 text-gray-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6h2c0-2.21 1.79-4 4-4s4 1.79 4 4h2c0-3.31-2.69-6-6-6z" />
          </svg>
        );
    }
  };

  return (
    <>
      {/* خلفية معتمة لوضع المحمول */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* القائمة الجانبية */}
      <aside
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 md:relative md:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* رأس القائمة الجانبية */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">القائمة الرئيسية</h2>
          <button
            className="md:hidden rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => setOpen(false)}
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* محتوى القائمة الجانبية */}
        <div className="overflow-y-auto h-full pb-20">
          {/* العناصر الرئيسية */}
          <nav className="mt-4 px-2 space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <span className="ml-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* عنوان قسم المزامنة */}
          <div className="mt-6 px-3">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              المزامنة
            </h3>
          </div>

          {/* عناصر المزامنة */}
          <nav className="mt-2 px-2 space-y-1">
            {syncNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <span className="ml-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* عنوان قسم المتاجر */}
          <div className="mt-6 px-3">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              المتاجر المتصلة
            </h3>
          </div>

          {/* قائمة المتاجر */}
          <nav className="mt-2 px-2 space-y-1">
            {stores && stores.length > 0 ? (
              stores.map((store) => (
                <NavLink
                  key={store.id}
                  to={`/stores/${store.id}`}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="ml-3">{getStoreIcon(store.type)}</span>
                  <span className="truncate">{store.name}</span>
                  {store.is_main && (
                    <span className="mr-auto inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      رئيسي
                    </span>
                  )}
                </NavLink>
              ))
            ) : (
              <div className="px-2 py-2 text-sm text-gray-500">
                لا توجد متاجر متصلة
              </div>
            )}

            <NavLink
              to="/stores/new"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50"
            >
              <svg
                className="ml-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              إضافة متجر جديد
            </NavLink>
          </nav>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

export default Sidebar;