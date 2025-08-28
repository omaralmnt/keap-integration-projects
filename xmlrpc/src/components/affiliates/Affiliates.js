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

// Main Affiliates Component
export function Affiliates() {
  const navigate = useNavigate();

  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Search parameters matching Infusionsoft API
  const [affCode, setAffCode] = useState('');
  const [affName, setAffName] = useState('');
  const [contactId, setContactId] = useState('');
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('Id');
  const [ascending, setAscending] = useState(false);

  // Total records and pagination info
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Create affiliate form states - matching Infusionsoft fields
  const [newAffiliateData, setNewAffiliateData] = useState({
    AffCode: '',
    ContactId: '',
    AffName: '',
    NotifyLead: 0,
    NotifySale: 0,
    ParentId: '',
    Password: '',
    Status: 1, // 1 = Active, 0 = Inactive
    LeadCookieFor: 30,
    DefCommissionType: 2, // Use Affiliate's Commissions
    PayoutType: 5, // Receipt of Payment
    LeadAmt: 0,
    LeadPercent: 0,
    SaleAmt: 0,
    SalePercent: 0
  });

  // Build query data for Infusionsoft API
  const buildQueryData = () => {
    const queryData = {};
    
    if (affCode) {
      queryData.AffCode = affCode.includes('%') ? affCode : `%${affCode}%`;
    }
    if (affName) {
      queryData.AffName = affName.includes('%') ? affName : `%${affName}%`;
    }
    if (contactId) {
      queryData.ContactId = parseInt(contactId);
    }
    if (parentId) {
      queryData.ParentId = parseInt(parentId);
    }
    if (status !== '') {
      queryData.Status = parseInt(status);
    }

    return queryData;
  };

  // Pagination function
  const handlePagination = async (direction) => {
    let newPage = page;
    if (direction === 'next' && page < totalPages - 1) {
      newPage = page + 1;
    } else if (direction === 'previous' && page > 0) {
      newPage = page - 1;
    } else {
      return; // No change needed
    }
    
    setPage(newPage);
    await performSearch(newPage);
  };

  // Perform search with given page
  const performSearch = async (searchPage = page) => {
    try {
      setLoading(true);

      const queryParams = {
        limit,
        page: searchPage,
        queryData: buildQueryData(),
        selectedFields: [
          'Id',
          'AffCode',
          'AffName', 
          'ContactId',
          'ParentId',
          'Status',
          'NotifyLead',
          'NotifySale',
          'LeadCookieFor',
          'DefCommissionType',
          'PayoutType',
          'LeadAmt',
          'LeadPercent',
          'SaleAmt',
          'SalePercent'
        ],
        orderBy,
        ascending
      };

      const data = await keapAPI.getAffiliates(queryParams);
      console.log(data);
      
      // Assuming the API returns { affiliates: [...], totalRecords: number }
      setAffiliates(data.affiliates || []);
      setTotalRecords(data.totalRecords || 0);
      setTotalPages(Math.ceil((data.totalRecords || 0) / limit));
 
    } catch (error) {
      console.log(error);   
      setAffiliates([]);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const handleSearch = async () => {
    setPage(0); // Reset to first page
    await performSearch(0);
  };

  // Create affiliate function
  const handleCreateAffiliate = async () => {
    try {
      setIsCreating(true);
      
      // Prepare data for API - convert to Infusionsoft format
      const affiliatePayload = {
        AffCode: newAffiliateData.AffCode,
        ContactId: parseInt(newAffiliateData.ContactId),
        AffName: newAffiliateData.AffName || undefined,
        NotifyLead: newAffiliateData.NotifyLead,
        NotifySale: newAffiliateData.NotifySale,
        ParentId: newAffiliateData.ParentId ? parseInt(newAffiliateData.ParentId) : undefined,
        Password: newAffiliateData.Password,
        Status: newAffiliateData.Status,
        LeadCookieFor: parseInt(newAffiliateData.LeadCookieFor),
        DefCommissionType: newAffiliateData.DefCommissionType,
        PayoutType: newAffiliateData.PayoutType,
        LeadAmt: parseFloat(newAffiliateData.LeadAmt) || 0,
        LeadPercent: parseFloat(newAffiliateData.LeadPercent) || 0,
        SaleAmt: parseFloat(newAffiliateData.SaleAmt) || 0,
        SalePercent: parseFloat(newAffiliateData.SalePercent) || 0
      };

      await keapAPI.createAffiliate(affiliatePayload);
      
      // Reset form and close modal
      setNewAffiliateData({
        AffCode: '',
        ContactId: '',
        AffName: '',
        NotifyLead: 0,
        NotifySale: 0,
        ParentId: '',
        Password: '',
        Status: 1,
        LeadCookieFor: 30,
        DefCommissionType: 2,
        PayoutType: 5,
        LeadAmt: 0,
        LeadPercent: 0,
        SaleAmt: 0,
        SalePercent: 0
      });
      setIsModalOpen(false);
      
      // Refresh the affiliates list
      handleSearch();
      
    } catch (error) {
      console.error('Error creating affiliate:', error);
      alert('Error creating affiliate. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewAffiliateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const newAffiliate = () => {
    setIsModalOpen(true);
  };

  const viewAffiliate = (affiliateId) => {
    navigate(`/affiliates/profile/${affiliateId}`);
  };

  // Helper function to format status
  const getStatusLabel = (statusValue) => {
    return statusValue === 1 ? 'Active' : 'Inactive';
  };

  // Helper function to format commission type
  const getCommissionTypeLabel = (type) => {
    switch(type) {
      case 2: return "Use Affiliate's Commissions";
      case 3: return "Use Product Commissions";
      default: return "Unknown";
    }
  };

  // Helper function to format payout type
  const getPayoutTypeLabel = (type) => {
    switch(type) {
      case 4: return "Up front";
      case 5: return "Receipt of Payment";
      default: return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Affiliate Code"
            value={affCode}
            onChange={(e) => setAffCode(e.target.value)}
          />
          <Input
            placeholder="Contact ID"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          />
          <Input
            placeholder="Affiliate Name"
            value={affName}
            onChange={(e) => setAffName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Parent ID"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Records per page</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
              min="1"
              max="1000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order By</label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="Id">ID</option>
              <option value="AffName">Name</option>
              <option value="AffCode">Code</option>
              <option value="ContactId">Contact ID</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort Direction</label>
            <select
              value={ascending}
              onChange={(e) => setAscending(e.target.value === 'true')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="false">Descending</option>
              <option value="true">Ascending</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={newAffiliate}>
            Create New Affiliate
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({affiliates.length}) - Total: {totalRecords}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : affiliates.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No affiliates found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notifications</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Cookie</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.Id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.Id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.AffCode}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.AffName || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.ContactId || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.ParentId || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        affiliate.Status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(affiliate.Status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div className="text-xs">
                        {affiliate.NotifyLead === 1 && <span className="block">• Lead</span>}
                        {affiliate.NotifySale === 1 && <span className="block">• Sale</span>}
                        {affiliate.NotifyLead === 0 && affiliate.NotifySale === 0 && 'None'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.LeadCookieFor || 0} days</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewAffiliate(affiliate.Id)}
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
        {!loading && affiliates.length > 0 && totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page + 1} of {totalPages} ({totalRecords} total records)
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page === 0}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                  onClick={() => handlePagination('previous')}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page >= totalPages - 1}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                  onClick={() => handlePagination('next')}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Affiliate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Affiliate</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateAffiliate(); }}>
                {/* Basic Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Affiliate Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={newAffiliateData.AffCode}
                        onChange={(e) => handleInputChange('AffCode', e.target.value)}
                        placeholder="Unique affiliate code"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        value={newAffiliateData.ContactId}
                        onChange={(e) => handleInputChange('ContactId', e.target.value)}
                        placeholder="Contact ID"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Name</label>
                      <Input
                        value={newAffiliateData.AffName}
                        onChange={(e) => handleInputChange('AffName', e.target.value)}
                        placeholder="Affiliate display name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        value={newAffiliateData.Password}
                        onChange={(e) => handleInputChange('Password', e.target.value)}
                        placeholder="Affiliate login password"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent ID</label>
                      <Input
                        type="number"
                        value={newAffiliateData.ParentId}
                        onChange={(e) => handleInputChange('ParentId', e.target.value)}
                        placeholder="Parent affiliate ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Cookie Days</label>
                      <Input
                        type="number"
                        value={newAffiliateData.LeadCookieFor}
                        onChange={(e) => handleInputChange('LeadCookieFor', e.target.value)}
                        placeholder="30"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newAffiliateData.Status}
                        onChange={(e) => handleInputChange('Status', parseInt(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commission Type</label>
                      <select
                        value={newAffiliateData.DefCommissionType}
                        onChange={(e) => handleInputChange('DefCommissionType', parseInt(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value={2}>Use Affiliate's Commissions</option>
                        <option value={3}>Use Product Commissions</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payout Type</label>
                      <select
                        value={newAffiliateData.PayoutType}
                        onChange={(e) => handleInputChange('PayoutType', parseInt(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value={5}>Receipt of Payment</option>
                        <option value={4}>Up front</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Commission Settings */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Commission Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Amount ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAffiliateData.LeadAmt}
                        onChange={(e) => handleInputChange('LeadAmt', e.target.value)}
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Percent (%)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newAffiliateData.LeadPercent}
                        onChange={(e) => handleInputChange('LeadPercent', e.target.value)}
                        placeholder="0.0"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale Amount ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAffiliateData.SaleAmt}
                        onChange={(e) => handleInputChange('SaleAmt', e.target.value)}
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale Percent (%)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newAffiliateData.SalePercent}
                        onChange={(e) => handleInputChange('SalePercent', e.target.value)}
                        placeholder="0.0"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Notifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        id="notify_on_lead"
                        type="checkbox"
                        checked={newAffiliateData.NotifyLead === 1}
                        onChange={(e) => handleInputChange('NotifyLead', e.target.checked ? 1 : 0)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notify_on_lead" className="ml-2 block text-sm text-gray-700">
                        Notify on Lead
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="notify_on_sale"
                        type="checkbox"
                        checked={newAffiliateData.NotifySale === 1}
                        onChange={(e) => handleInputChange('NotifySale', e.target.checked ? 1 : 0)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notify_on_sale" className="ml-2 block text-sm text-gray-700">
                        Notify on Sale
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || !newAffiliateData.AffCode || !newAffiliateData.ContactId || !newAffiliateData.Password}
                  >
                    {isCreating ? 'Creating...' : 'Create Affiliate'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}