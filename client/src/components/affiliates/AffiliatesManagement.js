import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed' : '';
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
};

// FormField component
const FormField = ({ label, error, required = false, children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

// Create/Edit Affiliate Modal
const AffiliateModal = ({ isOpen, onClose, affiliate, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    // Contact Information
    contact_id: affiliate?.contact_id || '',
    first_name: affiliate?.first_name || '',
    last_name: affiliate?.last_name || '',
    email: affiliate?.email || '',
    phone: affiliate?.phone || '',
    
    // Affiliate Settings
    affiliate_code: affiliate?.affiliate_code || '',
    status: affiliate?.status || 'pending',
    parent_affiliate_id: affiliate?.parent_affiliate_id || '',
    
    // Commission Settings
    default_commission_type: affiliate?.default_commission_type || 'percentage',
    default_commission_amount: affiliate?.default_commission_amount || '',
    
    // Tracking Settings
    track_leads_for: affiliate?.track_leads_for || '30',
    notify_on_lead: affiliate?.notify_on_lead || false,
    notify_on_sale: affiliate?.notify_on_sale || false,
    
    // Payment Settings
    payment_type: affiliate?.payment_type || 'check',
    payment_schedule: affiliate?.payment_schedule || 'monthly',
    minimum_payout_amount: affiliate?.minimum_payout_amount || '',
    
    // Custom Fields
    notes: affiliate?.notes || '',
    password: affiliate ? '' : '', // Solo para creación
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && affiliate) {
      setFormData({
        contact_id: affiliate.contact_id || '',
        first_name: affiliate.first_name || '',
        last_name: affiliate.last_name || '',
        email: affiliate.email || '',
        phone: affiliate.phone || '',
        affiliate_code: affiliate.affiliate_code || '',
        status: affiliate.status || 'pending',
        parent_affiliate_id: affiliate.parent_affiliate_id || '',
        default_commission_type: affiliate.default_commission_type || 'percentage',
        default_commission_amount: affiliate.default_commission_amount || '',
        track_leads_for: affiliate.track_leads_for || '30',
        notify_on_lead: affiliate.notify_on_lead || false,
        notify_on_sale: affiliate.notify_on_sale || false,
        payment_type: affiliate.payment_type || 'check',
        payment_schedule: affiliate.payment_schedule || 'monthly',
        minimum_payout_amount: affiliate.minimum_payout_amount || '',
        notes: affiliate.notes || '',
        password: '',
      });
      setErrors({});
    }
  }, [isOpen, affiliate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Affiliate data to save:', formData);
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      contact_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      affiliate_code: '',
      status: 'pending',
      parent_affiliate_id: '',
      default_commission_type: 'percentage',
      default_commission_amount: '',
      track_leads_for: '30',
      notify_on_lead: false,
      notify_on_sale: false,
      payment_type: 'check',
      payment_schedule: 'monthly',
      minimum_payout_amount: '',
      notes: '',
      password: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={affiliate ? 'Edit Affiliate' : 'Create New Affiliate'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Contact ID" error={errors.contact_id}>
              <Input
                value={formData.contact_id}
                onChange={(e) => handleChange('contact_id', e.target.value)}
                placeholder="Leave empty to create new contact"
                error={!!errors.contact_id}
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Link to existing contact</p>
            </FormField>

            <FormField label="Affiliate Code" required error={errors.affiliate_code}>
              <Input
                value={formData.affiliate_code}
                onChange={(e) => handleChange('affiliate_code', e.target.value)}
                placeholder="Unique affiliate code"
                error={!!errors.affiliate_code}
              />
            </FormField>

            <FormField label="First Name" required error={errors.first_name}>
              <Input
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="First name"
                error={!!errors.first_name}
              />
            </FormField>

            <FormField label="Last Name" required error={errors.last_name}>
              <Input
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Last name"
                error={!!errors.last_name}
              />
            </FormField>

            <FormField label="Email" required error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Email address"
                error={!!errors.email}
              />
            </FormField>

            <FormField label="Phone" error={errors.phone}>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Phone number"
                error={!!errors.phone}
              />
            </FormField>

            {!affiliate && (
              <FormField label="Password" required error={errors.password} className="md:col-span-2">
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Affiliate login password"
                  error={!!errors.password}
                />
              </FormField>
            )}
          </div>
        </div>

        {/* Affiliate Settings */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Affiliate Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Status" error={errors.status}>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </FormField>

            <FormField label="Parent Affiliate ID" error={errors.parent_affiliate_id}>
              <Input
                value={formData.parent_affiliate_id}
                onChange={(e) => handleChange('parent_affiliate_id', e.target.value)}
                placeholder="Parent affiliate ID (for multi-level)"
                error={!!errors.parent_affiliate_id}
              />
            </FormField>
          </div>
        </div>

        {/* Commission Settings */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Commission Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Default Commission Type" error={errors.default_commission_type}>
              <select
                value={formData.default_commission_type}
                onChange={(e) => handleChange('default_commission_type', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </FormField>

            <FormField label="Commission Amount" error={errors.default_commission_amount}>
              <Input
                type="number"
                step="0.01"
                value={formData.default_commission_amount}
                onChange={(e) => handleChange('default_commission_amount', e.target.value)}
                placeholder={formData.default_commission_type === 'percentage' ? '10.00' : '25.00'}
                error={!!errors.default_commission_amount}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.default_commission_type === 'percentage' ? 'Percentage (%)' : 'Fixed amount ($)'}
              </p>
            </FormField>
          </div>
        </div>

        {/* Tracking Settings */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Tracking Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Track Leads For (days)" error={errors.track_leads_for}>
              <select
                value={formData.track_leads_for}
                onChange={(e) => handleChange('track_leads_for', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </FormField>

            <div className="space-y-3">
              <FormField label="Notifications">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notify_on_lead}
                      onChange={(e) => handleChange('notify_on_lead', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notify on new lead</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notify_on_sale}
                      onChange={(e) => handleChange('notify_on_sale', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notify on sale</span>
                  </label>
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Payment Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Payment Type" error={errors.payment_type}>
              <select
                value={formData.payment_type}
                onChange={(e) => handleChange('payment_type', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="check">Check</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="store_credit">Store Credit</option>
              </select>
            </FormField>

            <FormField label="Payment Schedule" error={errors.payment_schedule}>
              <select
                value={formData.payment_schedule}
                onChange={(e) => handleChange('payment_schedule', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="manual">Manual</option>
              </select>
            </FormField>

            <FormField label="Minimum Payout ($)" error={errors.minimum_payout_amount}>
              <Input
                type="number"
                step="0.01"
                value={formData.minimum_payout_amount}
                onChange={(e) => handleChange('minimum_payout_amount', e.target.value)}
                placeholder="50.00"
                error={!!errors.minimum_payout_amount}
              />
            </FormField>
          </div>
        </div>

        {/* Notes */}
        <div>
          <FormField label="Notes" error={errors.notes}>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this affiliate..."
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </FormField>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            {affiliate ? 'Update Affiliate' : 'Create Affiliate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Main Affiliates Component
export function AffiliatesManagement() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - TÚ IMPLEMENTARÁS LA LÓGICA DE API
  useEffect(() => {
    // TODO: Implementar fetchAffiliates()
    const mockAffiliates = [
      {
        id: 1,
        contact_id: 12345,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-0123',
        affiliate_code: 'JOHN123',
        status: 'active',
        default_commission_type: 'percentage',
        default_commission_amount: '10.00',
        total_commissions: 1250.50,
        total_referrals: 45,
        created_date: '2024-01-15',
      },
      {
        id: 2,
        contact_id: 12346,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah@example.com',
        phone: '555-0124',
        affiliate_code: 'SARAH456',
        status: 'pending',
        default_commission_type: 'fixed',
        default_commission_amount: '25.00',
        total_commissions: 0,
        total_referrals: 0,
        created_date: '2024-02-20',
      },
    ];
    setAffiliates(mockAffiliates);
  }, []);

  // Filter affiliates based on search and status
  const filteredAffiliates = affiliates.filter(affiliate => {
    const matchesSearch = 
      affiliate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || affiliate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAffiliates.length / itemsPerPage);
  const paginatedAffiliates = filteredAffiliates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler functions - TÚ IMPLEMENTARÁS LA LÓGICA
  const handleCreateAffiliate = () => {
    setSelectedAffiliate(null);
    setModalOpen(true);
  };

  const handleEditAffiliate = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setModalOpen(true);
  };

  const handleSaveAffiliate = (affiliateData) => {
    console.log('Save affiliate:', affiliateData);
    // TODO: Implementar createAffiliate() o updateAffiliate()
    setModalOpen(false);
  };

  const handleDeleteAffiliate = (affiliateId) => {
    if (window.confirm('Are you sure you want to delete this affiliate?')) {
      console.log('Delete affiliate:', affiliateId);
      // TODO: Implementar deleteAffiliate()
    }
  };

  const handleActivateAffiliate = (affiliateId) => {
    console.log('Activate affiliate:', affiliateId);
    // TODO: Implementar activateAffiliate()
  };

  const handleDeactivateAffiliate = (affiliateId) => {
    console.log('Deactivate affiliate:', affiliateId);
    // TODO: Implementar deactivateAffiliate()
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliates Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your affiliate partners and their commission settings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={handleCreateAffiliate}>
            Create New Affiliate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Affiliates
            </label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or code..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Affiliates ({filteredAffiliates.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading affiliates...</p>
          </div>
        ) : paginatedAffiliates.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No affiliates found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAffiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {affiliate.first_name} {affiliate.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{affiliate.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {affiliate.affiliate_code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={affiliate.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {affiliate.default_commission_type === 'percentage' 
                          ? `${affiliate.default_commission_amount}%`
                          : `$${affiliate.default_commission_amount}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${affiliate.total_commissions?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {affiliate.total_referrals} referrals
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(affiliate.created_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditAffiliate(affiliate)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {affiliate.status === 'active' ? (
                            <button
                              onClick={() => handleDeactivateAffiliate(affiliate.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateAffiliate(affiliate.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAffiliate(affiliate.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredAffiliates.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{filteredAffiliates.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Affiliates
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {affiliates.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Affiliates
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {affiliates.filter(a => a.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approval
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {affiliates.filter(a => a.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Commissions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${affiliates.reduce((sum, a) => sum + (a.total_commissions || 0), 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="secondary"
            onClick={() => console.log('TODO: Export affiliates list')}
            className="w-full"
          >
            Export Affiliates
          </Button>
          <Button
            variant="secondary"
            onClick={() => console.log('TODO: Send bulk email')}
            className="w-full"
          >
            Send Bulk Email
          </Button>
          <Button
            variant="secondary"
            onClick={() => console.log('TODO: Generate reports')}
            className="w-full"
          >
            Generate Report
          </Button>
          <Button
            variant="secondary"
            onClick={() => console.log('TODO: Import affiliates')}
            className="w-full"
          >
            Import Affiliates
          </Button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AffiliateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        affiliate={selectedAffiliate}
        onSave={handleSaveAffiliate}
        isLoading={loading}
      />
    </div>
  );
}