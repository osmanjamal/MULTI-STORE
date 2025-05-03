const Inventory = require('../../models/inventory');
const Store = require('../../models/store');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { formatApiResponse, formatErrorResponse } = require('../../utils/formatter');

/**
 * وحدة التحكم في عمليات المخزون
 */
const stockController = {
  /**
   * تعديل كمية المخزون (زيادة أو إنقاص)
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async adjustStock(req, res, next) {
    try {
      const { id } = req.params;
      const { adjustment, reason, note } = req.body;
      
      if (adjustment === undefined) {
        throw new ValidationError('يرجى توفير قيمة التعديل');
      }
      
      // الحصول على سجل المخزون
      const inventoryItem = await Inventory.findById(id);
      
      if (!inventoryItem) {
        throw new NotFoundError('سجل المخزون غير موجود');
      }
      
      // التحقق من ملكية المتجر
      const store = await Store.findById(inventoryItem.store_id);
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بتعديل هذا المخزون');
      }
      
      // تعديل كمية المخزون
      const updatedInventory = await Inventory.adjustQuantity(id, adjustment);
      
      // تسجيل عملية تعديل المخزون
      // يمكن إضافة نموذج لسجل عمليات المخزون لتتبع التغييرات
      
      res.status(200).json(formatApiResponse({ 
        inventory: updatedInventory,
        adjustment: {
          value: adjustment,
          reason,
          note,
          previousQuantity: inventoryItem.quantity,
          newQuantity: updatedInventory.quantity
        } 
      }, 'success', 'تم تعديل كمية المخزون بنجاح'));
    } catch (error) {
      logger.error('خطأ في تعديل كمية المخزون:', error);
      next(error);
    }
  },
  
  /**
   * مزامنة المخزون بين المتاجر
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async syncInventory(req, res, next) {
    try {
      const { sourceStoreId, targetStoreId } = req.params;
      const { productId, variantId, locationId = 1 } = req.body;
      
      // التحقق من وجود المتاجر وملكيتها
      const sourceStore = await Store.findById(sourceStoreId);
      const targetStore = await Store.findById(targetStoreId);
      
      if (!sourceStore || !targetStore) {
        throw new NotFoundError('أحد المتاجر غير موجود');
      }
      
      if (sourceStore.user_id !== req.user.id || targetStore.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى أحد المتاجر');
      }
      
      // // تحديد المخزون الذي سيتم مزامنته
      let inventoryQuery;
      if (productId && variantId) {
        // مزامنة متغير منتج محدد
        inventoryQuery = await Inventory.findByProductVariantLocation(productId, variantId, locationId, parseInt(sourceStoreId));
      } else if (productId) {
        // مزامنة جميع متغيرات منتج محدد
        inventoryQuery = await Inventory.findByProductId(productId, parseInt(sourceStoreId));
      } else {
        // مزامنة جميع المخزون
        const { inventory } = await Inventory.findByStoreId(parseInt(sourceStoreId), 1, 1000);
        inventoryQuery = inventory;
      }
      
      if (!inventoryQuery || (Array.isArray(inventoryQuery) && inventoryQuery.length === 0)) {
        throw new NotFoundError('لا يوجد مخزون للمزامنة');
      }
      
      // مزامنة المخزون
      const syncResults = [];
      const itemsToSync = Array.isArray(inventoryQuery) ? inventoryQuery : [inventoryQuery];
      
      for (const item of itemsToSync) {
        // التحقق من وجود المخزون في المتجر الهدف
        let targetInventory = await Inventory.findByProductVariantLocation(
          item.product_id,
          item.variant_id,
          locationId,
          parseInt(targetStoreId)
        );
        
        if (targetInventory) {
          // تحديث المخزون الموجود
          targetInventory = await Inventory.updateQuantity(targetInventory.id, item.quantity);
        } else {
          // إنشاء مخزون جديد
          targetInventory = await Inventory.create({
            storeId: parseInt(targetStoreId),
            productId: item.product_id,
            variantId: item.variant_id,
            locationId,
            quantity: item.quantity,
            sku: item.sku,
            inventoryItemId: item.inventory_item_id,
            externalId: null, // لا نستخدم نفس المعرف الخارجي
            metadata: { syncedFrom: item.id }
          });
        }
        
        syncResults.push({
          sourceInventory: {
            id: item.id,
            productId: item.product_id,
            variantId: item.variant_id,
            quantity: item.quantity
          },
          targetInventory: {
            id: targetInventory.id,
            productId: targetInventory.product_id,
            variantId: targetInventory.variant_id,
            quantity: targetInventory.quantity
          }
        });
      }
      
      res.status(200).json(formatApiResponse({ 
        syncResults,
        totalSynced: syncResults.length
      }, 'success', 'تم مزامنة المخزون بنجاح'));
    } catch (error) {
      logger.error('خطأ في مزامنة المخزون:', error);
      next(error);
    }
  },
  
  /**
   * استيراد مخزون من ملف CSV
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async importInventory(req, res, next) {
    try {
      const { storeId } = req.params;
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError('يرجى توفير بيانات المخزون للاستيراد');
      }
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // استيراد المخزون
      const importResults = {
        success: [],
        errors: []
      };
      
      for (const item of items) {
        try {
          // البحث عن المنتج وتحديث مخزونه
          let inventoryItem;
          
          if (item.sku) {
            // البحث عن المخزون بواسطة SKU
            inventoryItem = await Inventory.findBySku(item.sku, parseInt(storeId));
          } else if (item.barcode) {
            // يمكن إضافة البحث عن المنتج بواسطة الباركود أولاً ثم إيجاد المخزون
            // هذا يتطلب خدمة إضافية
          } else if (item.productId) {
            // البحث عن المخزون بواسطة معرف المنتج
            const inventoryItems = await Inventory.findByProductId(item.productId, parseInt(storeId));
            if (inventoryItems && inventoryItems.length > 0) {
              if (item.variantId) {
                inventoryItem = inventoryItems.find(inv => inv.variant_id === item.variantId);
              } else {
                inventoryItem = inventoryItems[0];
              }
            }
          }
          
          if (inventoryItem) {
            // تحديث المخزون الموجود
            const updatedInventory = await Inventory.updateQuantity(inventoryItem.id, item.quantity);
            importResults.success.push({
              sku: item.sku,
              quantity: item.quantity,
              inventoryId: updatedInventory.id
            });
          } else {
            // إضافة مخزون جديد إذا تم توفير جميع البيانات المطلوبة
            if (item.productId) {
              const newInventory = await Inventory.create({
                storeId: parseInt(storeId),
                productId: item.productId,
                variantId: item.variantId || null,
                locationId: item.locationId || 1,
                quantity: item.quantity,
                sku: item.sku,
                inventoryItemId: item.inventoryItemId,
                externalId: item.externalId,
                metadata: item.metadata
              });
              
              importResults.success.push({
                sku: item.sku,
                quantity: item.quantity,
                inventoryId: newInventory.id
              });
            } else {
              importResults.errors.push({
                sku: item.sku,
                error: 'لم يتم العثور على المنتج'
              });
            }
          }
        } catch (itemError) {
          importResults.errors.push({
            sku: item.sku,
            error: itemError.message
          });
        }
      }
      
      res.status(200).json(formatApiResponse({ 
        importResults,
        totalSuccess: importResults.success.length,
        totalErrors: importResults.errors.length
      }, 'success', 'تم استيراد المخزون بنجاح'));
    } catch (error) {
      logger.error('خطأ في استيراد المخزون:', error);
      next(error);
    }
  },
  
  /**
   * تصدير المخزون
   * @param {Object} req - كائن الطلب
   * @param {Object} res - كائن الاستجابة
   * @param {Function} next - دالة التالي
   */
  async exportInventory(req, res, next) {
    try {
      const { storeId } = req.params;
      const { format = 'json' } = req.query;
      
      // التحقق من وجود المتجر وملكيته
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new NotFoundError('المتجر غير موجود');
      }
      
      if (store.user_id !== req.user.id) {
        throw new ForbiddenError('غير مصرح لك بالوصول إلى هذا المتجر');
      }
      
      // الحصول على جميع سجلات المخزون
      const { inventory } = await Inventory.findByStoreId(parseInt(storeId), 1, 10000);
      
      // تحضير بيانات التصدير
      const exportData = await Promise.all(inventory.map(async item => {
        return {
          product_id: item.product_id,
          product_title: item.product_title,
          variant_id: item.variant_id,
          variant_title: item.variant_title || null,
          sku: item.sku,
          barcode: item.product_barcode,
          quantity: item.quantity,
          location_id: item.location_id,
          inventory_item_id: item.inventory_item_id,
          external_id: item.external_id
        };
      }));
      
      if (format === 'csv') {
        // إنشاء CSV
        const fields = Object.keys(exportData[0] || {});
        let csv = fields.join(',') + '\n';
        
        exportData.forEach(item => {
          const values = fields.map(field => {
            const value = item[field];
            // معالجة القيم لضمان تنسيق CSV صحيح
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csv += values.join(',') + '\n';
        });
        
        // إرسال الاستجابة كملف CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="inventory_${storeId}_${Date.now()}.csv"`);
        res.status(200).send(csv);
      } else {
        // إرسال الاستجابة كـ JSON
        res.status(200).json(formatApiResponse({ 
          inventory: exportData,
          totalItems: exportData.length
        }));
      }
    } catch (error) {
      logger.error('خطأ في تصدير المخزون:', error);
      next(error);
    }
  }
};

module.exports = stockController;