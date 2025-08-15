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
  
  // Search parameters
  const [code, setCode] = useState('');
  const [contactId, setContactId] = useState('');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [programId, setProgramId] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(3);
  const [offset, setOffset] = useState(0);
  const [order, setOrder] = useState('id');
  const [orderDirection, setOrderDirection] = useState('DESCENDING');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Create affiliate form states
  const [newAffiliateData, setNewAffiliateData] = useState({
    code: '',
    contact_id: '',
    name: '',
    notify_on_lead: false,
    notify_on_sale: false,
    parent_id: '',
    password: '',
    status: 'active',
    track_leads_for: 30
  });

  // Pagination function
  const handlePagination = async (action) => {
    console.log('hi');
    let response;
    if (action === 'next') {
      response = await keapAPI.getAffiliatesPaginated(next);
      setOffset(Number(offset) + Number(limit));
    } else {
      response = await keapAPI.getAffiliatesPaginated(previous);
      const addedOffset = Number(offset) - Number(limit);
      if (addedOffset > -1) {
        setOffset(addedOffset);
      }
    }
    setAffiliates(response.affiliates);
    setNext(response.next);
    setPrevious(response.previous);
  };

  // Create affiliate function
  const handleCreateAffiliate = async () => {
    try {
      setIsCreating(true);
      
      // Prepare data for API
      const affiliatePayload = {
        code: newAffiliateData.code,
        contact_id: parseInt(newAffiliateData.contact_id),
        name: newAffiliateData.name || undefined,
        notify_on_lead: newAffiliateData.notify_on_lead,
        notify_on_sale: newAffiliateData.notify_on_sale,
        parent_id: newAffiliateData.parent_id ? parseInt(newAffiliateData.parent_id) : undefined,
        password: newAffiliateData.password,
        status: newAffiliateData.status,
        track_leads_for: parseInt(newAffiliateData.track_leads_for)
      };

      await keapAPI.createAffiliate(affiliatePayload);
      
      // Reset form and close modal
      setNewAffiliateData({
        code: '',
        contact_id: '',
        name: '',
        notify_on_lead: false,
        notify_on_sale: false,
        parent_id: '',
        password: '',
        status: 'active',
        track_leads_for: 30
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

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);

      const queryParams = {
        code,
        contact_id: contactId,
        name,
        parent_id: parentId,
        program_id: programId,
        status,
        limit,
        offset,
        order,
        order_direction: orderDirection
      };

      const data = await keapAPI.getAffiliates(queryParams);
      console.log(data);
      setAffiliates(data.affiliates);
      setPrevious(data.previous);
      setNext(data.next);
 
    } catch (error) {
      console.log(error);   
    } finally {
      setLoading(false);
    }
  };

  const newAffiliate = () => {
    setIsModalOpen(true);
  };



  const viewAffiliate = (affiliateId) => {
    navigate(`/affiliates/profile/${affiliateId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            placeholder="Contact ID"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          />
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Parent ID"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          />
          <Input
            placeholder="Program ID"
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
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
          <Button variant="secondary" onClick={newAffiliate}>
            Create New Affiliate
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({affiliates.length})
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.code}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.contact_id || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{affiliate.parent_id || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        affiliate.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {affiliate.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div className="text-xs">
                        {affiliate.notify_on_lead && <span className="block">• Lead</span>}
                        {affiliate.notify_on_sale && <span className="block">• Sale</span>}
                        {!affiliate.notify_on_lead && !affiliate.notify_on_sale && 'None'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewAffiliate(affiliate.id)}
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
        {!loading && affiliates.length > 0 && (
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
                disabled={affiliates.length < limit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Affiliate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newAffiliateData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="Affiliate code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={newAffiliateData.contact_id}
                      onChange={(e) => handleInputChange('contact_id', e.target.value)}
                      placeholder="Contact ID"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      value={newAffiliateData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Affiliate name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      value={newAffiliateData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent ID</label>
                    <Input
                      type="number"
                      value={newAffiliateData.parent_id}
                      onChange={(e) => handleInputChange('parent_id', e.target.value)}
                      placeholder="Parent affiliate ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Track Leads For (days)</label>
                    <Input
                      type="number"
                      value={newAffiliateData.track_leads_for}
                      onChange={(e) => handleInputChange('track_leads_for', e.target.value)}
                      placeholder="30"
                      min="1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newAffiliateData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <input
                      id="notify_on_lead"
                      type="checkbox"
                      checked={newAffiliateData.notify_on_lead}
                      onChange={(e) => handleInputChange('notify_on_lead', e.target.checked)}
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
                      checked={newAffiliateData.notify_on_sale}
                      onChange={(e) => handleInputChange('notify_on_sale', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notify_on_sale" className="ml-2 block text-sm text-gray-700">
                      Notify on Sale
                    </label>
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
                    disabled={isCreating || !newAffiliateData.code || !newAffiliateData.contact_id || !newAffiliateData.password}
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