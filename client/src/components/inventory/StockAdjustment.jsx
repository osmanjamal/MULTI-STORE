import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useInventory } from '../../hooks/useInventory';
import Button from '../common/Button';
import Alert from '../common/Alert';

const StockAdjustment = ({ inventoryId, currentQuantity, onSave, onCancel }) => {
  const { adjustStock, setStock } = useInventory();
  
  const [adjustmentType, setAdjustmentType] = useState('set');
  const [quantity, setQuantity] = useState(currentQuantity);
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // معالجة التغيير في نوع التعديل
  const handleAdjustmentTypeChange = (e) => {
    setAdjustmentType(e.target.value);
  };
  
  // معالجة تغيير الكمية أو التعديل
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (adjustmentType === 'set') {
      setQuantity(value);
    } else {
      setAdjustment(value);
    }
  };
  
  // معالجة حفظ التعديل
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (adjustmentType === 'set') {
        // تعيين كمية جديدة
        await setStock(inventoryId, quantity, reason);
        setSuccess(`تم تحديث الكمية إلى ${quantity}`);
      } else {
        // زيادة أو إنقاص الكمية
        const adjustValue = adjustmentType === 'add' ? adjustment : -adjustment;
        await adjustStock(inventoryId, adjustValue, reason);
        setSuccess(`تم تعديل المخزون بمقدار ${adjustValue}`);
      }
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تعديل المخزون');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-4">
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الكمية الحالية
          </label>
          <div className="text-lg font-semibold">{currentQuantity}</div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع التعديل
          </label>
          <div className="flex space-x-4 space-x-reverse">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="set"
                checked={adjustmentType === 'set'}
                onChange={handleAdjustmentTypeChange}
                className="ml-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              تعيين كمية جديدة
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="add"
                checked={adjustmentType === 'add'}
                onChange={handleAdjustmentTypeChange}
                className="ml-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              زيادة
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="subtract"
                checked={adjustmentType === 'subtract'}
                onChange={handleAdjustmentTypeChange}
                className="ml-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              إنقاص
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            {adjustmentType === 'set' ? 'الكمية الجديدة' : 'قيمة التعديل'}
          </label>
          <input
            type="number"
            id="quantity"
            value={adjustmentType === 'set' ? quantity : adjustment}
            onChange={handleQuantityChange}
            min={adjustmentType === 'set' ? 0 : 1}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            سبب التعديل
          </label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="سبب تعديل المخزون (اختياري)"
          />
        </div>
        
        <div className="flex justify-end mt-4 space-x-4 space-x-reverse">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              إلغاء
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            حفظ التعديل
          </Button>
        </div>
      </form>
    </div>
  );
};

StockAdjustment.propTypes = {
  inventoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentQuantity: PropTypes.number.isRequired,
  onSave: PropTypes.func,
  onCancel: PropTypes.func
};

export default StockAdjustment;