import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Users, UserMinus2, UserPlus, UserMinus, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import keapAPI from '../../services/keapAPI';
import ContactSelector from '../misc/ContactSelector';

// Card component for sections
const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
};

// Stat component for metrics
const Stat = ({ label, value, description }) => {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
    </div>
  );
};

// Badge component
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Results Modal Component for Add/Remove Contacts
const ResultsModal = ({ isOpen, onClose, results, contactMap, operation = 'add' }) => {
  if (!isOpen) return null;

  const successCount = Object.values(results).filter(r => r === "SUCCESS" || r.success).length;
  const alreadyInSequenceCount = Object.values(results).filter(r => r === "ALREADY_IN_SEQUENCE").length;
  const notInSequenceCount = Object.values(results).filter(r => r === "NOT_IN_SEQUENCE").length;
  const totalCount = Object.keys(results).length;

  const getOperationText = () => {
    if (operation === 'remove') {
      return {
        title: 'Remove Contacts Results',
        successText: 'removed successfully',
        alreadyText: 'not in sequence',
        failText: 'failed to remove'
      };
    }
    return {
      title: 'Add Contacts Results',
      successText: 'added successfully',
      alreadyText: 'already in sequence',
      failText: 'failed to add'
    };
  };

  const operationText = getOperationText();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center mb-4">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                successCount === totalCount ? 'bg-green-100' : 
                (alreadyInSequenceCount === totalCount || notInSequenceCount === totalCount) ? 'bg-blue-100' :
                'bg-yellow-100'
              } sm:mx-0 sm:h-10 sm:w-10`}>
                {successCount === totalCount ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (alreadyInSequenceCount === totalCount || notInSequenceCount === totalCount) ? (
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {operationText.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {successCount > 0 && `${successCount} contacts ${operationText.successText}`}
                  {successCount > 0 && (alreadyInSequenceCount > 0 || notInSequenceCount > 0) && ', '}
                  {alreadyInSequenceCount > 0 && `${alreadyInSequenceCount} ${operationText.alreadyText}`}
                  {notInSequenceCount > 0 && `${notInSequenceCount} ${operationText.alreadyText}`}
                  {successCount === 0 && alreadyInSequenceCount === 0 && notInSequenceCount === 0 && `${totalCount} contacts ${operationText.failText}`}
                </p>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {Object.entries(results).map(([contactId, result]) => {
                const contactName = contactMap[contactId];
                const getStatusIcon = () => {
                  if (result === "SUCCESS" || result.success) {
                    return <CheckCircle className="h-4 w-4 text-green-500" />;
                  }
                  if (result === "ALREADY_IN_SEQUENCE" || result === "NOT_IN_SEQUENCE") {
                    return <CheckCircle className="h-4 w-4 text-blue-500" />;
                  }
                  return <XCircle className="h-4 w-4 text-red-500" />;
                };

                const getStatusColor = () => {
                  if (result === "SUCCESS" || result.success) {
                    return 'bg-green-50 border-green-200 text-green-800';
                  }
                  if (result === "ALREADY_IN_SEQUENCE" || result === "NOT_IN_SEQUENCE") {
                    return 'bg-blue-50 border-blue-200 text-blue-800';
                  }
                  return 'bg-red-50 border-red-200 text-red-800';
                };

                return (
                  <div key={contactId} className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor()}`}>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon()}
                      <div>
                        <div className="text-sm font-medium">
                          {contactName || `Contact ${contactId}`}
                        </div>
                        <div className="text-xs opacity-75">ID: {contactId}</div>
                      </div>
                    </div>
                    <div className="text-xs">
                      {result === "SUCCESS" || result.success ? operationText.successText : 
                       result === "ALREADY_IN_SEQUENCE" ? (operation === 'add' ? 'Already in sequence' : 'Already in sequence') :
                       result === "NOT_IN_SEQUENCE" ? 'Not in sequence' :
                       result.error || result || `Failed to ${operation}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function CampaignDetails() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for adding/removing contacts to/from sequence
  const [isContactSelectorOpen, setIsContactSelectorOpen] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState(null);
  const [isProcessingContacts, setIsProcessingContacts] = useState(false);
  const [contactsResults, setContactsResults] = useState(null);
  const [contactMap, setContactMap] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('add'); // 'add' or 'remove'
  const [singleContactMode, setSingleContactMode] = useState(false); // true for single contact operations

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await keapAPI.getCampaignById(campaignId);
      setCampaign(data);
    } catch (err) {
      setError('Failed to load campaign details');
      console.error('Error fetching campaign details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding contacts to a sequence (multiple)
  const handleAddContactsClick = (sequenceId) => {
    setSelectedSequenceId(sequenceId);
    setCurrentOperation('add');
    setSingleContactMode(false);
    setIsContactSelectorOpen(true);
  };

  // Handle removing contacts from a sequence (multiple)
  const handleRemoveContactsClick = (sequenceId) => {
    setSelectedSequenceId(sequenceId);
    setCurrentOperation('remove');
    setSingleContactMode(false);
    setIsContactSelectorOpen(true);
  };

  // Handle adding a single contact to a sequence
  const handleAddSingleContactClick = (sequenceId) => {
    setSelectedSequenceId(sequenceId);
    setCurrentOperation('add');
    setSingleContactMode(true);
    setIsContactSelectorOpen(true);
  };

  // Handle removing a single contact from a sequence
  const handleRemoveSingleContactClick = (sequenceId) => {
    setSelectedSequenceId(sequenceId);
    setCurrentOperation('remove');
    setSingleContactMode(true);
    setIsContactSelectorOpen(true);
  };

  const handleContactsSelected = async (selectedContacts) => {
    if (!selectedContacts || !selectedSequenceId) {
      return;
    }

    // Normalize selectedContacts to always be an array
    const contactsArray = Array.isArray(selectedContacts) ? selectedContacts : [selectedContacts];
    
    if (contactsArray.length === 0) {
      return;
    }

    setIsProcessingContacts(true);
    
    try {
      // Create contact map for display purposes
      const map = {};
      contactsArray.forEach(contact => {
        const name = [contact.given_name, contact.family_name]
          .filter(Boolean)
          .join(' ') || contact.preferred_name || `Contact ${contact.id}`;
        map[contact.id] = name;
      });
      setContactMap(map);

      console.log(`${currentOperation === 'add' ? 'Adding' : 'Removing'} contacts to/from sequence:`, {
        campaignId,
        sequenceId: selectedSequenceId,
        contactIds: contactsArray.map(c => c.id),
        operation: currentOperation,
        singleMode: singleContactMode
      });

      let response;
      
      if (singleContactMode && contactsArray.length === 1) {
        // Use single contact API functions
        const contactId = contactsArray[0].id;
        
        if (currentOperation === 'add') {
          response = await keapAPI.addContactFromCampaignSequence(campaignId, selectedSequenceId, contactId);
        } else {
          response = await keapAPI.deleteContactFromCampaignSequence(campaignId, selectedSequenceId, contactId);
        }
        
        // Normalize single contact response to match bulk format
        response = { [contactId]: response.success !== false ? "SUCCESS" : response.error || "FAILED" };
        
      } else {
        // Use bulk API functions
        const requestBody = {
          ids: contactsArray.map(contact => parseInt(contact.id))
        };

        if (currentOperation === 'add') {
          response = await keapAPI.addContactsToCampaignSequence(campaignId, selectedSequenceId, requestBody);
        } else {
          response = await keapAPI.deleteContactsFromCampaignSequence(campaignId, selectedSequenceId, requestBody);
        }
      }
      
      console.log(`${currentOperation === 'add' ? 'Add' : 'Remove'} contacts response:`, response);
      
      setContactsResults(response);
      setShowResults(true);
      
      // Refresh campaign data to show updated counts
      fetchCampaignDetails();

    } catch (error) {
      console.error(`Error ${currentOperation === 'add' ? 'adding' : 'removing'} contacts:`, error);
      
      // Create error results for display
      const errorResults = {};
      contactsArray.forEach(contact => {
        errorResults[contact.id] = {
          success: false,
          error: error.message || `Failed to ${currentOperation} contact`
        };
      });
      
      setContactsResults(errorResults);
      setShowResults(true);
    } finally {
      setIsProcessingContacts(false);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setContactsResults(null);
    setContactMap({});
    setSelectedSequenceId(null);
    setCurrentOperation('add');
    setSingleContactMode(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const formatStatus = (campaign) => {
    if (campaign.published_status) {
      return <Badge variant="success">Published</Badge>;
    }
    return <Badge variant="warning">Draft</Badge>;
  };

  const getGoalTypeVariant = (type) => {
    const typeVariants = {
      'WebForm': 'info',
      'Tag': 'default',
      'Purchase': 'success'
    };
    return typeVariants[type] || 'default';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={fetchCampaignDetails}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/campaigns')}
        >
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            {formatStatus(campaign)}
            {campaign.locked && <Badge variant="danger">Locked</Badge>}
          </div>
          <p className="text-sm text-gray-500 mt-1">Campaign ID: {campaign.id}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/campaigns')}>
            Back to Campaigns
          </Button>
          <Button>
            Edit Campaign
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {campaign.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {campaign.error_message}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <Card title="Campaign Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Stat 
            label="Active Contacts" 
            value={campaign.active_contact_count || 0}
            description="Currently in campaign"
          />
          <Stat 
            label="Completed Contacts" 
            value={campaign.completed_contact_count || 0}
            description="Finished campaign"
          />
          <Stat 
            label="Goals" 
            value={campaign.goals?.length || 0}
            description="Campaign objectives"
          />
          <Stat 
            label="Sequences" 
            value={campaign.sequences?.length || 0}
            description="Automation sequences"
          />
        </div>
      </Card>

      {/* Campaign Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Campaign Information">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Created Date:</span>
              <span className="text-sm text-gray-900">{formatDate(campaign.date_created)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Published Date:</span>
              <span className="text-sm text-gray-900">{formatDate(campaign.published_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Time Zone:</span>
              <span className="text-sm text-gray-900">{campaign.time_zone || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Published Time Zone:</span>
              <span className="text-sm text-gray-900">{campaign.published_time_zone || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Created By:</span>
              <span className="text-sm text-gray-900">{campaign.created_by_global_id || 'Unknown'}</span>
            </div>
          </div>
        </Card>

        {/* Goals */}
        <Card title="Campaign Goals">
          {campaign.goals && campaign.goals.length > 0 ? (
            <div className="space-y-4">
              {campaign.goals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{goal.name}</h4>
                    <Badge variant={getGoalTypeVariant(goal.type)}>{goal.type}</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">Goal ID: {goal.id}</div>
                  
                  {goal.historical_contact_counts && (
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {goal.historical_contact_counts['24_hours']}
                        </div>
                        <div className="text-xs text-gray-500">Last 24 hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {goal.historical_contact_counts['30_days']}
                        </div>
                        <div className="text-xs text-gray-500">Last 30 days</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    <div>Next Sequences: {goal.next_sequence_ids?.join(', ') || 'None'}</div>
                    <div>Previous Sequences: {goal.previous_sequence_ids?.join(', ') || 'None'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No goals configured for this campaign.</p>
          )}
        </Card>
      </div>

      {/* Sequences */}
      <Card title="Campaign Sequences">
        {campaign.sequences && campaign.sequences.length > 0 ? (
          <div className="space-y-6">
            {campaign.sequences.map((sequence) => (
              <div key={sequence.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{sequence.name}</h4>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">Sequence ID: {sequence.id}</div>
                    <div className="flex space-x-2">
                      {/* Multiple contacts buttons */}
                      <Button
                        onClick={() => handleAddContactsClick(sequence.id)}
                        disabled={isProcessingContacts}
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center relative"
                        title="Add multiple contacts"
                      >
                        {isProcessingContacts && selectedSequenceId === sequence.id && currentOperation === 'add' && !singleContactMode ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <div className="relative">
                            <Users className="h-4 w-4" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold leading-none">+</span>
                            </div>
                          </div>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleRemoveContactsClick(sequence.id)}
                        disabled={isProcessingContacts}
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center text-red-600 border-red-300 hover:bg-red-50 relative"
                        title="Remove multiple contacts"
                      >
                        {isProcessingContacts && selectedSequenceId === sequence.id && currentOperation === 'remove' && !singleContactMode ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <div className="relative">
                            <Users className="h-4 w-4" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold leading-none">-</span>
                            </div>
                          </div>
                        )}
                      </Button>
                      
                      {/* Single contact buttons */}
                      <div className="border-l border-gray-300 pl-2 ml-2 flex space-x-1">
                        <Button
                          onClick={() => handleAddSingleContactClick(sequence.id)}
                          disabled={isProcessingContacts}
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center p-1.5"
                          title="Add single contact"
                        >
                          {isProcessingContacts && selectedSequenceId === sequence.id && currentOperation === 'add' && singleContactMode ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          ) : (
                            <UserPlus className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleRemoveSingleContactClick(sequence.id)}
                          disabled={isProcessingContacts}
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center text-red-600 border-red-300 hover:bg-red-50 p-1.5"
                          title="Remove single contact"
                        >
                          {isProcessingContacts && selectedSequenceId === sequence.id && currentOperation === 'remove' && singleContactMode ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                          ) : (
                            <UserMinus className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sequence Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{sequence.active_contact_count || 0}</div>
                    <div className="text-sm text-gray-500">Active Contacts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{sequence.active_contact_count_completed || 0}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-600">{sequence.paths?.length || 0}</div>
                    <div className="text-sm text-gray-500">Paths</div>
                  </div>
                </div>

                {/* Historical Contact Count */}
                {sequence.historical_contact_count && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-lg font-semibold text-gray-900">
                        {sequence.historical_contact_count['24_hours']}
                      </div>
                      <div className="text-sm text-gray-500">Last 24 hours</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-lg font-semibold text-gray-900">
                        {sequence.historical_contact_count['30_days']}
                      </div>
                      <div className="text-sm text-gray-500">Last 30 days</div>
                    </div>
                  </div>
                )}

                {/* Paths */}
                {sequence.paths && sequence.paths.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Sequence Paths</h5>
                    <div className="space-y-2">
                      {sequence.paths.map((path) => (
                        <div key={path.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Path ID: {path.id}</span>
                            <span className="text-xs text-gray-500">{path.items?.length || 0} items</span>
                          </div>
                          
                          {path.items && path.items.length > 0 && (
                            <div className="space-y-1">
                              {path.items.slice(0, 3).map((item) => (
                                <div key={item.id} className="text-xs text-gray-600 flex items-center justify-between">
                                  <span>{item.name}</span>
                                  <Badge variant="default">{item.type}</Badge>
                                </div>
                              ))}
                              {path.items.length > 3 && (
                                <div className="text-xs text-gray-400">
                                  +{path.items.length - 3} more items
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No sequences configured for this campaign.</p>
        )}
      </Card>

      {/* Contact Selector Modal */}
      <ContactSelector
        isOpen={isContactSelectorOpen}
        onClose={() => setIsContactSelectorOpen(false)}
        onSelect={handleContactsSelected}
        mode={singleContactMode ? "single" : "multiple"}
        selectedContactIds={[]}
      />

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResults}
        onClose={handleCloseResults}
        results={contactsResults || {}}
        contactMap={contactMap}
        operation={currentOperation}
      />
    </div>
  );
}