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

// Main Opportunities Component
export function Opportunities() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageId, setStageId] = useState('');
  const [userId, setUserId] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [order, setOrder] = useState('date_created');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Pagination function
  const handlePagination = async (action) => {
    let response;
    if (action === 'next') {
      response = await keapAPI.getOpportunitiesPaginated(next);
      setOffset(Number(offset) + Number(limit));
    } else {
      response = await keapAPI.getOpportunitiesPaginated(previous);
      const addedOffset = Number(offset) - Number(limit);
      if (addedOffset > -1) {
        setOffset(addedOffset);
      }
    }
    setOpportunities(response.opportunities);
    setNext(response.next);
    setPrevious(response.previous);
  };

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);

      const queryParams = {
        limit,
        offset,
        order,
        ...(searchTerm && { search_term: searchTerm }),
        ...(stageId && { stage_id: parseInt(stageId) }),
        ...(userId && { user_id: parseInt(userId) })
      };

      const data = await keapAPI.getOpportunities(queryParams);
      console.log(data);
      setOpportunities(data.opportunities);
      setPrevious(data.previous);
      setNext(data.next);
    } catch (error) {
      console.log(error);   
    } finally {
      setLoading(false);
    }
  };

  const newOpportunity = () => {
    navigate('/opportunities/create');
  };

  const viewOpportunity = (opportunityId) => {
    navigate(`/opportunities/details/${opportunityId}`);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Search term (name, contact, company, email)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Stage ID"
            value={stageId}
            onChange={(e) => setStageId(e.target.value)}
          />
          <Input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
              <option value="next_action">Next Action</option>
              <option value="opportunity_name">Opportunity Name</option>
              <option value="contact_name">Contact Name</option>
              <option value="date_created">Date Created</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={newOpportunity}>
            Create New Opportunity
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({opportunities.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No opportunities found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opportunities.map((opportunity) => (
                  <tr key={opportunity.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{opportunity.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="font-medium">{opportunity.opportunity_title || 'Untitled'}</div>
                      {opportunity.opportunity_notes && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {opportunity.opportunity_notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="font-medium">
                        {opportunity.contact?.first_name} {opportunity.contact?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {opportunity.contact?.company_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {opportunity.contact?.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="font-medium">{opportunity.stage?.name || 'N/A'}</div>
                      {opportunity.stage?.details?.probability !== undefined && (
                        <div className="text-xs text-gray-500">
                          {opportunity.stage.details.probability}% probability
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="text-xs">
                        <div>Low: {formatCurrency(opportunity.projected_revenue_low)}</div>
                        <div>High: {formatCurrency(opportunity.projected_revenue_high)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {opportunity.estimated_close_date 
                        ? new Date(opportunity.estimated_close_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(opportunity.date_created).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewOpportunity(opportunity.id)}
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
        {!loading && opportunities.length > 0 && (
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
                disabled={opportunities.length < limit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}