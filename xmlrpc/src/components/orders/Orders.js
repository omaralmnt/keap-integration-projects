import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { useNavigate } from 'react-router-dom';
import { formatKeapDate } from '../../utils/dateUtils';
import { toast } from 'react-toastify';
import ContactSelector from '../misc/ContactSelector';
import ProductSelector from '../misc/ProductSelector';

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Main Orders Component
export function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search parameters
  const [contactId, setContactId] = useState('');
  const [productId, setProductId] = useState('');
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [order, setOrder] = useState('order_date');
  const [orderStatus, setOrderStatus] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [orderType, setOrderType] = useState('');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');
  
  // Create order modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    contactId: '',
    cardId: '0',
    planId: '0',
    productIds: [''],
    subscriptionIds: [''],
    processSpecials: false,
    promoCodes: [''],
    leadAffiliateId: '0',
    saleAffiliateId: '0'
  });
  
  // Contact selector
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Product selector
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Load orders on component mount
  useEffect(() => {
    handleSearch();
  }, []);

  const handlePagination = async (action) => {
    let newOffset;
    if (action === 'next') {
      newOffset = Number(offset) + Number(limit);
    } else {
      newOffset = Math.max(0, Number(offset) - Number(limit));
    }
    
    setOffset(newOffset);
    
    // Re-run search with new offset
    const queryParams = buildQueryParams(newOffset);
    const response = await keapAPI.getOrdersFromJob(queryParams);
    
    if (response.success) {
      setOrders(response.orders);
      setNext(response.next);
      setPrevious(response.previous);
    }
  };

  const buildQueryParams = (currentOffset = offset) => {
    const queryParams = {
      contact_id: contactId || undefined,
      product_id: productId || undefined,
      limit,
      offset: currentOffset,
      order,
      order_direction: 'desc', // Most recent first
      order_status: orderStatus !== '' ? parseInt(orderStatus) : undefined,
      job_status: jobStatus || undefined,
      order_type: orderType || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    return queryParams;
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setOffset(0); // Reset to first page on new search

      const queryParams = buildQueryParams(0);
      const data = await keapAPI.getOrdersFromJob(queryParams);
      
      if (data.success) {
        setOrders(data.orders);
        setPrevious(data.previous);
        setNext(data.next);
      } else {
        console.error('Error fetching orders:', data.error);
        setOrders([]);
      }

    } catch (error) {
      console.error('Error in handleSearch:', error);   
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return undefined;
    return dateTimeLocal + ':00.000Z';
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/orders/details/${orderId}`);
  };

  const createOrder = () => {
    setShowCreateModal(true);
  };

  const handleCreateOrder = async () => {
    try {
      setCreateLoading(true);
      
      // Filter out empty values and include selected products
      const cleanedData = {
        ...orderForm,
        contactId: selectedContact?.id?.toString() || orderForm.contactId,
        productIds: selectedProducts.length > 0 
          ? selectedProducts.map(p => p.id.toString())
          : orderForm.productIds.filter(id => id.trim() !== ''),
        subscriptionIds: orderForm.subscriptionIds.filter(id => id.trim() !== ''),
        promoCodes: orderForm.promoCodes.filter(code => code.trim() !== '')
      };

      // Validate required fields
      if (!cleanedData.contactId) {
        toast.error('Contact is required');
        return;
      }

      if (cleanedData.productIds.length === 0 && cleanedData.subscriptionIds.length === 0) {
        toast.error('At least one product or subscription is required');
        return;
      }

      const result = await keapAPI.createOrder(cleanedData);
      
      if (result.success) {
        toast.success('Order created successfully!');
        setShowCreateModal(false);
        setOrderForm({
          contactId: '',
          cardId: '0',
          planId: '0',
          productIds: [''],
          subscriptionIds: [''],
          processSpecials: false,
          promoCodes: [''],
          leadAffiliateId: '0',
          saleAffiliateId: '0'
        });
        setSelectedContact(null);
        setSelectedProducts([]);
        handleSearch(); // Refresh orders list
      } else {
        toast.error(result.error?.message || 'Failed to create order');
      }
    } catch (error) {
      toast.error('Error creating order: ' + error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setOrderForm({ ...orderForm, contactId: contact.id.toString() });
    setShowContactSelector(false);
  };

  const handleProductSelect = (product) => {
    // Check if product is already selected
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product]);
    }
    setShowProductSelector(false);
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'IN_FULFILLMENT': 'bg-green-100 text-green-800',
      'PENDING_PAYMENT': 'bg-red-100 text-red-800',
      'PAID': 'bg-green-100 text-green-800',
      'UNPAID': 'bg-red-100 text-red-800'
    };
    return statusColors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'IN_FULFILLMENT': 'In Fulfillment',
      'PENDING_PAYMENT': 'Pending Payment'
    };
    return labels[status] || status || 'Unknown';
  };

  const getOrderTypeColor = (type) => {
    const typeColors = {
      'Online': 'bg-blue-100 text-blue-800',
      'Offline': 'bg-purple-100 text-purple-800',
      'Invoice': 'bg-green-100 text-green-800',
      'Order': 'bg-indigo-100 text-indigo-800',
      'Subscription': 'bg-yellow-100 text-yellow-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (payStatus) => {
    const statusColors = {
      0: 'bg-red-100 text-red-800',     // Unpaid
      1: 'bg-green-100 text-green-800', // Paid
      2: 'bg-yellow-100 text-yellow-800', // Partially Paid
      3: 'bg-blue-100 text-blue-800'    // Overpaid
    };
    return statusColors[payStatus] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusLabel = (payStatus) => {
    const labels = {
      0: 'Unpaid',
      1: 'Paid',
      2: 'Partial',
      3: 'Overpaid'
    };
    return labels[payStatus] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Contact ID"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          />
          <Input
            placeholder="Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order Status</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="0">In Fulfillment (Paid)</option>
              <option value="1">Pending Payment (Unpaid)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 25)}
              min="1"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Offset</label>
            <Input
              type="number"
              value={offset}
              onChange={(e) => setOffset(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order By</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="order_date">Order Date</option>
              <option value="update_date">Update Date</option>
              <option value="due_date">Due Date</option>
              <option value="start_date">Start Date</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Job Status</label>
            <Input
              placeholder="e.g., Active, Complete"
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
            />
          </div>
        </div>


        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={createOrder}>
            Create Order
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({orders.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No orders found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      <span className="text-blue-600 font-medium">#{order.id}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.contact_id ? (
                        <span className="text-blue-600 font-medium">#{order.contact_id}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.invoice_total)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(order.total_paid)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-red-600">
                      {formatCurrency(order.total_due)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.pay_status)}`}>
                        {getPaymentStatusLabel(order.pay_status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(order.invoice_type)}`}>
                        {order.invoice_type || 'Invoice'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatKeapDate(order.date_created) || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(order.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={offset === 0}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('previous')}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={orders.length < limit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Order</h3>
              <p className="mt-1 text-sm text-gray-500">Fill in the details to create a new order</p>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact *</label>
                  <div className="mt-1">
                    {selectedContact ? (
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
                        <div>
                          <div className="font-medium text-gray-900">
                            {[selectedContact.given_name, selectedContact.family_name].filter(Boolean).join(' ') || selectedContact.preferred_name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {selectedContact.id}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactSelector(true)}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowContactSelector(true)}
                        className="w-full justify-center"
                      >
                        Select Contact
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Card ID</label>
                  <Input
                    type="number"
                    value={orderForm.cardId}
                    onChange={(e) => setOrderForm({ ...orderForm, cardId: e.target.value })}
                    placeholder="0 to skip charging"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Plan ID</label>
                  <Input
                    type="number"
                    value={orderForm.planId}
                    onChange={(e) => setOrderForm({ ...orderForm, planId: e.target.value })}
                    placeholder="0 for default plan"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Affiliate ID</label>
                  <Input
                    type="number"
                    value={orderForm.leadAffiliateId}
                    onChange={(e) => setOrderForm({ ...orderForm, leadAffiliateId: e.target.value })}
                    placeholder="0 for no affiliate"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sale Affiliate ID</label>
                  <Input
                    type="number"
                    value={orderForm.saleAffiliateId}
                    onChange={(e) => setOrderForm({ ...orderForm, saleAffiliateId: e.target.value })}
                    placeholder="0 for no affiliate"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Products *</label>
                <div className="mt-1">
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.product_name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {product.id} | SKU: {product.sku || 'N/A'} | Price: {formatCurrency(product.product_price)}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(product.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProductSelector(true)}
                        className="w-full"
                      >
                        Add Another Product
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowProductSelector(true)}
                        className="w-full justify-center"
                      >
                        Select Products
                      </Button>
                      <div className="text-xs text-gray-500">
                        Or enter manually:
                      </div>
                      {orderForm.productIds.map((productId, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="number"
                            value={productId}
                            onChange={(e) => {
                              const newProductIds = [...orderForm.productIds];
                              newProductIds[index] = e.target.value;
                              setOrderForm({ ...orderForm, productIds: newProductIds });
                            }}
                            placeholder="Enter product ID"
                          />
                          {orderForm.productIds.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newProductIds = orderForm.productIds.filter((_, i) => i !== index);
                                setOrderForm({ ...orderForm, productIds: newProductIds });
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrderForm({ ...orderForm, productIds: [...orderForm.productIds, ''] })}
                      >
                        Add Manual Product ID
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription IDs</label>
                <div className="mt-1 space-y-2">
                  {orderForm.subscriptionIds.map((subscriptionId, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="number"
                        value={subscriptionId}
                        onChange={(e) => {
                          const newSubscriptionIds = [...orderForm.subscriptionIds];
                          newSubscriptionIds[index] = e.target.value;
                          setOrderForm({ ...orderForm, subscriptionIds: newSubscriptionIds });
                        }}
                        placeholder="Enter subscription ID"
                      />
                      {orderForm.subscriptionIds.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSubscriptionIds = orderForm.subscriptionIds.filter((_, i) => i !== index);
                            setOrderForm({ ...orderForm, subscriptionIds: newSubscriptionIds });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrderForm({ ...orderForm, subscriptionIds: [...orderForm.subscriptionIds, ''] })}
                  >
                    Add Subscription
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Promo Codes</label>
                <div className="mt-1 space-y-2">
                  {orderForm.promoCodes.map((promoCode, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => {
                          const newPromoCodes = [...orderForm.promoCodes];
                          newPromoCodes[index] = e.target.value;
                          setOrderForm({ ...orderForm, promoCodes: newPromoCodes });
                        }}
                        placeholder="Enter promo code"
                      />
                      {orderForm.promoCodes.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPromoCodes = orderForm.promoCodes.filter((_, i) => i !== index);
                            setOrderForm({ ...orderForm, promoCodes: newPromoCodes });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrderForm({ ...orderForm, promoCodes: [...orderForm.promoCodes, ''] })}
                  >
                    Add Promo Code
                  </Button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="processSpecials"
                  type="checkbox"
                  checked={orderForm.processSpecials}
                  onChange={(e) => setOrderForm({ ...orderForm, processSpecials: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="processSpecials" className="ml-2 block text-sm text-gray-900">
                  Process Specials (apply discounts)
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Selector */}
      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelect={handleContactSelect}
        mode="single"
      />

      {/* Product Selector */}
      <ProductSelector
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelect={handleProductSelect}
      />
    </div>
  );
}