import { useState, useEffect } from 'react';
import keapAPI from '../../services/keapAPI';

// Card component for sections
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Badge component for status indicators
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Button component
const Button = ({ children, variant = 'default', size = 'default', className = '', disabled = false, onClick, ...props }) => {
  const variants = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Input component for form fields
const Input = ({ label, value, onChange, type = 'text', placeholder, disabled, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
        {...props}
      />
    </div>
  );
};

export function ProductInventory({ productId }) {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('increase'); // 'increase', 'decrease', 'increment', 'decrement'
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [success, setSuccess] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchInventory();
    }
  }, [productId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const inventoryData = await keapAPI.getProductInventory(productId);
      setInventory(inventoryData);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryAdjustment = async () => {
    try {
      setAdjusting(true);
      setAdjustmentError(null);
      setSuccess(false);

      let result;
      switch (adjustmentType) {
        case 'increment':
          result = await keapAPI.incrementProductInventory(productId);
          break;
        case 'decrement':
          result = await keapAPI.decrementProductInventory(productId);
          break;
        case 'increase':
          result = await keapAPI.adjustProductInventory('increase',productId, adjustmentQuantity);
          break;
        case 'decrease':
          result = await keapAPI.adjustProductInventory('decrease',productId, adjustmentQuantity);
          break;
        default:
          throw new Error('Invalid adjustment type');
      }

      if (result) {
        setSuccess(true);
        // Refresh inventory after successful adjustment
        await fetchInventory();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error('Inventory adjustment failed');
      }

    } catch (err) {
      setAdjustmentError(err.message || 'Failed to adjust inventory');
      console.error('Error adjusting inventory:', err);
    } finally {
      setAdjusting(false);
    }
  };

  const handleQuickAction = async (action) => {
    try {
      setAdjusting(true);
      setAdjustmentError(null);
      setSuccess(false);

      let result;
      switch (action) {
        case 'increment':
          result = await keapAPI.incrementProductInventory(productId);
          break;
        case 'decrement':
          result = await keapAPI.decrementProductInventory(productId);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (result) {
        setSuccess(true);
        await fetchInventory();
        
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error('Quick action failed');
      }

    } catch (err) {
      setAdjustmentError(err.message || 'Failed to perform action');
      console.error('Error performing quick action:', err);
    } finally {
      setAdjusting(false);
    }
  };

  const getInventoryStatus = () => {
    if (inventory === null) return 'unknown';
    if (inventory === 0) return 'out-of-stock';
    if (inventory <= 5) return 'low-stock';
    return 'in-stock';
  };

  const getStatusBadgeVariant = () => {
    const status = getInventoryStatus();
    switch (status) {
      case 'in-stock':
        return 'success';
      case 'low-stock':
        return 'warning';
      case 'out-of-stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    const status = getInventoryStatus();
    switch (status) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadgeVariant()}>
              {getStatusText()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInventory}
              disabled={adjusting}
              className="text-blue-600 hover:text-blue-800 hover:border-blue-300"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Inventory updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(error || adjustmentError) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error || adjustmentError}
                </p>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <div className="space-y-6">
            {/* Current Inventory Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {inventory !== null ? inventory : '—'}
                </div>
                <p className="text-sm text-gray-500">Units Available</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction('increment')}
                  disabled={adjusting}
                  className="flex items-center justify-center space-x-2 text-green-600 hover:text-green-800 hover:border-green-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add 1 Unit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction('decrement')}
                  disabled={adjusting || inventory <= 0}
                  className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 hover:border-red-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span>Remove 1 Unit</span>
                </Button>
              </div>
            </div>

            {/* Bulk Adjustment */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Bulk Adjustment</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">Action</label>
                    <select
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                      disabled={adjusting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="increase">Increase Inventory</option>
                      <option value="decrease">Decrease Inventory</option>
                    </select>
                  </div>
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 1)}
                    placeholder="1"
                    disabled={adjusting}
                  />
                </div>

                <Button
                  onClick={handleInventoryAdjustment}
                  disabled={adjusting || adjustmentQuantity <= 0 || (adjustmentType === 'decrease' && adjustmentQuantity > inventory)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {adjusting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {adjusting ? 'Updating...' : `${adjustmentType === 'increase' ? 'Add' : 'Remove'} ${adjustmentQuantity} Units`}
                  </span>
                </Button>

                {adjustmentType === 'decrease' && adjustmentQuantity > inventory && (
                  <p className="text-xs text-red-600">
                    Cannot decrease by more than current inventory ({inventory} units)
                  </p>
                )}
              </div>
            </div>

            {/* Inventory Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock Level</label>
                  <p className="text-gray-900">{getStatusText()}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product ID</label>
                  <p className="text-gray-900 font-mono">{productId}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}