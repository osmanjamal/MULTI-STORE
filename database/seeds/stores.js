/**
 * Datos iniciales de tiendas para el sistema Multi-Store Sync
 * Este archivo contiene datos de muestra para poblar la colección de tiendas en la base de datos
 */

const mongoose = require('mongoose');
const Store = require('../../server/models/store');
const connectDB = require('../../server/config/database');

// Datos de tiendas de muestra
const storeData = [
  {
    name: 'متجر شوبيفاي للملابس',
    type: 'shopify',
    url: 'https://clothing-store-demo.myshopify.com',
    apiKey: 'demo_api_key_1',
    apiSecret: 'demo_api_secret_1',
    status: 'active',
    settings: {
      syncInventory: true,
      syncProducts: true,
      syncOrders: true,
      webhookEnabled: true
    },
    lastSync: new Date()
  },
  {
    name: 'متجر لازادا للإلكترونيات',
    type: 'lazada',
    url: 'https://www.lazada.com/electronics-store',
    apiKey: 'demo_api_key_2',
    apiSecret: 'demo_api_secret_2',
    status: 'active',
    settings: {
      syncInventory: true,
      syncProducts: true,
      syncOrders: false,
      webhookEnabled: false
    },
    lastSync: new Date()
  },
  {
    name: 'متجر شوبي للمنتجات المنزلية',
    type: 'shopee',
    url: 'https://shopee.com/home-products',
    apiKey: 'demo_api_key_3',
    apiSecret: 'demo_api_secret_3',
    status: 'active',
    settings: {
      syncInventory: true,
      syncProducts: true,
      syncOrders: true,
      webhookEnabled: true
    },
    lastSync: new Date()
  },
  {
    name: 'متجر ووكومرس للهدايا',
    type: 'woocommerce',
    url: 'https://gifts-store.com',
    apiKey: 'demo_api_key_4',
    apiSecret: 'demo_api_secret_4',
    status: 'inactive',
    settings: {
      syncInventory: false,
      syncProducts: false,
      syncOrders: false,
      webhookEnabled: false
    },
    lastSync: null
  }
];

// Función para sembrar los datos
const seedStores = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Eliminar tiendas existentes
    await Store.deleteMany({});
    console.log('✅ Tiendas anteriores eliminadas');
    
    // Insertar nuevas tiendas
    const stores = await Store.insertMany(storeData);
    console.log(`✅ ${stores.length} tiendas han sido creadas con éxito`);
    
    // Cerrar la conexión
    mongoose.connection.close();
    console.log('✅ Conexión a la base de datos cerrada');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar los datos de tiendas:', error);
    process.exit(1);
  }
};

// Ejecutar la función si este archivo es llamado directamente
if (require.main === module) {
  seedStores();
}

module.exports = seedStores;