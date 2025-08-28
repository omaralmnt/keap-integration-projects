import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { toast } from 'react-toastify';

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

export function AffiliateProfile() {
  const { affiliate_id } = useParams();
  const navigate = useNavigate();

  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Commissions states
  const [commissions, setCommissions] = useState([]);
  const [loadingCommissions, setLoadingCommissions] = useState(false);
  const [commissionDateRange, setCommissionDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Clawbacks states
  const [clawbacks, setClawbacks] = useState([]);
  const [loadingClawbacks, setLoadingClawbacks] = useState(false);
  const [clawbackDateRange, setClawbackDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Payouts states
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [payoutDateRange, setPayoutDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Redirect Links states
  const [redirectLinks, setRedirectLinks] = useState([]);
  const [loadingRedirectLinks, setLoadingRedirectLinks] = useState(false);

  useEffect(() => {
    fetchAffiliateDetails();
  }, [affiliate_id]);

  useEffect(() => {
    if (affiliate_id) {
      fetchCommissions();
      fetchClawbacks();
      fetchPayouts();
      fetchRedirectLinks();
    }
  }, [affiliate_id]);

  const fetchAffiliateDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch specific affiliate by ID
      const data = await keapAPI.getAffiliateById(affiliate_id);
      setAffiliate(data);
      
      // Initialize edit data with current affiliate data
      if (data) {
        setEditData(data);
      }
      
    } catch (error) {
      console.error('Error fetching affiliate:', error);
      setError('Failed to load affiliate details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/affiliates');
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - restore original data
      setEditData(affiliate);
      setIsEditMode(false);
    } else {
      // Enter edit mode
      setIsEditMode(true);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      
      // Prepare data for API - only include editable fields
      const updatePayload = {
        AffCode: editData.AffCode,
        AffName: editData.AffName || undefined,
        NotifyLead: editData.NotifyLead,
        NotifySale: editData.NotifySale,
        ParentId: editData.ParentId ? parseInt(editData.ParentId) : undefined,
        Status: editData.Status,
        LeadCookieFor: parseInt(editData.LeadCookieFor),
        DefCommissionType: editData.DefCommissionType,
        PayoutType: editData.PayoutType,
        LeadAmt: parseFloat(editData.LeadAmt) || 0,
        LeadPercent: parseFloat(editData.LeadPercent) || 0,
        SaleAmt: parseFloat(editData.SaleAmt) || 0,
        SalePercent: parseFloat(editData.SalePercent) || 0
      };

      const result = await keapAPI.updateAffiliate(affiliate_id, updatePayload);
      
      if (result.success) {
        // Update the affiliate state with new data
        setAffiliate({ ...affiliate, ...editData });
        setIsEditMode(false);
        toast.success('Affiliate updated successfully!');
      } else {
        throw new Error(result.error?.message || 'Failed to update affiliate');
      }
      
    } catch (error) {
      console.error('Error updating affiliate:', error);
      toast.error('Error updating affiliate. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchCommissions = async (showToast = false) => {
    try {
      setLoadingCommissions(true);
      
      const result = await keapAPI.getAffiliateCommissions(
        affiliate_id, 
        commissionDateRange.startDate, 
        commissionDateRange.endDate
      );
      
      if (result.success) {
        setCommissions(result.commissions || []);
        if (showToast) {
          toast.success(`Found ${result.commissions?.length || 0} commission records`);
        }
      } else {
        throw new Error(result.error?.message || 'Failed to fetch commissions');
      }
      
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error('Error fetching commissions. Please try again.');
      setCommissions([]);
    } finally {
      setLoadingCommissions(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setCommissionDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefreshCommissions = () => {
    fetchCommissions(true); // Show toast when refreshing manually
  };

  const fetchClawbacks = async (showToast = false) => {
    try {
      setLoadingClawbacks(true);
      
      const result = await keapAPI.getAffiliateClawbacks(
        affiliate_id, 
        clawbackDateRange.startDate, 
        clawbackDateRange.endDate
      );
      
      if (result.success) {
        setClawbacks(result.clawbacks || []);
        if (showToast) {
          toast.success(`Found ${result.clawbacks?.length || 0} clawback records`);
        }
      } else {
        throw new Error(result.error?.message || 'Failed to fetch clawbacks');
      }
      
    } catch (error) {
      console.error('Error fetching clawbacks:', error);
      toast.error('Error fetching clawbacks. Please try again.');
      setClawbacks([]);
    } finally {
      setLoadingClawbacks(false);
    }
  };

  const handleClawbackDateRangeChange = (field, value) => {
    setClawbackDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefreshClawbacks = () => {
    fetchClawbacks(true); // Show toast when refreshing manually
  };

  const fetchPayouts = async (showToast = false) => {
    try {
      setLoadingPayouts(true);
      
      const result = await keapAPI.getAffiliatePayouts(
        affiliate_id, 
        payoutDateRange.startDate, 
        payoutDateRange.endDate
      );
      
      if (result.success) {
        setPayouts(result.payouts || []);
        if (showToast) {
          toast.success(`Found ${result.payouts?.length || 0} payout records`);
        }
      } else {
        throw new Error(result.error?.message || 'Failed to fetch payouts');
      }
      
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Error fetching payouts. Please try again.');
      setPayouts([]);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handlePayoutDateRangeChange = (field, value) => {
    setPayoutDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefreshPayouts = () => {
    fetchPayouts(true); // Show toast when refreshing manually
  };

  const fetchRedirectLinks = async (showToast = false) => {
    try {
      setLoadingRedirectLinks(true);
      
      const result = await keapAPI.getAffiliateRedirectLinks(affiliate_id);
      
      if (result.success) {
        setRedirectLinks(result.redirectLinks || []);
        if (showToast) {
          toast.success(`Found ${result.redirectLinks?.length || 0} redirect links`);
        }
      } else {
        throw new Error(result.error?.message || 'Failed to fetch redirect links');
      }
      
    } catch (error) {
      console.error('Error fetching redirect links:', error);
      toast.error('Error fetching redirect links. Please try again.');
      setRedirectLinks([]);
    } finally {
      setLoadingRedirectLinks(false);
    }
  };

  const handleRefreshRedirectLinks = () => {
    fetchRedirectLinks(true); // Show toast when refreshing manually
  };

  // Helper functions for display formatting
  const getStatusLabel = (statusValue) => {
    return statusValue === 1 ? 'Active' : 'Inactive';
  };

  const getCommissionTypeLabel = (type) => {
    switch(type) {
      case 2: return "Use Affiliate's Commissions";
      case 3: return "Use Product Commissions";
      default: return "Unknown";
    }
  };

  const getPayoutTypeLabel = (type) => {
    switch(type) {
      case 4: return "Up front";
      case 5: return "Receipt of Payment";
      default: return "Unknown";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercent = (percent) => {
    return `${percent || 0}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Profile</h1>
          <Button variant="outline" onClick={goBack}>
            Back to Affiliates
          </Button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading affiliate details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Profile</h1>
          <Button variant="outline" onClick={goBack}>
            Back to Affiliates
          </Button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Affiliate</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <div className="space-x-3">
              <Button onClick={fetchAffiliateDetails}>Try Again</Button>
              <Button variant="outline" onClick={goBack}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Profile</h1>
          <Button variant="outline" onClick={goBack}>
            Back to Affiliates
          </Button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Affiliate Not Found</h3>
            <p className="text-sm text-gray-500 mb-4">The affiliate with ID {affiliate_id} could not be found.</p>
            <Button variant="outline" onClick={goBack}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Profile</h1>
          <p className="text-sm text-gray-500">ID: {affiliate.Id}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={goBack}>
            Back to Affiliates
          </Button>
          {isEditMode ? (
            <>
              <Button onClick={handleSaveChanges} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleEditToggle}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle}>
              Edit Affiliate
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Affiliate Code</dt>
              {isEditMode ? (
                <dd className="mt-1">
                  <Input
                    value={editData.AffCode || ''}
                    onChange={(e) => handleInputChange('AffCode', e.target.value)}
                    placeholder="Affiliate Code"
                  />
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                  {affiliate.AffCode}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Affiliate Name</dt>
              {isEditMode ? (
                <dd className="mt-1">
                  <Input
                    value={editData.AffName || ''}
                    onChange={(e) => handleInputChange('AffName', e.target.value)}
                    placeholder="Affiliate Name"
                  />
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-900">
                  {affiliate.AffName || 'Not specified'}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact ID</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {affiliate.ContactId || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Parent ID</dt>
              {isEditMode ? (
                <dd className="mt-1">
                  <Input
                    type="number"
                    value={editData.ParentId || ''}
                    onChange={(e) => handleInputChange('ParentId', e.target.value)}
                    placeholder="Parent ID (optional)"
                  />
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-900">
                  {affiliate.ParentId || 'None (Top-level affiliate)'}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              {isEditMode ? (
                <dd className="mt-1">
                  <select
                    value={editData.Status}
                    onChange={(e) => handleInputChange('Status', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </dd>
              ) : (
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    affiliate.Status === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusLabel(affiliate.Status)}
                  </span>
                </dd>
              )}
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Lead Cookie Duration</dt>
              {isEditMode ? (
                <dd className="mt-1">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={editData.LeadCookieFor || 0}
                      onChange={(e) => handleInputChange('LeadCookieFor', e.target.value)}
                      placeholder="30"
                      min="1"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">days</span>
                  </div>
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-900">
                  {affiliate.LeadCookieFor || 0} days
                </dd>
              )}
            </div>
          </dl>
        </div>
      </div>

      {/* Commission Settings Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Commission Settings</h3>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Commission Type</dt>
              {isEditMode ? (
                <dd className="mt-1">
                  <select
                    value={editData.DefCommissionType}
                    onChange={(e) => handleInputChange('DefCommissionType', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={2}>Use Affiliate's Commissions</option>
                    <option value={3}>Use Product Commissions</option>
                  </select>
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-900">
                  {getCommissionTypeLabel(affiliate.DefCommissionType)}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payout Type</dt>
              {isEditMode ? (
                <dd className="mt-1">
                  <select
                    value={editData.PayoutType}
                    onChange={(e) => handleInputChange('PayoutType', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={5}>Receipt of Payment</option>
                    <option value={4}>Up front</option>
                  </select>
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-900">
                  {getPayoutTypeLabel(affiliate.PayoutType)}
                </dd>
              )}
            </div>
          </dl>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Commission Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lead Commissions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Lead Commissions</h5>
                {isEditMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-blue-700 mb-1">Fixed Amount ($):</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.LeadAmt || 0}
                        onChange={(e) => handleInputChange('LeadAmt', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-blue-700 mb-1">Percentage (%):</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editData.LeadPercent || 0}
                        onChange={(e) => handleInputChange('LeadPercent', e.target.value)}
                        placeholder="0.0"
                        min="0"
                        max="100"
                        className="text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-xs text-blue-700">Fixed Amount:</dt>
                      <dd className="text-xs font-mono text-blue-900">
                        {formatCurrency(affiliate.LeadAmt)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-xs text-blue-700">Percentage:</dt>
                      <dd className="text-xs font-mono text-blue-900">
                        {formatPercent(affiliate.LeadPercent)}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
              
              {/* Sale Commissions */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-green-900 mb-2">Sale Commissions</h5>
                {isEditMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-green-700 mb-1">Fixed Amount ($):</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.SaleAmt || 0}
                        onChange={(e) => handleInputChange('SaleAmt', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-green-700 mb-1">Percentage (%):</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editData.SalePercent || 0}
                        onChange={(e) => handleInputChange('SalePercent', e.target.value)}
                        placeholder="0.0"
                        min="0"
                        max="100"
                        className="text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-xs text-green-700">Fixed Amount:</dt>
                      <dd className="text-xs font-mono text-green-900">
                        {formatCurrency(affiliate.SaleAmt)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-xs text-green-700">Percentage:</dt>
                      <dd className="text-xs font-mono text-green-900">
                        {formatPercent(affiliate.SalePercent)}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              {isEditMode ? (
                <div className="flex items-center">
                  <input
                    id="notify_on_lead"
                    type="checkbox"
                    checked={editData.NotifyLead === 1}
                    onChange={(e) => handleInputChange('NotifyLead', e.target.checked ? 1 : 0)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <label htmlFor="notify_on_lead" className="text-sm font-medium text-gray-900">
                      Lead Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Notify affiliate when they generate leads
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-shrink-0">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      affiliate.NotifyLead === 1 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${
                        affiliate.NotifyLead === 1 ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Lead Notifications</h4>
                    <p className="text-sm text-gray-500">
                      {affiliate.NotifyLead === 1 
                        ? 'Affiliate will be notified when they generate leads'
                        : 'No notifications for leads'
                      }
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-start">
              {isEditMode ? (
                <div className="flex items-center">
                  <input
                    id="notify_on_sale"
                    type="checkbox"
                    checked={editData.NotifySale === 1}
                    onChange={(e) => handleInputChange('NotifySale', e.target.checked ? 1 : 0)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <label htmlFor="notify_on_sale" className="text-sm font-medium text-gray-900">
                      Sale Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Notify affiliate when they generate sales
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-shrink-0">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      affiliate.NotifySale === 1 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${
                        affiliate.NotifySale === 1 ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Sale Notifications</h4>
                    <p className="text-sm text-gray-500">
                      {affiliate.NotifySale === 1 
                        ? 'Affiliate will be notified when they generate sales'
                        : 'No notifications for sales'
                      }
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actions</h3>
        </div>
        <div className="px-6 py-4">
          <div className="flex space-x-3">
            <Button variant="outline">
              View Reports
            </Button>
            <Button variant="outline">
              View Commissions
            </Button>
            <Button 
              variant="outline"
              className={affiliate.Status === 1 ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-green-600 border-green-300 hover:bg-green-50'}
            >
              {affiliate.Status === 1 ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </div>

      {/* Commissions Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Affiliate Commissions</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Start Date:</label>
                <Input
                  type="date"
                  value={commissionDateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">End Date:</label>
                <Input
                  type="date"
                  value={commissionDateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-auto"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleRefreshCommissions}
                disabled={loadingCommissions}
              >
                {loadingCommissions ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
          
          <div className="px-6 py-4">
            {loadingCommissions ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading commissions...</span>
              </div>
            ) : commissions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No commissions found</h3>
                <p className="text-sm text-gray-500">
                  No commission records found for the selected date range ({commissionDateRange.startDate} to {commissionDateRange.endDate}).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commissions.map((commission, index) => (
                      <tr key={commission.Id || index}>
                        <td className="px-4 py-4 text-sm text-gray-900">{commission.Id || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {commission.Date ? new Date(commission.Date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className="text-green-600 font-medium">
                            {commission.Amount ? formatCurrency(commission.Amount) : '$0.00'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            commission.Type === 'Sale' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {commission.Type || 'Sale'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{commission.ContactId || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            commission.Status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {commission.Status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {commissions.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>Total commission records: {commissions.length}</span>
                <span className="font-medium text-green-600">
                  Total earned: {formatCurrency(commissions.reduce((sum, c) => sum + (parseFloat(c.Amount) || 0), 0))}
                </span>
              </div>
            )}
          </div>
        </div>

      {/* Clawbacks Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Affiliate Clawbacks</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Start Date:</label>
                <Input
                  type="date"
                  value={clawbackDateRange.startDate}
                  onChange={(e) => handleClawbackDateRangeChange('startDate', e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">End Date:</label>
                <Input
                  type="date"
                  value={clawbackDateRange.endDate}
                  onChange={(e) => handleClawbackDateRangeChange('endDate', e.target.value)}
                  className="w-auto"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleRefreshClawbacks}
                disabled={loadingClawbacks}
              >
                {loadingClawbacks ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
          
          <div className="px-6 py-4">
            {loadingClawbacks ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading clawbacks...</span>
              </div>
            ) : clawbacks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No clawbacks found</h3>
                <p className="text-sm text-gray-500">
                  No clawback records found for the selected date range ({clawbackDateRange.startDate} to {clawbackDateRange.endDate}).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clawbacks.map((clawback, index) => (
                      <tr key={clawback.Id || index}>
                        <td className="px-4 py-4 text-sm text-gray-900">{clawback.Id || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {clawback.Date ? new Date(clawback.Date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className="text-red-600 font-medium">
                            -{clawback.Amount ? formatCurrency(Math.abs(clawback.Amount)) : '$0.00'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            clawback.Type === 'Refund' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {clawback.Type || 'Clawback'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{clawback.ContactId || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            clawback.Status === 'Processed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {clawback.Status || 'Processed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {clawbacks.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>Total clawback records: {clawbacks.length}</span>
                <span className="font-medium text-red-600">
                  Total clawed back: {formatCurrency(clawbacks.reduce((sum, c) => sum + (Math.abs(parseFloat(c.Amount)) || 0), 0))}
                </span>
              </div>
            )}
          </div>
        </div>

      {/* Payouts Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Affiliate Payouts</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Start Date:</label>
                <Input
                  type="date"
                  value={payoutDateRange.startDate}
                  onChange={(e) => handlePayoutDateRangeChange('startDate', e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">End Date:</label>
                <Input
                  type="date"
                  value={payoutDateRange.endDate}
                  onChange={(e) => handlePayoutDateRangeChange('endDate', e.target.value)}
                  className="w-auto"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleRefreshPayouts}
                disabled={loadingPayouts}
              >
                {loadingPayouts ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
          
          <div className="px-6 py-4">
            {loadingPayouts ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading payouts...</span>
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No payouts found</h3>
                <p className="text-sm text-gray-500">
                  No payout records found for the selected date range ({payoutDateRange.startDate} to {payoutDateRange.endDate}).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payouts.map((payout, index) => (
                      <tr key={payout.Id || index}>
                        <td className="px-4 py-4 text-sm text-gray-900">{payout.Id || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {payout.Date ? new Date(payout.Date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className="text-purple-600 font-medium">
                            {payout.Amount ? formatCurrency(payout.Amount) : '$0.00'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {payout.Method || 'Check'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{payout.ContactId || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payout.Status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payout.Status || 'Processed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {payouts.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>Total payout records: {payouts.length}</span>
                <span className="font-medium text-purple-600">
                  Total paid out: {formatCurrency(payouts.reduce((sum, p) => sum + (parseFloat(p.Amount) || 0), 0))}
                </span>
              </div>
            )}
          </div>
        </div>

      {/* Redirect Links Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Affiliate Redirect Links</h3>
            <Button 
              variant="outline" 
              onClick={handleRefreshRedirectLinks}
              disabled={loadingRedirectLinks}
            >
              {loadingRedirectLinks ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
          
          <div className="px-6 py-4">
            {loadingRedirectLinks ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading redirect links...</span>
              </div>
            ) : redirectLinks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No redirect links found</h3>
                <p className="text-sm text-gray-500">
                  No redirect links have been created for this affiliate.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redirect URL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking URL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {redirectLinks.map((link, index) => (
                      <tr key={link.Id || index}>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {link.Name || 'Untitled Link'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">
                            <a 
                              href={link.RedirectUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {link.RedirectUrl || 'N/A'}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">
                            {link.TrackingUrl ? (
                              <button
                                onClick={() => navigator.clipboard.writeText(link.TrackingUrl)}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                                title="Click to copy tracking URL"
                              >
                                <span className="truncate">{link.TrackingUrl}</span>
                                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {link.Clicks || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {link.Conversions || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            link.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {link.Status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            {link.TrackingUrl && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(link.TrackingUrl);
                                  toast.success('Tracking URL copied to clipboard!');
                                }}
                                className="text-indigo-600 hover:text-indigo-800"
                                title="Copy tracking URL"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            )}
                            {link.RedirectUrl && (
                              <a
                                href={link.RedirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="Open redirect URL"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {redirectLinks.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>Total redirect links: {redirectLinks.length}</span>
                <div className="flex space-x-4">
                  <span className="font-medium text-blue-600">
                    Total clicks: {redirectLinks.reduce((sum, l) => sum + (parseInt(l.Clicks) || 0), 0)}
                  </span>
                  <span className="font-medium text-green-600">
                    Total conversions: {redirectLinks.reduce((sum, l) => sum + (parseInt(l.Conversions) || 0), 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}