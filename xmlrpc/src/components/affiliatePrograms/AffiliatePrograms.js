import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { toast } from 'react-toastify';
import { ProgramDetailsModal } from './ProgramDetailsModal';
import { formatKeapDate } from '../../utils/dateUtils';

export function AffiliatePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAffiliatePrograms();
  }, []);

  const fetchAffiliatePrograms = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await keapAPI.getAffiliatePrograms();
      
      if (result.success) {
        setPrograms(result.programs || []);
        if (showToast) {
          toast.success(`Found ${result.programs?.length || 0} affiliate programs`);
        }
      } else {
        throw new Error(result.error?.message || 'Failed to fetch affiliate programs');
      }
      
    } catch (error) {
      console.error('Error fetching affiliate programs:', error);
      const errorMessage = 'Failed to load affiliate programs. Please try again.';
      setError(errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAffiliatePrograms(true);
  };

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Programs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view all affiliate programs in your system
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading affiliate programs...</p>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Programs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view all affiliate programs in your system
            </p>
          </div>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Programs</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Programs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all affiliate programs in your system
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button>
            Create Program
          </Button>
        </div>
      </div>

      {/* Programs List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Programs</h3>
        </div>
        
        <div className="overflow-hidden">
          {programs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-sm text-gray-500 mb-6">
                No affiliate programs have been created yet. Create your first program to get started.
              </p>
              <Button>
                Create Your First Program
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {programs.map((program) => (
                <div key={program.Id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {program.Name || 'Untitled Program'}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          program.Status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.Status || 'Active'}
                        </span>
                      </div>
                      
                      {program.Notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          {program.Notes}
                        </p>
                      )}
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase">Program ID</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {program.Id}
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase">Priority</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {program.Priority || 1000}
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase">Affiliate ID</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {program.AffiliateId || 'None'}
                          </dd>
                        </div>
                      </div>
                      
                      {program.DateCreated && (
                        <div className="mt-3 flex items-center text-xs text-gray-500">
                          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Created: {formatKeapDate(program.DateCreated)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-6">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(program)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {programs.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">Program Summary</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-blue-700">Total Programs</dt>
                  <dd className="mt-1 text-2xl font-semibold text-blue-900">{programs.length}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-blue-700">Active Programs</dt>
                  <dd className="mt-1 text-2xl font-semibold text-blue-900">
                    {programs.filter(p => p.Status === 'Active').length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-blue-700">Programs with Notes</dt>
                  <dd className="mt-1 text-2xl font-semibold text-blue-900">
                    {programs.filter(p => p.Notes && p.Notes.trim()).length}
                  </dd>
                </div>
              </div>
            </div>
            <div className="text-blue-400">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V5a1 1 0 00-1-1zM4 9h12v6H4V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Program Details Modal */}
      <ProgramDetailsModal
        program={selectedProgram}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}