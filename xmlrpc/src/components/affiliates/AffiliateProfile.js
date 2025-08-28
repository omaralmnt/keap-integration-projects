import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';

export function AffiliateProfile() {
  const { affiliate_id } = useParams();
  const navigate = useNavigate();

  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAffiliateDetails();
  }, [affiliate_id]);

  const fetchAffiliateDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch specific affiliate by ID
      const data = await keapAPI.getAffiliateById(affiliate_id);
      setAffiliate(data);
      
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
        <Button variant="outline" onClick={goBack}>
          Back to Affiliates
        </Button>
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
              <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                {affiliate.AffCode}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Affiliate Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {affiliate.AffName || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact ID</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {affiliate.ContactId || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Parent ID</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {affiliate.ParentId || 'None (Top-level affiliate)'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  affiliate.Status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(affiliate.Status)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Lead Cookie Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {affiliate.LeadCookieFor || 0} days
              </dd>
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
              <dd className="mt-1 text-sm text-gray-900">
                {getCommissionTypeLabel(affiliate.DefCommissionType)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payout Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getPayoutTypeLabel(affiliate.PayoutType)}
              </dd>
            </div>
          </dl>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Commission Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lead Commissions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Lead Commissions</h5>
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
              </div>
              
              {/* Sale Commissions */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-green-900 mb-2">Sale Commissions</h5>
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
            </div>
            
            <div className="flex items-start">
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
              Edit Affiliate
            </Button>
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
    </div>
  );
}