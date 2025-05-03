/**
 * Datos iniciales de productos para el sistema Multi-Store Sync
 * Este archivo contiene datos de muestra para poblar la colección de productos en la base de datos
 */

const mongoose = require('mongoose');
const Product = require('../../server/models/product');
const Store = require('../../server/models/store');
const connectDB = require('../../server/config/database');

// Función para sembrar los datos
const seedProducts = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Obtener tiendas existentes para referenciarlas
    const stores = await Store.find({});
    
    if (stores.length === 0) {
      console.log('❌ No hay tiendas disponibles. Por favor, ejecute primero el sembrado de tiendas.');
      process.exit(1);
    }
    
    // Eliminar productos existentes
    await Product.deleteMany({});
    console.log('✅ Productos anteriores eliminados');
    
    // Crear datos de productos de muestra
    const productsData = [
      {
        name: 'قميص قطني كلاسيكي',
        description: 'قميص قطني بتصميم كلاسيكي مناسب للمناسبات الرسمية وغير الرسمية',
        sku: 'SHIRT-001',
        barcode: '1234567890123',
        storeId: stores[0]._id,
        store: stores[0]._id,
        externalId: 'ext_123456',
        category: 'ملابس',
        images: [
          'https://example.com/images/shirts/classic-cotton-1.jpg',
          'https://example.com/images/shirts/classic-cotton-2.jpg'
        ],
        price: 199.99,
        compareAtPrice: 249.99,
        cost: 100,
        weight: 0.3,
        weightUnit: 'kg',
        vendor: 'العلامة التجارية الأولى',
        status: 'active',
        variants: [
          {
            name: 'أبيض - S',
            sku: 'SHIRT-001-WHITE-S',
            barcode: '1234567890124',
            price: 199.99,
            inventory: 50,
            options: {
              color: 'أبيض',
              size: 'S'
            }
          },
          {
            name: 'أبيض - M',
            sku: 'SHIRT-001-WHITE-M',
            barcode: '1234567890125',
            price: 199.99,
            inventory: 40,
            options: {
              color: 'أبيض',
              size: 'M'
            }
          },
          {
            name: 'أسود - S',
            sku: 'SHIRT-001-BLACK-S',
            barcode: '1234567890126',
            price: 199.99,
            inventory: 45,
            options: {
              color: 'أسود',
              size: 'S'
            }
          }
        ],
        attributes: {
          material: 'قطن',
          style: 'كلاسيكي',
          season: 'متعدد المواسم'
        },
        tags: ['قميص', 'ملابس رجالية', 'كلاسيكي', 'قطن']
      },
      {
        name: 'هاتف ذكي فائق السرعة',
        description: 'هاتف ذكي بأحدث التقنيات ومعالج سريع وكاميرا فائقة الجودة',
        sku: 'PHONE-001',
        barcode: '9876543210123',
        storeId: stores[1]._id,
        store: stores[1]._id,
        externalId: 'ext_789012',
        category: 'إلكترونيات',
        images: [
          'https://example.com/images/phones/smartphone-1.jpg',
          'https://example.com/images/phones/smartphone-2.jpg'
        ],
        price: 2999.99,
        compareAtPrice: 3499.99,
        cost: 2000,
        weight: 0.2,
        weightUnit: 'kg',
        vendor: 'تك برو',
        status: 'active',
        variants: [
          {
            name: 'أسود - 128GB',
            sku: 'PHONE-001-BLACK-128',
            barcode: '9876543210124',
            price: 2999.99,
            inventory: 25,
            options: {
              color: 'أسود',
              storage: '128GB'
            }
          },
          {
            name: 'أسود - 256GB',
            sku: 'PHONE-001-BLACK-256',
            barcode: '9876543210125',
            price: 3299.99,
            inventory: 15,
            options: {
              color: 'أسود',
              storage: '256GB'
            }
          },
          {
            name: 'أبيض - 128GB',
            sku: 'PHONE-001-WHITE-128',
            barcode: '9876543210126',
            price: 2999.99,
            inventory: 20,
            options: {
              color: 'أبيض',
              storage: '128GB'
            }
          }
        ],
        attributes: {
          displaySize: '6.5 بوصة',
          camera: '48 ميجابكسل',
          battery: '4500 mAh'
        },
        tags: ['هاتف ذكي', 'إلكترونيات', 'جوال']
      },
      {
        name: 'طقم أواني طبخ من الستانلس ستيل',
        description: 'مجموعة أواني طبخ من الستانلس ستيل عالي الجودة، مناسبة لجميع أنواع المواقد',
        sku: 'COOKWARE-001',
        barcode: '5678901234567',
        storeId: stores[2]._id,
        store: stores[2]._id,
        externalId: 'ext_345678',
        category: 'أدوات منزلية',
        images: [
          'https://example.com/images/cookware/cookware-set-1.jpg',
          'https://example.com/images/cookware/cookware-set-2.jpg'
        ],
        price: 799.99,
        compareAtPrice: 999.99,
        cost: 500,
        weight: 5,
        weightUnit: 'kg',
        vendor: 'هوم كوك',
        status: 'active',
        variants: [
          {
            name: 'طقم 10 قطع',
            sku: 'COOKWARE-001-10PC',
            barcode: '5678901234568',
            price: 799.99,
            inventory: 30,
            options: {
              size: '10 قطع'
            }
          },
          {
            name: 'طقم 15 قطعة',
            sku: 'COOKWARE-001-15PC',
            barcode: '5678901234569',
            price: 1099.99,
            inventory: 20,
            options: {
              size: '15 قطعة'
            }
          }
        ],
        attributes: {
          material: 'ستانلس ستيل',
          dishwasherSafe: 'نعم',
          inductionCompatible: 'نعم'
        },
        tags: ['أواني طبخ', 'أدوات منزلية', 'مطبخ']
      },
      {
        name: 'صندوق هدايا فاخر',
        description: 'صندوق هدايا فاخر يحتوي على مجموعة متنوعة من الشوكولاتة والحلويات الفاخرة',
        sku: 'GIFT-001',
        barcode: '1122334455667',
        storeId: stores[3]._id,
        store: stores[3]._id,
        externalId: 'ext_567890',
        category: 'هدايا',
        images: [
          'https://example.com/images/gifts/luxury-box-1.jpg',
          'https://example.com/images/gifts/luxury-box-2.jpg'
        ],
        price: 349.99,
        compareAtPrice: 399.99,
        cost: 200,
        weight: 1.5,
        weightUnit: 'kg',
        vendor: 'جيفت لاكشري',
        status: 'active',
        variants: [
          {
            name: 'صغير',
            sku: 'GIFT-001-S',
            barcode: '1122334455668',
            price: 349.99,
            inventory: 15,
            options: {
              size: 'صغير'
            }
          },
          {
            name: 'متوسط',
            sku: 'GIFT-001-M',
            barcode: '1122334455669',
            price: 499.99,
            inventory: 10,
            options: {
              size: 'متوسط'
            }
          },
          {
            name: 'كبير',
            sku: 'GIFT-001-L',
            barcode: '1122334455670',
            price: 699.99,
            inventory: 5,
            options: {
              size: 'كبير'
            }
          }
        ],
        attributes: {
          contents: 'شوكولاتة وحلويات فاخرة',
          packaging: 'صندوق فاخر',
          occasion: 'متعدد المناسبات'
        },
        tags: ['هدايا', 'شوكولاتة', 'لوكس', 'مناسبات']
      }
    ];
    
    // Insertar nuevos productos
    const products = await Product.insertMany(productsData);
    console.log(`✅ ${products.length} productos han sido creados con éxito`);
    
    // Cerrar la conexión
    mongoose.connection.close();
    console.log('✅ Conexión a la base de datos cerrada');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar los datos de productos:', error);
    process.exit(1);
  }
};

// Ejecutar la función si este archivo es llamado directamente
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;