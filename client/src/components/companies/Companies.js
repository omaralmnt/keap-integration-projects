import { useState } from 'react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import keapAPI from '../../services/keapAPI';

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

// Main Companies Component
export function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  // Search parameters
  const [companyName, setCompanyName] = useState('');
  const [limit, setLimit] = useState(3);
  const [offset, setOffset] = useState(0);
  const [order, setOrder] = useState('date_created');
  const [orderDirection, setOrderDirection] = useState('DESCENDING');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Create form data
  const [createForm, setCreateForm] = useState({
    company_name: '',
    email_address: '',
    website: '',
    notes: '',
    opt_in_reason: '',
    phone_number: {
      number: '',
      extension: '',
      type: 'Work'
    },
    fax_number: {
      number: '',
      type: 'Work'
    },
    address: {
      line1: '',
      line2: '',
      locality: '',
      region: '',
      zip_code: '',
      zip_four: '',
      country_code: ''
    }
  });

  // Update form data (will be populated when editing)
  const [updateForm, setUpdateForm] = useState({
    company_name: '',
    email_address: '',
    website: '',
    notes: '',
    opt_in_reason: '',
    phone_number: {
      number: '',
      extension: '',
      type: 'Work'
    },
    fax_number: {
      number: '',
      type: 'Work'
    },
    address: {
      line1: '',
      line2: '',
      locality: '',
      region: '',
      zip_code: '',
      zip_four: '',
      country_code: ''
    }
  });

  // Search function - TÚ IMPLEMENTARÁS LA LÓGICA DE API
  const handlePagination = async (action) => {
    let data
    if (action =='next') {
       data = await keapAPI.getContactsPaginated(next)
    }else{
       data = await keapAPI.getContactsPaginated(previous)
    }
    console.log(data)
    setNext(data.next)
    setPrevious(data.previous)
    setCompanies(data.companies)
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        company_name: companyName,
        limit,
        offset,
        order,
        order_direction: orderDirection
      };

      const data =  await keapAPI.getCompanies(queryParams)
      setNext(data.next)
      setPrevious(data.previous)
      console.log(data)
      setCompanies(data.companies)
    } catch (error) {
      console.log(error);   
    } finally {
      setLoading(false);
    }
  };

  const newCompany = () => {
    setShowCreateModal(true);
  };

  const editCompany = (company) => {
    setSelectedCompany(company);
    // Populate update form with company data
    setUpdateForm({
      company_name: company.company_name || '',
      email_address: company.email_address || '',
      website: company.website || '',
      notes: company.notes || '',
      opt_in_reason: company.opt_in_reason || '',
      phone_number: {
        number: company.phone_number?.number || '',
        extension: company.phone_number?.extension || '',
        type: company.phone_number?.type || 'Work'
      },
      fax_number: {
        number: company.fax_number?.number || '',
        type: company.fax_number?.type || 'Work'
      },
      address: {
        line1: company.address?.line1 || '',
        line2: company.address?.line2 || '',
        locality: company.address?.locality || '',
        region: company.address?.region || '',
        zip_code: company.address?.zip_code || '',
        zip_four: company.address?.zip_four || '',
        country_code: company.address?.country_code || ''
      }
    });
    setShowUpdateModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      console.log('Creating company:', createForm);
      await keapAPI.createCompany(createForm)
      // Cerrar modal y resetear form
      setShowCreateModal(false);
      setCreateForm({
        company_name: '',
        email_address: '',
        website: '',
        notes: '',
        opt_in_reason: '',
        phone_number: {
          number: '',
          extension: '',
          type: 'Work'
        },
        fax_number: {
          number: '',
          type: 'Work'
        },
        address: {
          line1: '',
          line2: '',
          locality: '',
          region: '',
          zip_code: '',
          zip_four: '',
          country_code: ''
        }
      });
      
      // Refresh the companies list
      handleSearch();
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      setLoading(true);
      console.log('Updating company:', selectedCompany.id, updateForm);
      await keapAPI.updateCompany(selectedCompany.id, updateForm);
      // Cerrar modal y resetear form
      setShowUpdateModal(false);
      setSelectedCompany(null);
      setUpdateForm({
        company_name: '',
        email_address: '',
        website: '',
        notes: '',
        opt_in_reason: '',
        phone_number: {
          number: '',
          extension: '',
          type: 'Work'
        },
        fax_number: {
          number: '',
          type: 'Work'
        },
        address: {
          line1: '',
          line2: '',
          locality: '',
          region: '',
          zip_code: '',
          zip_four: '',
          country_code: ''
        }
      });
      
      // Refresh the companies list
      handleSearch();
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCreateForm = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCreateForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCreateForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const updateUpdateForm = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUpdateForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUpdateForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Companies</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Company Name</label>
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
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
              <option value="date_created">Date Created</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
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
          <Button variant="secondary" onClick={newCompany}>
            Create
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({companies.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No companies found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">{company.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {company.company_name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {company.website ? (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {company.website}
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {company.phone_number?.number || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {company.email_address || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.email_status === 'SingleOptIn' 
                          ? 'bg-green-100 text-green-800' 
                          : company.email_status === 'NonMarketable'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.email_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {[company.address?.locality, company.address?.region, company.address?.country_code]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editCompany(company)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && companies.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={!previous}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('previous')}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!next}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Company</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateSubmit(); }} className="space-y-6">
                {/* Company Name - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={createForm.company_name}
                    onChange={(e) => updateCreateForm('company_name', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={createForm.email_address}
                      onChange={(e) => updateCreateForm('email_address', e.target.value)}
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <Input
                      value={createForm.website}
                      onChange={(e) => updateCreateForm('website', e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                {/* Email Opt-in */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Opt-in Reason</label>
                  <Input
                    value={createForm.opt_in_reason}
                    onChange={(e) => updateCreateForm('opt_in_reason', e.target.value)}
                    placeholder="Reason for email opt-in"
                  />
                </div>

                {/* Phone & Fax */}
                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="flex gap-2">
                      <Input
                        value={createForm.phone_number.number}
                        onChange={(e) => updateCreateForm('phone_number.number', e.target.value)}
                        placeholder="Phone number"
                        className="w-16"
                      />
                      <Input
                        value={createForm.phone_number.extension}
                        onChange={(e) => updateCreateForm('phone_number.extension', e.target.value)}
                        placeholder="Ext"
                        className=""
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                    <Input
                      value={createForm.fax_number.number}
                      onChange={(e) => updateCreateForm('fax_number.number', e.target.value)}
                      placeholder="Fax number"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="space-y-3">
                    <Input
                      value={createForm.address.line1}
                      onChange={(e) => updateCreateForm('address.line1', e.target.value)}
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={createForm.address.locality}
                        onChange={(e) => updateCreateForm('address.locality', e.target.value)}
                        placeholder="City"
                      />
                      <Input
                        value={createForm.address.region}
                        onChange={(e) => updateCreateForm('address.region', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={createForm.address.zip_code}
                        onChange={(e) => updateCreateForm('address.zip_code', e.target.value)}
                        placeholder="ZIP"
                      />
                      <Input
                        value={createForm.address.zip_four}
                        onChange={(e) => updateCreateForm('address.zip_four', e.target.value)}
                        placeholder="ZIP+4"
                      />
                      <Input
                        value={createForm.address.country_code}
                        onChange={(e) => updateCreateForm('address.country_code', e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => updateCreateForm('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows="3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !createForm.company_name.trim()}
                  >
                    {loading ? 'Creating...' : 'Create Company'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Company Modal */}
      {showUpdateModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Update Company - {selectedCompany.company_name}</h3>
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedCompany(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateSubmit(); }} className="space-y-6">
                {/* Company Name - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={updateForm.company_name}
                    onChange={(e) => updateUpdateForm('company_name', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={updateForm.email_address}
                      onChange={(e) => updateUpdateForm('email_address', e.target.value)}
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <Input
                      value={updateForm.website}
                      onChange={(e) => updateUpdateForm('website', e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                {/* Email Opt-in */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Opt-in Reason</label>
                  <Input
                    value={updateForm.opt_in_reason}
                    onChange={(e) => updateUpdateForm('opt_in_reason', e.target.value)}
                    placeholder="Reason for email opt-in"
                  />
                </div>

                {/* Phone & Fax */}
                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="flex gap-2">
                      <Input
                        value={updateForm.phone_number.number}
                        onChange={(e) => updateUpdateForm('phone_number.number', e.target.value)}
                        placeholder="Phone number"
                        className="w-16"
                      />
                      <Input
                        value={updateForm.phone_number.extension}
                        onChange={(e) => updateUpdateForm('phone_number.extension', e.target.value)}
                        placeholder="Ext"
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                    <Input
                      value={updateForm.fax_number.number}
                      onChange={(e) => updateUpdateForm('fax_number.number', e.target.value)}
                      placeholder="Fax number"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="space-y-3">
                    <Input
                      value={updateForm.address.line1}
                      onChange={(e) => updateUpdateForm('address.line1', e.target.value)}
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={updateForm.address.locality}
                        onChange={(e) => updateUpdateForm('address.locality', e.target.value)}
                        placeholder="City"
                      />
                      <Input
                        value={updateForm.address.region}
                        onChange={(e) => updateUpdateForm('address.region', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={updateForm.address.zip_code}
                        onChange={(e) => updateUpdateForm('address.zip_code', e.target.value)}
                        placeholder="ZIP"
                      />
                      <Input
                        value={updateForm.address.zip_four}
                        onChange={(e) => updateUpdateForm('address.zip_four', e.target.value)}
                        placeholder="ZIP+4"
                      />
                      <Input
                        value={updateForm.address.country_code}
                        onChange={(e) => updateUpdateForm('address.country_code', e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={updateForm.notes}
                    onChange={(e) => updateUpdateForm('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows="3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedCompany(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !updateForm.company_name.trim()}
                  >
                    {loading ? 'Updating...' : 'Update Company'}
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