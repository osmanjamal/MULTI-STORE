module.exports = {
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    // نقاط نهاية API
    endpoints: {
      products: '/wp-json/wc/v3/products',
      product: '/wp-json/wc/v3/products/{id}',
      variations: '/wp-json/wc/v3/products/{id}/variations',
      orders: '/wp-json/wc/v3/orders'
    },
    // أنواع الويب هوك
    webhookTopics: {
      PRODUCTS: 'product.created,product.updated,product.deleted',
      INVENTORY: 'product.updated',
      ORDERS: 'order.created,order.updated'
    },
    // تحويل البيانات
    transformations: {
      // تحويل منتج ووكومرس إلى النموذج الداخلي
      productToInternal: (wooProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      },
      // تحويل من النموذج الداخلي إلى ووكومرس
      internalToProduct: (internalProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      }
    }
  };