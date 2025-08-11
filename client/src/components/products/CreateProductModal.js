import { useState } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  required = false,
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Textarea component
const Textarea = ({ 
  placeholder, 
  value, 
  onChange, 
  className = '',
  rows = 3,
  ...props 
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none ${className}`}
      {...props}
    />
  );
};

// Create Product Modal Component
export function CreateProductModal({ isOpen, onClose, onProductCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    product_name: '',
    product_short_desc: '',
    product_desc: '',
    product_price: '',
    sku: '',
    active: true,
    subscription_only: false
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      product_name: '',
      product_short_desc: '',
      product_desc: '',
      product_price: '',
      sku: '',
      active: true,
      subscription_only: false
    });
    setError('');
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.product_name.trim()) {
      setError('Product name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare data for API
      const productData = {
        product_name: formData.product_name.trim(),
        product_short_desc: formData.product_short_desc.trim() || undefined,
        product_desc: formData.product_desc.trim() || undefined,
        product_price: formData.product_price ? parseFloat(formData.product_price) : undefined,
        sku: formData.sku.trim() || undefined,
        active: formData.active,
        subscription_only: formData.subscription_only
      };

      const newProduct = await keapAPI.createProduct(productData);
      console.log('Product created:', newProduct);
      
      // Notify parent component
      if (onProductCreated) {
        onProductCreated(newProduct);
      }
      
      // Close modal and reset form
      resetForm();
      onClose();
      
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Product</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Product Name - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter product name"
              value={formData.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <Input
              placeholder="Enter SKU"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
            />
          </div>

          {/* Product Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.product_price}
              onChange={(e) => handleInputChange('product_price', e.target.value)}
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <Input
              placeholder="Brief product description"
              value={formData.product_short_desc}
              onChange={(e) => handleInputChange('product_short_desc', e.target.value)}
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              placeholder="Detailed product description"
              value={formData.product_desc}
              onChange={(e) => handleInputChange('product_desc', e.target.value)}
              rows={4}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscription_only"
                checked={formData.subscription_only}
                onChange={(e) => handleInputChange('subscription_only', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="subscription_only" className="ml-2 text-sm text-gray-700">
                Subscription Only
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}