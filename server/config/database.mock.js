const mockDb = {
    users: [],
    stores: [],
    products: []
  };
  
  const pool = {
    connect: async () => {
      console.log('✓ تم الاتصال بقاعدة البيانات التجريبية');
      return {
        release: () => {}
      };
    },
    query: async (text, params) => {
      console.log('استعلام تجريبي:', text);
      return { rows: [] };
    }
  };
  
  const setupDb = async () => {
    console.log('✓ تم إعداد قاعدة البيانات التجريبية');
  };
  
  module.exports = { pool, setupDb };