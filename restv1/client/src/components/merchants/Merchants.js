import { useState, useEffect } from 'react';
import keapAPI from '../../services/keapAPI';

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

// Main Merchants Component
export function Merchants() {
  const [merchants, setMerchants] = useState([]);
  const [defaultMerchantAccount, setDefaultMerchantAccount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load merchants on component mount
  useEffect(() => {
    handleLoadMerchants();
  }, []);

  const handleLoadMerchants = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await keapAPI.getMerchants();
      console.log('Merchants data:', data);
      
      setMerchants(data.merchant_accounts || []);
      setDefaultMerchantAccount(data.default_merchant_account || 0);

    } catch (err) {
      console.error('Error loading merchants:', err);
      setError(err.message || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const formatAccountType = (type) => {
    if (!type) return 'Unknown';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Accounts</h1>
        <button
          onClick={handleLoadMerchants}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Error: {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {merchants.length}
            </div>
            <div className="text-sm text-gray-500">Total Accounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {merchants.filter(m => !m.is_test).length}
            </div>
            <div className="text-sm text-gray-500">Live Accounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {merchants.filter(m => m.is_test).length}
            </div>
            <div className="text-sm text-gray-500">Test Accounts</div>
          </div>
        </div>
        
        {defaultMerchantAccount !== 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-500 mr-2">Default Account ID:</span>
              <Badge variant="info">{defaultMerchantAccount}</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Merchant Accounts List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Merchant Accounts ({merchants.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading merchant accounts...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">Failed to Load</p>
            <p className="text-gray-500 mb-4">Unable to retrieve merchant accounts</p>
            <button
              onClick={handleLoadMerchants}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        ) : merchants.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">No Merchant Accounts</p>
            <p className="text-gray-500">No merchant accounts found in your system</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className={merchant.id === defaultMerchantAccount ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {merchant.id}
                        {merchant.id === defaultMerchantAccount && (
                          <Badge variant="info" className="ml-2">Default</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {merchant.account_name || 'Unnamed Account'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAccountType(merchant.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Badge variant={merchant.is_test ? 'warning' : 'success'}>
                        {merchant.is_test ? 'Test' : 'Live'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Badge variant="success">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Merchant accounts are read-only and cannot be modified through this interface. 
                The default merchant account is highlighted and used for payment processing when no specific account is specified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}