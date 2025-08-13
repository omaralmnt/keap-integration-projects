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

// Main Campaigns Component
export function Campaigns() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search parameters
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [order, setOrder] = useState('date_created');
  const [orderDirection, setOrderDirection] = useState('DESCENDING');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');
  const [count, setCount] = useState(0);

  // Pagination function
  const handlePagination = async (action) => {
    try {
      setLoading(true);
      let response;
      
      if (action === 'next') {
        response = await keapAPI.getCampaignsPaginated(next);
        setOffset(Number(offset) + Number(limit));
      } else {
        response = await keapAPI.getCampaignsPaginated(previous);
        const addedOffset = Number(offset) - Number(limit);
        if (addedOffset > -1) {
          setOffset(addedOffset);
        }
      }
      
      setCampaigns(response.campaigns);
      setNext(response.next);
      setPrevious(response.previous);
      setCount(response.count);
    } catch (error) {
      console.error('Error in pagination:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);

      const queryParams = {
        search_text: searchText,
        limit,
        offset,
        order,
        order_direction: orderDirection
      };

      console.log('Campaign search params:', queryParams);

      const data = await keapAPI.getCampaigns(queryParams);
      console.log('Campaign data:', data);
      
      setCampaigns(data.campaigns);
      setPrevious(data.previous);
      setNext(data.next);
      setCount(data.count);
    } catch (error) {
      console.error('Error searching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewCampaign = (campaignId) => {
    navigate(`/campaigns/details/${campaignId}`);
  };

  // Format status display
  const formatStatus = (campaign) => {
    if (campaign.published_status) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Draft
      </span>
    );
  };

  // Get total active contacts for a campaign
  const getTotalActiveContacts = (campaign) => {
    if (!campaign.sequences) return 0;
    return campaign.sequences.reduce((total, sequence) => {
      return total + (sequence.active_contact_count || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Search campaigns by name or text..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="published_date">Published Date</option>
              <option value="completed_contact_count">Completed Contact Count</option>
              <option value="active_contact_count">Active Contact Count</option>
              <option value="date_created">Date Created</option>
              <option value="last_updated">Last Updated</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Direction</label>
            <select
              value={orderDirection}
              onChange={(e) => setOrderDirection(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="ASCENDING">ASC</option>
              <option value="DESCENDING">DESC</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({count ? count : campaigns.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No campaigns found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Contacts</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goals</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{campaign.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="font-medium">{campaign.name}</div>
                      {campaign.locked && (
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 mt-1">
                          Locked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatStatus(campaign)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {getTotalActiveContacts(campaign)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {campaign.goals?.length || 0}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {campaign.published_date 
                        ? new Date(campaign.published_date).toLocaleDateString()
                        : 'Not published'
                      }
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(campaign.date_created).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewCampaign(campaign.id)}
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
        {!loading && campaigns.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                  disabled={campaigns.length < limit}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                  onClick={() => handlePagination('next')}
                >
                  Next
                </Button>
              </div>
              <div className="text-sm text-gray-700">
                Showing {offset + 1} to {offset + campaigns.length} {count && `of ${count} campaigns`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}