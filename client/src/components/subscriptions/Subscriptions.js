import { useState } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { useNavigate } from 'react-router-dom';

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  required = false,
  min,
  max,
  step,
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      required={required}
      min={min}
      max={max}
      step={step}
      {...props}
    />
  );
};

// Label component
const Label = ({ children, required = false }) => {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Checkbox component
const Checkbox = ({ checked, onChange, children, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        {...props}
      />
      <label className="ml-2 block text-sm text-gray-700">
        {children}
      </label>
    </div>
  );
};

// Modal component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Subscriptions Component
export function Subscriptions() {
    const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search parameters
  const [contactId, setContactId] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // Create subscription form data
  const [formData, setFormData] = useState({
    contact_id: '',
    subscription_plan_id: '',
    allow_duplicate: false,
    allow_tax: false,
    auto_charge: true,
    billing_amount: '',
    credit_card_id: '',
    first_bill_date: '',
    payment_gateway_id: '',
    quantity: 1,
    sale_affiliate_id: ''
  });

  // Pagination function
  const handlePagination = async (action) => {
    console.log('Pagination:', action);
    let response;
    if (action === 'next') {
       response = await keapAPI.getSubscriptionsPaginated(next);
       setOffset(Number(offset) + Number(limit));
    } else {
       response = await keapAPI.getSubscriptionsPaginated(previous);
       const addedOffset = Number(offset) - Number(limit);
       if (addedOffset > -1) {
               setOffset(addedOffset);
       }
    }
    setSubscriptions(response.subscriptions);
    setNext(response.next);
    setPrevious(response.previous);
  };

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);

      const queryParams = {
        contact_id: contactId,
        limit,
        offset
      };

      console.log('Search params:', queryParams);
      const data = await keapAPI.getSubscriptions(queryParams);
      console.log('Subscriptions data:', data);
      
      setSubscriptions(data.subscriptions);
      setPrevious(data.previous);
      setNext(data.next);
 
    } catch (error) {
      console.log('Error fetching subscriptions:', error);   
    } finally {
      setLoading(false);
    }
  };

  const newSubscription = () => {
      setShowCreateModal(true);
  };

  const viewSubscription = (subscriptionId) => {
      const subscription = subscriptions.find(sub => sub.id === subscriptionId);
      setSelectedSubscription(subscription);
      setShowViewModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getBillingCycleDisplay = (cycle) => {
    const cycles = {
      'YEAR': 'Yearly',
      'MONTH': 'Monthly',
      'WEEK': 'Weekly',
      'DAY': 'Daily'
    };
    return cycles[cycle] || cycle;
  };

  // Form handling functions
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.contact_id || !formData.subscription_plan_id) {
      alert('Contact ID and Subscription Plan ID are required');
      return;
    }

    try {
      setCreateLoading(true);

      // Prepare data for API
      const subscriptionData = {
        contact_id: parseInt(formData.contact_id),
        subscription_plan_id: parseInt(formData.subscription_plan_id),
        allow_duplicate: formData.allow_duplicate,
        allow_tax: formData.allow_tax,
        auto_charge: formData.auto_charge,
        quantity: parseInt(formData.quantity) || 1
      };

      // Only include optional fields if they have values
      if (formData.billing_amount) {
        subscriptionData.billing_amount = parseFloat(formData.billing_amount);
      }
      
      if (formData.credit_card_id) {
        subscriptionData.credit_card_id = parseInt(formData.credit_card_id);
      }

      if (formData.first_bill_date) {
        subscriptionData.first_bill_date = formData.first_bill_date;
      }

      if (formData.payment_gateway_id) {
        subscriptionData.payment_gateway_id = parseInt(formData.payment_gateway_id);
      }

      if (formData.sale_affiliate_id) {
        subscriptionData.sale_affiliate_id = parseInt(formData.sale_affiliate_id);
      }

      console.log('Creating subscription with data:', subscriptionData);
      
      const response = await keapAPI.createSubscription(subscriptionData);
      console.log('Subscription created:', response);

      // Reset form
      setFormData({
        contact_id: '',
        subscription_plan_id: '',
        allow_duplicate: false,
        allow_tax: false,
        auto_charge: true,
        billing_amount: '',
        credit_card_id: '',
        first_bill_date: '',
        payment_gateway_id: '',
        quantity: 1,
        sale_affiliate_id: ''
      });

      // Close modal and refresh list
      setShowCreateModal(false);
      handleSearch(); // Refresh the subscriptions list
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Error creating subscription. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!createLoading) {
      setShowCreateModal(false);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedSubscription(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            type="number"
            placeholder="Contact ID"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
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
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search Subscriptions'}
          </Button>
          <Button variant="secondary" onClick={newSubscription}>
            Create Subscription
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({subscriptions.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No subscriptions found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing Cycle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Bill</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{subscription.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{subscription.contact_id}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscription.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatCurrency(subscription.billing_amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {getBillingCycleDisplay(subscription.billing_cycle)}
                      {subscription.billing_frequency > 1 && ` (every ${subscription.billing_frequency})`}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{subscription.quantity}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(subscription.start_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(subscription.next_bill_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewSubscription(subscription.id)}
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
        {!loading && subscriptions.length > 0 && (
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
                disabled={subscriptions.length < limit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Subscription Modal */}
      <Modal isOpen={showCreateModal} onClose={handleCloseModal} title="Create New Subscription">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Required Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label required>Contact ID</Label>
              <Input
                type="number"
                placeholder="Enter contact ID"
                value={formData.contact_id}
                onChange={(e) => handleInputChange('contact_id', e.target.value)}
                required
                min="1"
              />
            </div>

            <div>
              <Label required>Subscription Plan ID</Label>
              <Input
                type="number"
                placeholder="Enter subscription plan ID"
                value={formData.subscription_plan_id}
                onChange={(e) => handleInputChange('subscription_plan_id', e.target.value)}
                required
                min="1"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Billing Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Default from plan"
                value={formData.billing_amount}
                onChange={(e) => handleInputChange('billing_amount', e.target.value)}
              />
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Credit Card ID</Label>
              <Input
                type="number"
                placeholder="Default: most recent card"
                value={formData.credit_card_id}
                onChange={(e) => handleInputChange('credit_card_id', e.target.value)}
                min="0"
              />
            </div>

            <div>
              <Label>Payment Gateway ID</Label>
              <Input
                type="number"
                placeholder="Default: app default"
                value={formData.payment_gateway_id}
                onChange={(e) => handleInputChange('payment_gateway_id', e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Bill Date</Label>
              <Input
                type="date"
                value={formData.first_bill_date}
                onChange={(e) => handleInputChange('first_bill_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">Default: today (EST)</p>
            </div>

            <div>
              <Label>Sale Affiliate ID</Label>
              <Input
                type="number"
                placeholder="Optional"
                value={formData.sale_affiliate_id}
                onChange={(e) => handleInputChange('sale_affiliate_id', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <Checkbox
              checked={formData.allow_duplicate}
              onChange={() => handleCheckboxChange('allow_duplicate')}
            >
              Allow Duplicate - Disable check for identical subscription
            </Checkbox>

            <Checkbox
              checked={formData.allow_tax}
              onChange={() => handleCheckboxChange('allow_tax')}
            >
              Allow Tax - Only works if product is taxable
            </Checkbox>

            <Checkbox
              checked={formData.auto_charge}
              onChange={() => handleCheckboxChange('auto_charge')}
            >
              Auto Charge - Automatically charge the subscription
            </Checkbox>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLoading || !formData.contact_id || !formData.subscription_plan_id}
            >
              {createLoading ? 'Creating...' : 'Create Subscription'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Subscription Details Modal */}
      <Modal isOpen={showViewModal} onClose={handleCloseViewModal} title="Subscription Details">
        {selectedSubscription && (
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subscription ID</Label>
                <p className="text-sm text-gray-900 font-medium">{selectedSubscription.id}</p>
              </div>
              <div>
                <Label>Contact ID</Label>
                <p className="text-sm text-gray-900">{selectedSubscription.contact_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product ID</Label>
                <p className="text-sm text-gray-900">{selectedSubscription.product_id}</p>
              </div>
              <div>
                <Label>Subscription Plan ID</Label>
                <p className="text-sm text-gray-900">{selectedSubscription.subscription_plan_id}</p>
              </div>
            </div>

            {/* Financial Information */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Financial Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Billing Amount</Label>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatCurrency(selectedSubscription.billing_amount)}
                  </p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <p className="text-sm text-gray-900">{selectedSubscription.quantity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label>Billing Frequency</Label>
                  <p className="text-sm text-gray-900">
                    Every {selectedSubscription.billing_frequency} {getBillingCycleDisplay(selectedSubscription.billing_cycle).toLowerCase()}
                  </p>
                </div>
                <div>
                  <Label>Credit Card ID</Label>
                  <p className="text-sm text-gray-900">
                    {selectedSubscription.credit_card_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Gateway ID</Label>
                  <p className="text-sm text-gray-900">
                    {selectedSubscription.payment_gateway_id || 'Default'}
                  </p>
                </div>
                <div>
                  <Label>Sale Affiliate ID</Label>
                  <p className="text-sm text-gray-900">
                    {selectedSubscription.sale_affiliate_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Important Dates</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.start_date)}</p>
                </div>
                <div>
                  <Label>Next Bill Date</Label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.next_bill_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label>End Date</Label>
                  <p className="text-sm text-gray-900">
                    {selectedSubscription.end_date ? formatDate(selectedSubscription.end_date) : 'No end date'}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedSubscription.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSubscription.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Auto Charge</Label>
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedSubscription.auto_charge 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSubscription.auto_charge ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Allow Tax</Label>
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedSubscription.allow_tax 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedSubscription.allow_tax ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Use Default Payment Gateway</Label>
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedSubscription.use_default_payment_gateway 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedSubscription.use_default_payment_gateway ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseViewModal}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}