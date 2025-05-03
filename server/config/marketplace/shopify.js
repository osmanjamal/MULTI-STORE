module.exports = {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES,
    // نقاط نهاية API
    endpoints: {
      products: '/admin/api/2023-04/products.json',
      product: '/admin/api/2023-04/products/{id}.json',
      inventory_levels: '/admin/api/2023-04/inventory_levels.json',
      orders: '/admin/api/2023-04/orders.json',
      webhooks: '/admin/api/2023-04/webhooks.json'
    },
    // أنواع الويب هوك
    webhookTopics: {
      PRODUCTS: 'products/create,products/update,products/delete',
      INVENTORY: 'inventory_levels/update',
      ORDERS: 'orders/create,orders/updated,orders/fulfilled'
    },
    // تحويل البيانات
    transformations: {
      // تحويل منتج شوبيفاي إلى النموذج الداخلي
      productToInternal: (shopifyProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      },
      // تحويل من النموذج الداخلي إلى شوبيفاي
      internalToProduct: (internalProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      }
    }
  };