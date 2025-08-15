import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { ApplyTagToContactsModal } from './ApplyTagToContactsModal';

// Card component for compact sections
const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    <div className="px-4 py-3 border-b border-gray-200">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Compact table component
const CompactTable = ({ 
  data, 
  columns, 
  loading, 
  emptyMessage,
  onPrevious,
  onNext,
  canGoBack,
  canGoNext 
}) => (
  <div className="space-y-3">
    {loading ? (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-xs text-gray-500">Loading...</p>
      </div>
    ) : data.length === 0 ? (
      <p className="text-sm text-gray-500 text-center py-4">{emptyMessage}</p>
    ) : (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col, index) => (
                  <th key={index} className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, index) => (
                <tr key={item.contact?.id || item.company?.id || index} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="py-2 px-3">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Compact pagination */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">{data.length} items</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!canGoBack}
              onClick={onPrevious}
              className="px-2 py-1 text-xs"
            >
              ←
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!canGoNext}
              onClick={onNext}
              className="px-2 py-1 text-xs"
            >
              →
            </Button>
          </div>
        </div>
      </>
    )}
  </div>
);

export function TagDetails() {
  const { tagId } = useParams();
  const navigate = useNavigate();

  // Tag details state
  const [tag, setTag] = useState(null);
  const [loadingTag, setLoadingTag] = useState(false);

  // Companies state
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesOffset, setCompaniesOffset] = useState(0);
  const [companiesLimit] = useState(10);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsOffset, setContactsOffset] = useState(0);
  const [contactsLimit] = useState(10);

  // Modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  // Remove contacts state
  const [selectedContactsToRemove, setSelectedContactsToRemove] = useState(new Set());
  const [removingContacts, setRemovingContacts] = useState(false);

  // Fetch tag details
  const fetchTag = async () => {
    try {
      setLoadingTag(true);
      const tagData = await keapAPI.getTag(tagId);
      setTag(tagData);
    } catch (error) {
      console.error('Error fetching tag:', error);
    } finally {
      setLoadingTag(false);
    }
  };

  // Fetch tagged companies
  const fetchCompanies = async (offset = 0) => {
    try {
      setLoadingCompanies(true);
      const companiesData = await keapAPI.getTaggedCompanies(tagId, {
        limit: companiesLimit,
        offset
      });
      setCompanies(companiesData.companies || []);
      setCompaniesOffset(offset);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Fetch tagged contacts
  const fetchContacts = async (offset = 0) => {
    try {
      setLoadingContacts(true);
      const contactsData = await keapAPI.getTaggedContacts(tagId, {
        limit: contactsLimit,
        offset
      });
      setContacts(contactsData.contacts || []);
      setContactsOffset(offset);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (tagId) {
      fetchTag();
      fetchCompanies();
      fetchContacts();
    }
  }, [tagId]);

  // Pagination handlers
  const handleCompaniesPagination = (direction) => {
    const newOffset = direction === 'next' 
      ? companiesOffset + companiesLimit 
      : Math.max(0, companiesOffset - companiesLimit);
    fetchCompanies(newOffset);
  };

  const handleContactsPagination = (direction) => {
    const newOffset = direction === 'next' 
      ? contactsOffset + contactsLimit 
      : Math.max(0, contactsOffset - contactsLimit);
    fetchContacts(newOffset);
  };

  // Table columns definitions
  const companyColumns = [
    {
      header: 'ID',
      key: 'id',
      render: (item) => (
        <span className="text-xs font-mono text-gray-600">{item.company.id}</span>
      )
    },
    {
      header: 'Company',
      key: 'name',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.company.company_name}</div>
          {item.company.email && (
            <div className="text-xs text-gray-600">{item.company.email}</div>
          )}
        </div>
      )
    },
    {
      header: 'Date Applied',
      key: 'date_applied',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {new Date(item.date_applied).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Handle apply tag success
  const handleApplyTagSuccess = (count) => {
    console.log(`Tag applied to ${count} contacts`);
    // Refresh contacts to show newly tagged ones
    fetchContacts(contactsOffset);
  };

  // Handle removing individual contact from tag
  const handleRemoveContactFromTag = async (contactId) => {
    try {
      await keapAPI.tagRemoveTagFromContact(tagId, contactId);
      console.log(`Removed tag from contact ${contactId}`);
      // Refresh contacts list
      fetchContacts(contactsOffset);
    } catch (error) {
      console.error('Error removing tag from contact:', error);
    }
  };

  // Handle removing multiple contacts from tag
  const handleRemoveSelectedContacts = async () => {
    if (selectedContactsToRemove.size === 0) return;

    try {
      setRemovingContacts(true);
      await keapAPI.tagRemoveTagFromContacts(tagId, {
        ids: Array.from(selectedContactsToRemove)
      });
      console.log(`Removed tag from ${selectedContactsToRemove.size} contacts`);
      
      // Clear selection and refresh list
      setSelectedContactsToRemove(new Set());
      fetchContacts(contactsOffset);
    } catch (error) {
      console.error('Error removing tag from contacts:', error);
    } finally {
      setRemovingContacts(false);
    }
  };

  // Handle contact selection for removal
  const handleContactSelectionToggle = (contactId) => {
    const newSelected = new Set(selectedContactsToRemove);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactsToRemove(newSelected);
  };

  // Handle select all contacts for removal
  const handleSelectAllContactsForRemoval = () => {
    if (selectedContactsToRemove.size === contacts.length) {
      setSelectedContactsToRemove(new Set());
    } else {
      setSelectedContactsToRemove(new Set(contacts.map(item => item.contact.id)));
    }
  };

  const contactColumns = [
    {
      header: (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedContactsToRemove.size === contacts.length && contacts.length > 0}
            onChange={handleSelectAllContactsForRemoval}
            className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
          />
          <span>Select</span>
        </div>
      ),
      key: 'select',
      render: (item) => (
        <input
          type="checkbox"
          checked={selectedContactsToRemove.has(item.contact.id)}
          onChange={() => handleContactSelectionToggle(item.contact.id)}
          className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
        />
      )
    },
    {
      header: 'ID',
      key: 'id',
      render: (item) => (
        <span className="text-xs font-mono text-gray-600">{item.contact.id}</span>
      )
    },
    {
      header: 'Name',
      key: 'name',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.contact.first_name} {item.contact.last_name}
          </div>
          {item.contact.email && (
            <div className="text-xs text-gray-600">{item.contact.email}</div>
          )}
        </div>
      )
    },
    {
      header: 'Date Applied',
      key: 'date_applied',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {new Date(item.date_applied).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRemoveContactFromTag(item.contact.id)}
          className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
        >
          Remove
        </Button>
      )
    }
  ];

  if (loadingTag) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Tag not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tag.name}</h1>
            <p className="text-sm text-gray-600">Tag ID: {tag.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply to Contacts
          </Button>
        </div>
      </div>

      {/* Tag Information */}
      <Card title="Tag Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {tag.name}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Category:</span>
            <span className="ml-2 text-gray-900">
              {tag.category ? (
                <div>
                  <span className="font-medium">{tag.category.name}</span>
                  {tag.category.description && (
                    <span className="text-xs text-gray-500 ml-1">({tag.category.description})</span>
                  )}
                </div>
              ) : (
                'No category'
              )}
            </span>
          </div>

          {tag.description && (
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Description:</span>
              <p className="ml-2 text-gray-900 mt-1">{tag.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Tagged Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tagged Companies */}
        <Card title={`Tagged Companies (${companies.length})`}>
          <CompactTable
            data={companies}
            columns={companyColumns}
            loading={loadingCompanies}
            emptyMessage="No companies found with this tag"
            onPrevious={() => handleCompaniesPagination('previous')}
            onNext={() => handleCompaniesPagination('next')}
            canGoBack={companiesOffset > 0}
            canGoNext={companies.length >= companiesLimit}
          />
        </Card>

        {/* Tagged Contacts */}
        <Card title={`Tagged Contacts (${contacts.length})`}>
          {/* Bulk Actions for Contacts */}
          {selectedContactsToRemove.size > 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">
                  {selectedContactsToRemove.size} contact(s) selected for removal
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedContactsToRemove(new Set())}
                    className="text-gray-600"
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={handleRemoveSelectedContacts}
                    disabled={removingContacts}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    {removingContacts ? 'Removing...' : `Remove ${selectedContactsToRemove.size} Contact(s)`}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <CompactTable
            data={contacts}
            columns={contactColumns}
            loading={loadingContacts}
            emptyMessage="No contacts found with this tag"
            onPrevious={() => handleContactsPagination('previous')}
            onNext={() => handleContactsPagination('next')}
            canGoBack={contactsOffset > 0}
            canGoNext={contacts.length >= contactsLimit}
          />
        </Card>
      </div>

      {/* Apply Tag Modal */}
      <ApplyTagToContactsModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        tagId={tag.id}
        tagName={tag.name}
        onSuccess={handleApplyTagSuccess}
      />
    </div>
  );
}