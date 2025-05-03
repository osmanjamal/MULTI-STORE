/**
 * Datos iniciales de usuarios para el sistema Multi-Store Sync
 * Este archivo contiene datos de muestra para poblar la colección de usuarios en la base de datos
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../server/models/user');
const connectDB = require('../../server/config/database');

// Función para sembrar los datos
const seedUsers = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Eliminar usuarios existentes
    await User.deleteMany({});
    console.log('✅ Usuarios anteriores eliminados');
    
    // Generar hash para contraseñas
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const userPasswordHash = await bcrypt.hash('user123', salt);
    
    // Crear datos de usuarios de muestra
    const usersData = [
      {
        name: 'مدير النظام',
        email: 'admin@example.com',
        password: adminPasswordHash,
        phone: '+9665XXXXXXXX',
        role: 'admin',
        settings: {
          language: 'ar',
          timezone: 'Asia/Riyadh',
          notifications: {
            email: true,
            syncErrors: true,
            lowStock: true,
            newOrders: true
          }
        },
        lastLogin: new Date()
      },
      {
        name: 'مستخدم عادي',
        email: 'user@example.com',
        password: userPasswordHash,
        phone: '+9665XXXXXXXX',
        role: 'user',
        settings: {
          language: 'ar',
          timezone: 'Asia/Riyadh',
          notifications: {
            email: true,
            syncErrors: true,
            lowStock: false,
            newOrders: true
          }
        },
        lastLogin: new Date()
      }
    ];
    
    // Insertar nuevos usuarios
    const users = await User.insertMany(usersData);
    console.log(`✅ ${users.length} usuarios han sido creados con éxito`);
    
    // Cerrar la conexión
    mongoose.connection.close();
    console.log('✅ Conexión a la base de datos cerrada');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar los datos de usuarios:', error);
    process.exit(1);
  }
};

// Ejecutar la función si este archivo es llamado directamente
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;