const Inventory = require('../../models/inventory');
const Product = require('../../models/product');
const Variant = require('../../models/variant');
const { NotFoundError } = require('../../utils/errors');

exports.getInventoryByStore = async (storeId, page, limit) => {
  return await Inventory.findByStoreId(storeId, page, limit);
};

exports.getInventoryByProduct = async (productId, storeId) => {
  return await Inventory.findByProductId(productId, storeId);
};

exports.getInventory = async (id) => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new NotFoundError('سجل المخزون غير موجود');
  return inventory;
};

exports.createInventory = async (inventoryData) => {
  return await Inventory.create(inventoryData);
};

exports.updateInventory = async (id, inventoryData) => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new NotFoundError('سجل المخزون غير موجود');
  return await Inventory.update(id, inventoryData);
};

exports.updateOrCreateInventory = async (inventoryData) => {
  return await Inventory.updateOrCreate(inventoryData);
};

exports.deleteInventory = async (id) => {
  const inventory = await Inventory.findById(id);
  if (!inventory) throw new NotFoundError('سجل المخزون غير موجود');
  return await Inventory.delete(id);
};