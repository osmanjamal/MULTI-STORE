module.exports = {
    appKey: process.env.LAZADA_APP_KEY,
    appSecret: process.env.LAZADA_APP_SECRET,
    // نقاط نهاية API
    endpoints: {
      base: 'https://api.lazada.com/rest',
      products: '/products/get',
      create_product: '/product/create',
      update_product: '/product/update',
      inventory: '/product/stock/sellable/update',
      orders: '/orders/get'
    },
    // أنواع الويب هوك
    webhookTopics: {
      PRODUCTS: 'product_created,product_updated,product_deleted',
      INVENTORY: 'stock_updated',
      ORDERS: 'order_created,order_updated,order_canceled'
    },
    // تحويل البيانات
    transformations: {
      // تحويل منتج لازادا إلى النموذج الداخلي
      productToInternal: (lazadaProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      },
      // تحويل من النموذج الداخلي إلى لازادا
      internalToProduct: (internalProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      }
    }
  };