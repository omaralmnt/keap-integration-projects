import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { formatKeapDate } from '../../utils/dateUtils';

export function ProgramDetailsModal({ program, isOpen, onClose }) {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [activeTab, setActiveTab] = useState('affiliates');

  useEffect(() => {
    if (isOpen && program) {
      fetchAffiliates();
      fetchResources();
    }
  }, [isOpen, program]);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const result = await keapAPI.getAffiliatesByProgram(program.Id);
      
      if (result.success) {
        setAffiliates(result.affiliates || []);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch affiliates');
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast.error('Error fetching program affiliates. Please try again.');
      setAffiliates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const result = await keapAPI.getResourcesForAffiliateProgram(program.Id);
      
      if (result.success) {
        setResources(result.resources || []);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Error fetching program resources. Please try again.');
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getResourceTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'image':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'link':
      case 'url':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {program?.Name || 'Program Details'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Program ID: {program?.Id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-[600px] overflow-y-auto">
            {/* Program Information */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Program Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{program?.Name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1 text-sm text-gray-900">{program?.Priority || 'N/A'}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {program?.Notes || program?.Description || 'No notes available'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatKeapDate(program?.DateCreated) || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      program?.Status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {program?.Status || 'Active'}
                    </span>
                  </dd>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('affiliates')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'affiliates'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Affiliates ({affiliates.length})
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'resources'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Resources ({resources.length})
                </button>
              </nav>
            </div>

            {/* Affiliates Section */}
            {activeTab === 'affiliates' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  Program Affiliates ({affiliates.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAffiliates}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading affiliates...</span>
                </div>
              ) : affiliates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No affiliates found</h3>
                  <p className="text-sm text-gray-500">
                    No affiliates are currently assigned to this program.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Amt</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Amt</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.Id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {affiliate.AffCode || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {affiliate.AffName || 'No name'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              affiliate.Status === 1 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {getStatusLabel(affiliate.Status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {getCommissionTypeLabel(affiliate.DefCommissionType)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="text-xs">
                              <div>{formatCurrency(affiliate.LeadAmt)}</div>
                              <div className="text-gray-500">{formatPercent(affiliate.LeadPercent)}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="text-xs">
                              <div>{formatCurrency(affiliate.SaleAmt)}</div>
                              <div className="text-gray-500">{formatPercent(affiliate.SalePercent)}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <Link
                              to={`/affiliates/profile/${affiliate.Id}`}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              onClick={onClose}
                            >
                              View Profile
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            )}

            {/* Resources Section */}
            {activeTab === 'resources' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  Program Resources ({resources.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchResources}
                  disabled={loadingResources}
                >
                  {loadingResources ? 'Loading...' : 'Refresh'}
                </Button>
              </div>

              {loadingResources ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading resources...</span>
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No resources found</h3>
                  <p className="text-sm text-gray-500">
                    No resources are currently available for this program.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getResourceTypeIcon(resource.Type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {resource.Name || 'Untitled Resource'}
                            </h5>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              resource.Status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {resource.Status || 'Active'}
                            </span>
                          </div>
                          
                          {resource.Description && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                              {resource.Description}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {resource.Type && (
                                <span className="text-xs text-gray-500 capitalize">
                                  {resource.Type}
                                </span>
                              )}
                              {resource.FileSize && (
                                <span className="text-xs text-gray-500">
                                  {formatFileSize(resource.FileSize)}
                                </span>
                              )}
                            </div>
                            
                            {resource.URL && (
                              <a
                                href={resource.URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                              >
                                <span>Open</span>
                                <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                          
                          {resource.DateCreated && (
                            <div className="mt-2 text-xs text-gray-500">
                              Created: {formatKeapDate(resource.DateCreated) || 'N/A'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}