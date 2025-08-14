import { useState } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';

// Main Hooks Component
export function Hooks() {
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to fetch hooks
  const handleLoadHooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await keapAPI.getHooks();
      console.log('Hooks data:', data);
      setHooks(data || []); // Assuming the API returns an array directly
      
    } catch (error) {
      console.error('Error loading hooks:', error);
      setError('Failed to load hooks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'text-green-600 bg-green-100';
      case 'Unverified':
        return 'text-yellow-600 bg-yellow-100';
      case 'Inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hook Subscriptions</h1>
        <Button onClick={handleLoadHooks} disabled={loading}>
          {loading ? 'Loading...' : 'Load Hooks'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Hook Subscriptions ({hooks.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading hooks...</p>
          </div>
        ) : hooks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No hooks found. Click "Load Hooks" to fetch your subscriptions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hook URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hooks.map((hook, index) => (
                  <tr key={hook.key || index}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {hook.key || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {hook.eventKey || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={hook.hookUrl}>
                        {hook.hookUrl || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hook.status)}`}>
                        {hook.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {hooks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Hook Status Legend</h3>
              <div className="mt-2 text-sm text-blue-700">
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Verified - Active and working
                  </span>
                  <span className="inline-flex items-center">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                    Unverified - Pending verification
                  </span>
                  <span className="inline-flex items-center">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    Inactive - Not working
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}