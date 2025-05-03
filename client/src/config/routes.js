/**
 * تكوين مسارات التطبيق
 * يحدد هذا الملف جميع مسارات التطبيق وخصائصها
 */

const routes = [
    // مسارات المصادقة
    {
      path: '/login',
      exact: true,
      auth: false,
      title: 'تسجيل الدخول',
      layout: 'auth',
      component: 'Auth/Login'
    },
    {
      path: '/register',
      exact: true,
      auth: false,
      title: 'إنشاء حساب جديد',
      layout: 'auth',
      component: 'Auth/Register'
    },
    {
      path: '/forgot-password',
      exact: true,
      auth: false,
      title: 'استعادة كلمة المرور',
      layout: 'auth',
      component: 'Auth/ForgotPassword'
    },
    
    // الصفحة الرئيسية ولوحة القيادة
    {
      path: '/',
      exact: true,
      auth: true,
      title: 'لوحة القيادة',
      layout: 'dashboard',
      component: 'Dashboard',
      icon: 'dashboard'
    },
    
    // مسارات المتاجر
    {
      path: '/stores',
      exact: true,
      auth: true,
      title: 'المتاجر المتصلة',
      layout: 'dashboard',
      component: 'Stores/StoresPage',
      icon: 'store'
    },
    {
      path: '/stores/add',
      exact: true,
      auth: true,
      title: 'إضافة متجر جديد',
      layout: 'dashboard',
      component: 'Stores/AddStore',
      hideFromMenu: true
    },
    {
      path: '/stores/edit/:id',
      exact: true,
      auth: true,
      title: 'تعديل المتجر',
      layout: 'dashboard',
      component: 'Stores/EditStore',
      hideFromMenu: true
    },
    
    // مسارات المنتجات
    {
      path: '/products',
      exact: true,
      auth: true,
      title: 'المنتجات',
      layout: 'dashboard',
      component: 'Products/ProductsPage',
      icon: 'products'
    },
    {
      path: '/products/add',
      exact: true,
      auth: true,
      title: 'إضافة منتج جديد',
      layout: 'dashboard',
      component: 'Products/AddProduct',
      hideFromMenu: true
    },
    {
      path: '/products/edit/:id',
      exact: true,
      auth: true,
      title: 'تعديل المنتج',
      layout: 'dashboard',
      component: 'Products/EditProduct',
      hideFromMenu: true
    },
    {
      path: '/products/mapping',
      exact: true,
      auth: true,
      title: 'ربط المنتجات',
      layout: 'dashboard',
      component: 'Products/ProductMapping',
      icon: 'mapping'
    },
    
    // مسارات المخزون
    {
      path: '/inventory',
      exact: true,
      auth: true,
      title: 'المخزون',
      layout: 'dashboard',
      component: 'Inventory/InventoryPage',
      icon: 'inventory'
    },
    {
      path: '/inventory/adjust/:id',
      exact: true,
      auth: true,
      title: 'تعديل المخزون',
      layout: 'dashboard',
      component: 'Inventory/AdjustStock',
      hideFromMenu: true
    },
    
    // مسارات الطلبات
    {
      path: '/orders',
      exact: true,
      auth: true,
      title: 'الطلبات',
      layout: 'dashboard',
      component: 'Orders/OrdersPage',
      icon: 'orders'
    },
    {
      path: '/orders/:id',
      exact: true,
      auth: true,
      title: 'تفاصيل الطلب',
      layout: 'dashboard',
      component: 'Orders/OrderDetail',
      hideFromMenu: true
    },
    
    // مسارات المزامنة
    {
      path: '/sync/rules',
      exact: true,
      auth: true,
      title: 'قواعد المزامنة',
      layout: 'dashboard',
      component: 'Sync/SyncRules',
      icon: 'sync'
    },
    {
      path: '/sync/rules/add',
      exact: true,
      auth: true,
      title: 'إضافة قاعدة مزامنة',
      layout: 'dashboard',
      component: 'Sync/SyncRules',
      action: 'add',
      hideFromMenu: true
    },
    {
      path: '/sync/rules/edit/:id',
      exact: true,
      auth: true,
      title: 'تعديل قاعدة المزامنة',
      layout: 'dashboard',
      component: 'Sync/SyncRules',
      action: 'edit',
      hideFromMenu: true
    },
    {
      path: '/sync/logs',
      exact: true,
      auth: true,
      title: 'سجلات المزامنة',
      layout: 'dashboard',
      component: 'Sync/SyncLogs',
      icon: 'logs'
    },
    {
      path: '/sync/settings',
      exact: true,
      auth: true,
      title: 'إعدادات المزامنة',
      layout: 'dashboard',
      component: 'Sync/SyncSettings',
      icon: 'settings'
    },
    
    // مسارات الإعدادات
    {
      path: '/settings/profile',
      exact: true,
      auth: true,
      title: 'الملف الشخصي',
      layout: 'dashboard',
      component: 'Settings/ProfileSettings',
      icon: 'profile',
      category: 'settings'
    },
    {
      path: '/settings/account',
      exact: true,
      auth: true,
      title: 'إعدادات الحساب',
      layout: 'dashboard',
      component: 'Settings/AccountSettings',
      icon: 'account',
      category: 'settings'
    },
    {
      path: '/settings/api',
      exact: true,
      auth: true,
      title: 'إعدادات API',
      layout: 'dashboard',
      component: 'Settings/ApiSettings',
      icon: 'api',
      category: 'settings'
    },
    
    // مسار الخطأ 404
    {
      path: '*',
      layout: 'error',
      component: 'Error/NotFound'
    }
  ];
  
  // تصنيف المسارات حسب الفئة
  export const getMenuCategories = () => {
    const categories = routes.reduce((acc, route) => {
      if (route.hideFromMenu || !route.icon) return acc;
      
      const category = route.category || 'main';
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push(route);
      return acc;
    }, {});
    
    return categories;
  };
  
  export default routes;