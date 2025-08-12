import { useState } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { useNavigate } from 'react-router-dom';
import ProductSelector from '../misc/ProductSelector';

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
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Main CreateOrder Component
export function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Order basic info
  const [contactId, setContactId] = useState('');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderType, setOrderType] = useState('Online');
  const [orderDate, setOrderDate] = useState('');
  const [leadAffiliateId, setLeadAffiliateId] = useState('');
  const [salesAffiliateId, setSalesAffiliateId] = useState('');
  const [promoCodes, setPromoCodes] = useState('');

  // Product selector state
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // Order items
  const [orderItems, setOrderItems] = useState([{
    description: '',
    item_type: 'PRODUCT',
    price: '',
    product_id: '',
    quantity: 1
  }]);

  // Shipping address
  const [shippingAddress, setShippingAddress] = useState({
    company: '',
    country_code: '',
    first_name: '',
    is_invoice_to_company: false,
    last_name: '',
    line1: '',
    line2: '',
    locality: '',
    middle_name: '',
    phone: '',
    region: '',
    zip_code: '',
    zip_four: ''
  });

  const itemTypes = [
    'UNKNOWN', 'SHIPPING', 'TAX', 'SERVICE', 'PRODUCT', 'UPSELL', 
    'FINANCE_CHARGE', 'SPECIAL', 'PROGRAM', 'SUBSCRIPTION', 
    'SPECIAL_FREE_TRIAL_DAYS', 'SPECIAL_ORDER_TOTAL', 'SPECIAL_PRODUCT', 
    'SPECIAL_CATEGORY', 'SPECIAL_SHIPPING', 'TIP', 'OTHER'
  ];

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      description: '',
      item_type: 'PRODUCT',
      price: '',
      product_id: '',
      quantity: 1
    }]);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index, field, value) => {
    console.log('Updating item:', index, field, value);
    const updatedItems = orderItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    console.log('Updated items:', updatedItems);
    setOrderItems(updatedItems);
  };

  const updateShippingAddress = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const openProductSelector = (index) => {
    setSelectedItemIndex(index);
    setShowProductSelector(true);
  };

  const handleProductSelect = (product) => {
    console.log('Product selected:', product);
    console.log('Selected item index:', selectedItemIndex);
    console.log('Current orderItems before update:', orderItems);
    
    updateOrderItem(selectedItemIndex, 'product_id', product.id.toString());
    updateOrderItem(selectedItemIndex, 'description', product.product_name || '');
    if (product.product_price) {
      updateOrderItem(selectedItemIndex, 'price', product.product_price.toString());
    }
  };

  const formatDateForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return '';
    return dateTimeLocal + ':00.000Z';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the payload
      const payload = {
        contact_id: parseInt(contactId),
        order_title: orderTitle,
        order_type: orderType,
        order_date: formatDateForAPI(orderDate),
        order_items: orderItems.map(item => ({
          description: item.description || undefined,
          item_type: item.item_type,
          price: item.price || undefined,
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity)
        }))
      };

      // Add optional fields
      if (leadAffiliateId) payload.lead_affiliate_id = parseInt(leadAffiliateId);
      if (salesAffiliateId) payload.sales_affiliate_id = parseInt(salesAffiliateId);
      if (promoCodes.trim()) {
        payload.promo_codes = promoCodes.split(',').map(code => code.trim()).filter(code => code);
      }

      // Add shipping address if any field is filled
      const hasShippingData = Object.values(shippingAddress).some(value => 
        typeof value === 'string' ? value.trim() : value
      );
      if (hasShippingData) {
        payload.shipping_address = {
          ...shippingAddress,
          is_invoice_to_company: shippingAddress.is_invoice_to_company
        };
      }

      console.log('Creating order with payload:', payload);
      const response = await keapAPI.createOrder(payload);
      console.log('Order created:', response);
      
      // Navigate to order details or orders list
      navigate(`/orders/details/${response.id}` || '/orders');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
        <Button variant="outline" onClick={goBack}>
          Back to Orders
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Order Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact ID *
              </label>
              <Input
                type="number"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Title *
              </label>
              <Input
                value={orderTitle}
                onChange={(e) => setOrderTitle(e.target.value)}
                required
                placeholder="Enter order title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type *
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date *
              </label>
              <Input
                type="datetime-local"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Affiliate ID
              </label>
              <Input
                type="number"
                value={leadAffiliateId}
                onChange={(e) => setLeadAffiliateId(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Affiliate ID
              </label>
              <Input
                type="number"
                value={salesAffiliateId}
                onChange={(e) => setSalesAffiliateId(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promo Codes (comma separated)
            </label>
            <Input
              value={promoCodes}
              onChange={(e) => setPromoCodes(e.target.value)}
              placeholder="PROMO1, PROMO2, PROMO3"
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            <Button type="button" onClick={addOrderItem} variant="outline">
              Add Item
            </Button>
          </div>

          {orderItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Item #{index + 1}</h3>
                {orderItems.length > 1 && (
                  <Button 
                    type="button" 
                    onClick={() => removeOrderItem(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Product ID *</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={item.product_id}
                      onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)}
                      required
                      min="1"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => openProductSelector(index)}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      Select
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quantity *</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Item Type</label>
                  <select
                    value={item.item_type}
                    onChange={(e) => updateOrderItem(index, 'item_type', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  >
                    {itemTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price Override</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateOrderItem(index, 'price', e.target.value)}
                    placeholder="Leave empty for default"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateOrderItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address (Optional)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">First Name</label>
              <Input
                value={shippingAddress.first_name}
                onChange={(e) => updateShippingAddress('first_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Middle Name</label>
              <Input
                value={shippingAddress.middle_name}
                onChange={(e) => updateShippingAddress('middle_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Last Name</label>
              <Input
                value={shippingAddress.last_name}
                onChange={(e) => updateShippingAddress('last_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Company</label>
              <Input
                value={shippingAddress.company}
                onChange={(e) => updateShippingAddress('company', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <Input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => updateShippingAddress('phone', e.target.value)}
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="is_invoice_to_company"
                checked={shippingAddress.is_invoice_to_company}
                onChange={(e) => updateShippingAddress('is_invoice_to_company', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_invoice_to_company" className="ml-2 block text-sm text-gray-700">
                Invoice to Company
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Address Line 1</label>
              <Input
                value={shippingAddress.line1}
                onChange={(e) => updateShippingAddress('line1', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Address Line 2</label>
              <Input
                value={shippingAddress.line2}
                onChange={(e) => updateShippingAddress('line2', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">City/Locality</label>
              <Input
                value={shippingAddress.locality}
                onChange={(e) => updateShippingAddress('locality', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">State/Region</label>
              <Input
                value={shippingAddress.region}
                onChange={(e) => updateShippingAddress('region', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Country Code</label>
              <Input
                value={shippingAddress.country_code}
                onChange={(e) => updateShippingAddress('country_code', e.target.value)}
                placeholder="US, CA, etc."
                maxLength="2"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Zip Code</label>
              <Input
                value={shippingAddress.zip_code}
                onChange={(e) => updateShippingAddress('zip_code', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Zip Four</label>
              <Input
                value={shippingAddress.zip_four}
                onChange={(e) => updateShippingAddress('zip_four', e.target.value)}
                maxLength="4"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={goBack} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>

      {/* Product Selector Modal */}
      <ProductSelector
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelect={handleProductSelect}
        selectedProductId={orderItems[selectedItemIndex]?.product_id}
      />
    </div>
  );
}