module.exports = {
    partnerId: process.env.SHOPEE_PARTNER_ID,
    partnerKey: process.env.SHOPEE_PARTNER_KEY,
    // نقاط نهاية API
    endpoints: {
      base: 'https://partner.shopeemobile.com/api/v2',
      products: '/product/get_item_list',
      product_detail: '/product/get_item_base_info',
      create_product: '/product/add_item',
      update_product: '/product/update_item',
      inventory: '/product/update_stock',
      orders: '/order/get_order_list'
    },
    // أنواع الويب هوك
    webhookTopics: {
      PRODUCTS: 'PRODUCT_UPDATE',
      INVENTORY: 'SHOP_UPDATE',
      ORDERS: 'ORDER_STATUS_UPDATE'
    },
    // تحويل البيانات
    transformations: {
      // تحويل منتج شوبي إلى النموذج الداخلي
      productToInternal: (shopeeProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      },
      // تحويل من النموذج الداخلي إلى شوبي
      internalToProduct: (internalProduct) => {
        // تنفيذ التحويل
        return {
          // التحويل
        };
      }
    }
  };