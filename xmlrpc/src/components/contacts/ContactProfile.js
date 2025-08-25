import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { User, Mail, Phone, MapPin, ArrowLeft, Edit2, Save, X, Clock, Tag, Globe, Printer, Plus, Trash2, AlertTriangle, UserPlus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import keapAPI from '../../services/keapAPI';
import { CreditCardSection } from './CreditCardSection'; // Import the new component
import { EmailSection } from './EmailSection';
import { TagSection } from './TagSection';
import ContactSelector from '../misc/ContactSelector';
import { LinkedContactsSection } from './LinkedContactSection';

const Input = ({ type = 'text', placeholder, value, onChange, ...props }) => (
  <input 
    type={type} 
    placeholder={placeholder} 
    value={value || ''} 
    onChange={onChange}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
    {...props} 
  />
);

const Select = ({ value, onChange, children, ...props }) => (
  <select value={value || ''} onChange={onChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" {...props}>
    {children}
  </select>
);

const InfoItem = ({ label, value }) => (
  <div className="mb-2">
    <span className="text-sm font-medium text-gray-500">{label}: </span>
    <span className="text-sm text-gray-900">{value || 'Not provided'}</span>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <Icon className="h-5 w-5 mr-2" />{title}
    </h3>
    {children}
  </div>
);

// Email Opt-In Status Component
const EmailOptInStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 0:
        return { 
          icon: XCircle, 
          text: 'Opt Out / Non-Marketable', 
          color: 'text-red-600 bg-red-50 border-red-200',
          iconColor: 'text-red-600'
        };
      case 1:
        return { 
          icon: CheckCircle, 
          text: 'Single Opt-In', 
          color: 'text-green-600 bg-green-50 border-green-200',
          iconColor: 'text-green-600'
        };
      case 2:
        return { 
          icon: CheckCircle, 
          text: 'Double Opt-In', 
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600'
        };
      default:
        return { 
          icon: AlertCircle, 
          text: 'Unknown', 
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const { icon: Icon, text, color, iconColor } = getStatusInfo();

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${color}`}>
      <Icon className={`h-3 w-3 mr-1 ${iconColor}`} />
      {text}
    </div>
  );
};

// Email Opt-In/Out Modal
const EmailOptModal = ({ isOpen, onClose, onConfirm, email, action, isLoading }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isOptIn = action === 'opt-in';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          {isOptIn ? (
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600 mr-2" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {isOptIn ? 'Opt In Email' : 'Opt Out Email'}
          </h3>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-3">
            {isOptIn 
              ? `Opt in the email address: ${email}`
              : `Opt out the email address: ${email}`
            }
          </p>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason {isOptIn ? '(optional)' : '(required)'}
            </label>
            <Input
              id="reason"
              placeholder={isOptIn ? 'Optional reason for opt-in' : 'Reason for opt-out'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex space-x-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(reason)}
            disabled={isLoading || (!isOptIn && !reason.trim())}
            className={isOptIn 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isOptIn ? 'Opting In...' : 'Opting Out...'}
              </>
            ) : (
              <>
                {isOptIn ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                {isOptIn ? 'Opt In' : 'Opt Out'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, contactName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Contact</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{contactName}</strong>? This action cannot be undone.
        </p>
        
        <div className="flex space-x-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Contact
          </Button>
        </div>
      </div>
    </div>
  );
};

// Merge Confirmation Modal
const MergeConfirmationModal = ({ isOpen, onClose, onConfirm, currentContactName, targetContactName, isMerging }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Merge Contacts</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to merge <strong>{currentContactName}</strong> with <strong>{targetContactName}</strong>?
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What happens when contacts are merged:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• The target contact will be kept as the primary contact</li>
              <li>• All data from the current contact will be merged into the target contact</li>
              <li>• The current contact will be deleted after the merge</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isMerging}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isMerging}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isMerging ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Merging...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Confirm Merge
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export function ContactProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Email opt-in/out state
  const [emailOptInStatuses, setEmailOptInStatuses] = useState({});
  const [loadingOptInStatuses, setLoadingOptInStatuses] = useState(true);
  const [showOptModal, setShowOptModal] = useState(false);
  const [selectedEmailForOpt, setSelectedEmailForOpt] = useState(null);
  const [optAction, setOptAction] = useState(''); // 'opt-in' or 'opt-out'
  const [isOptActionLoading, setIsOptActionLoading] = useState(false);
  
  // Merge functionality state
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showMergeConfirmation, setShowMergeConfirmation] = useState(false);
  const [selectedContactForMerge, setSelectedContactForMerge] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [id]);

  useEffect(() => {
    if (contact?.email_addresses && contact.email_addresses.length > 0) {
      fetchEmailOptInStatuses();
    }
  }, [contact]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const contactData = await keapAPI.getContactById(id);
      const linkedContacts = await keapAPI.getLinkedContacts(id);
      console.log('linked con ', linkedContacts);
      setContact(contactData);
      console.log(contactData);
      setEditData(contactData);
    } catch (err) {
      setError('Failed to load contact: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailOptInStatuses = async () => {
    if (!contact?.email_addresses) return;

    try {
      setLoadingOptInStatuses(true);
      const statuses = {};
      
      for (const emailObj of contact.email_addresses) {
        try {
          const response = await keapAPI.getOptInStatus(emailObj.email);
          if (response.success) {
            statuses[emailObj.email] = response.result;
          } else {
            console.error(`Failed to get opt-in status for ${emailObj.email}:`, response.error);
            statuses[emailObj.email] = null;
          }
        } catch (err) {
          console.error(`Failed to get opt-in status for ${emailObj.email}:`, err);
          statuses[emailObj.email] = null;
        }
      }
      
      setEmailOptInStatuses(statuses);
    } catch (err) {
      console.error('Failed to fetch email opt-in statuses:', err);
    } finally {
      setLoadingOptInStatuses(false);
    }
  };

  const handleEmailOptAction = async (email, action) => {
    setSelectedEmailForOpt(email);
    setOptAction(action);
    setShowOptModal(true);
  };

  const confirmOptAction = async (reason) => {
    if (!selectedEmailForOpt) return;

    try {
      setIsOptActionLoading(true);
      setError('');

      if (optAction === 'opt-in') {
        await keapAPI.optInEmail(selectedEmailForOpt, reason);
      } else {
        await keapAPI.optOutEmail(selectedEmailForOpt, reason);
      }

      // Refresh the opt-in status for this email
      const statusResponse = await keapAPI.getOptInStatus(selectedEmailForOpt);
      if (statusResponse.success) {
        setEmailOptInStatuses(prev => ({
          ...prev,
          [selectedEmailForOpt]: statusResponse.result
        }));
      }

      setShowOptModal(false);
      setSelectedEmailForOpt(null);
      setOptAction('');
    } catch (err) {
      setError(`Failed to ${optAction} email: ${err.message}`);
    } finally {
      setIsOptActionLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log(editData);
      await keapAPI.updateContact(id, editData);

      setContact(editData);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to save contact: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await keapAPI.deleteContact(id);
      navigate('/contacts', { 
        state: { 
          message: `Contact "${getFullName()}" has been deleted successfully.`,
          type: 'success'
        }
      });
    } catch (err) {
      setError('Failed to delete contact: ' + err.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle merge contact selection
  const handleMergeContactSelect = (selectedContact) => {
    if (selectedContact && selectedContact.id !== parseInt(id)) {
      setSelectedContactForMerge(selectedContact);
      setShowContactSelector(false);
      setShowMergeConfirmation(true);
    } else {
      setError('Please select a different contact to merge with.');
      setShowContactSelector(false);
    }
  };

  // Handle merge confirmation
  const handleMergeConfirm = async () => {
    if (!selectedContactForMerge) return;

    try {
      setIsMerging(true);
      setError('');

      // Call the merge API - current contact will be merged into the selected contact
      const result = await keapAPI.mergeContact(id, selectedContactForMerge.id);
      console.log(result);
      // Navigate to the target contact (the one that remains after merge)

    } catch (err) {
      console.error('Merge error:', err);
      setError('Failed to merge contacts: ' + err.message);
      setShowMergeConfirmation(false);
    } finally {
      setIsMerging(false);
    }
  };

  // Cancel merge process
  const handleMergeCancel = () => {
    setShowMergeConfirmation(false);
    setSelectedContactForMerge(null);
  };

  const updateField = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));
  
  const updateArrayField = (arrayName, index, field, value) => {
    setEditData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName]?.map((item, i) => i === index ? { ...item, [field]: value } : item) || []
    }));
  };

  const addArrayItem = (arrayName, newItem) => {
    setEditData(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), newItem] }));
  };

  const removeArrayItem = (arrayName, index) => {
    setEditData(prev => ({ ...prev, [arrayName]: prev[arrayName]?.filter((_, i) => i !== index) || [] }));
  };

  // Handler for credit cards
  const handleCreditCardsUpdate = (updatedCards) => {
    setEditData(prev => ({ ...prev, credit_cards: updatedCards }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getFullName = () => {
    const parts = [contact?.prefix, contact?.given_name, contact?.middle_name, contact?.family_name, contact?.suffix].filter(Boolean);
    return parts.length ? parts.join(' ') : 'Unnamed Contact';
  };

  const getSelectedContactName = () => {
    if (!selectedContactForMerge) return '';
    const parts = [
      selectedContactForMerge.given_name, 
      selectedContactForMerge.middle_name, 
      selectedContactForMerge.family_name
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : selectedContactForMerge.preferred_name || `Contact ${selectedContactForMerge.id}`;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error && !contact) return <div className="text-center py-12"><p className="text-red-600 mb-4">{error}</p><Button onClick={() => navigate('/contacts')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Contact Profile</h1>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setIsEditing(false); setEditData(contact); setError(''); }}>
                <X className="h-4 w-4 mr-1" />Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />Save
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                onClick={() => setShowContactSelector(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-1" />Merge with Contact
              </Button>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />Edit
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-md p-4"><p className="text-red-800">{error}</p></div>}

      {/* Header Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getFullName()}</h2>
            <p className="text-sm text-gray-500">ID: {contact?.id}</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Section icon={User} title="Basic Information">
        {isEditing ? (
          <div className="grid grid-cols-3 gap-3">
            {['prefix', 'given_name', 'middle_name', 'family_name', 'suffix', 'preferred_name', 'job_title', 'contact_type', 'spouse_name', 'website', 'opt_in_reason', 'preferred_locale', 'time_zone'].map(field => (
              <Input key={field} placeholder={field.replace('_', ' ')} value={editData[field]} onChange={(e) => updateField(field, e.target.value)} />
            ))}
            <Input type="date" placeholder="Birthday" value={formatDate(editData.birthday)} onChange={(e) => updateField('birthday', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            <Input type="date" placeholder="Anniversary" value={editData.anniversary} onChange={(e) => updateField('anniversary', e.target.value)} />
            <Input type="number" placeholder="Owner ID" value={editData.owner_id} onChange={(e) => updateField('owner_id', parseInt(e.target.value) || null)} />
            <Input type="number" placeholder="Lead Source ID" value={editData.lead_source_id} onChange={(e) => updateField('lead_source_id', parseInt(e.target.value) || null)} />
            <Input type="number" placeholder="Company ID" value={editData.company?.id} onChange={(e) => updateField('company', { id: parseInt(e.target.value) || null })} />
            <Select value={editData.source_type} onChange={(e) => updateField('source_type', e.target.value)}>
              <option value="">Select Source Type</option>
              {['APPOINTMENT', 'FORMAPIHOSTED', 'FORMAPIINTERNAL', 'WEBFORM', 'INTERNALFORM', 'LANDINGPAGE', 'IMPORT', 'MANUAL', 'API', 'OTHER', 'UNKNOWN'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-6 gap-y-2">
            {['prefix', 'given_name', 'middle_name', 'family_name', 'suffix', 'preferred_name', 'job_title', 'contact_type', 'spouse_name', 'website', 'opt_in_reason', 'preferred_locale', 'time_zone', 'source_type'].map(field => (
              <InfoItem key={field} label={field.replace('_', ' ')} value={contact?.[field]} />
            ))}
            <InfoItem label="Birthday" value={formatDateTime(contact?.birthday)} />
            <InfoItem label="Anniversary" value={contact?.anniversary} />
            <InfoItem label="Owner ID" value={contact?.owner_id} />
            <InfoItem label="Lead Source ID" value={contact?.lead_source_id} />
            <InfoItem label="Company ID" value={contact?.company?.id} />
          </div>
        )}
      </Section>

      {/* Other sections */}
      <TagSection contactId={id}/>
      <EmailSection contactId={contact?.id} />
      <LinkedContactsSection contactId={id}/>
      <CreditCardSection contactId={id}/>

      {/* Enhanced Email Addresses Section */}
      <Section icon={Mail} title="Email Addresses">
        {isEditing ? (
          <div className="space-y-3">
            {(editData.email_addresses || []).map((email, index) => (
              <div key={index} className="flex gap-3">
                <Select value={email.field} onChange={(e) => updateArrayField('email_addresses', index, 'field', e.target.value)} className="w-32">
                  {['EMAIL1', 'EMAIL2', 'EMAIL3'].map(field => <option key={field} value={field}>{field}</option>)}
                </Select>
                <Input type="email" placeholder="email@example.com" value={email.email} onChange={(e) => updateArrayField('email_addresses', index, 'email', e.target.value)} className="flex-1" />
                <Button variant="secondary" size="sm" onClick={() => removeArrayItem('email_addresses', index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => addArrayItem('email_addresses', { email: '', field: 'EMAIL1' })}>
              <Plus className="h-4 w-4 mr-1" />Add Email
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {contact?.email_addresses?.map((email, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{email.email}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{email.field}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Opt-in Status:</span>
                    {loadingOptInStatuses ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                    ) : (
                      <EmailOptInStatus status={emailOptInStatuses[email.email]} />
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEmailOptAction(email.email, 'opt-in')}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs px-2 py-1"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Opt In
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEmailOptAction(email.email, 'opt-out')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Opt Out
                    </Button>
                  </div>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No emails</p>}
          </div>
        )}
      </Section>

      {/* Phone Numbers */}
      <Section icon={Phone} title="Phone Numbers">
        {isEditing ? (
          <div className="space-y-3">
            {['PHONE1', 'PHONE2', 'PHONE3', 'PHONE4', 'PHONE5'].map((field) => {
              const phone = editData.phone_numbers?.find(p => p.field === field) || { field, number: '', type: '', extension: '' };
              const index = editData.phone_numbers?.findIndex(p => p.field === field) ?? -1;
              return (
                <div key={field} className="grid grid-cols-5 gap-3">
                  <div className="flex items-center justify-center bg-gray-100 rounded px-3 py-2 text-sm font-medium">{field}</div>
                  <Input placeholder="Number" value={phone.number} onChange={(e) => {
                    const phones = editData.phone_numbers || [];
                    if (index >= 0) {
                      updateArrayField('phone_numbers', index, 'number', e.target.value);
                    } else {
                      setEditData(prev => ({ ...prev, phone_numbers: [...phones, { field, number: e.target.value, type: '', extension: '' }] }));
                    }
                  }} />
                  <Input placeholder="Type" value={phone.type} onChange={(e) => {
                    const phones = editData.phone_numbers || [];
                    if (index >= 0) {
                      updateArrayField('phone_numbers', index, 'type', e.target.value);
                    } else {
                      setEditData(prev => ({ ...prev, phone_numbers: [...phones, { field, number: '', type: e.target.value, extension: '' }] }));
                    }
                  }} />
                  <Input placeholder="Extension" value={phone.extension} onChange={(e) => {
                    const phones = editData.phone_numbers || [];
                    if (index >= 0) {
                      updateArrayField('phone_numbers', index, 'extension', e.target.value);
                    } else {
                      setEditData(prev => ({ ...prev, phone_numbers: [...phones, { field, number: '', type: '', extension: e.target.value }] }));
                    }
                  }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {contact?.phone_numbers?.map((phone, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{phone.number}{phone.extension && ` ext. ${phone.extension}`} ({phone.field}){phone.type && ` • ${phone.type}`}</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No phones</p>}
          </div>
        )}
      </Section>


      {/* Fax Numbers */}
      <Section icon={Printer} title="Fax Numbers">
        {isEditing ? (
          <div className="space-y-3">
            {['FAX1', 'FAX2'].map((field) => {
              const fax = editData.fax_numbers?.find(f => f.field === field) || { field, number: '', type: '' };
              const index = editData.fax_numbers?.findIndex(f => f.field === field) ?? -1;
              return (
                <div key={field} className="grid grid-cols-4 gap-3">
                  <div className="flex items-center justify-center bg-gray-100 rounded px-3 py-2 text-sm font-medium">{field}</div>
                  <Input placeholder="Number" value={fax.number} onChange={(e) => {
                    const faxes = editData.fax_numbers || [];
                    if (index >= 0) {
                      updateArrayField('fax_numbers', index, 'number', e.target.value);
                    } else {
                      setEditData(prev => ({ ...prev, fax_numbers: [...faxes, { field, number: e.target.value, type: '' }] }));
                    }
                  }} />
                  <Input placeholder="Type" value={fax.type} onChange={(e) => {
                    const faxes = editData.fax_numbers || [];
                    if (index >= 0) {
                      updateArrayField('fax_numbers', index, 'type', e.target.value);
                    } else {
                      setEditData(prev => ({ ...prev, fax_numbers: [...faxes, { field, number: '', type: e.target.value }] }));
                    }
                  }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {contact?.fax_numbers?.map((fax, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Printer className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{fax.number} ({fax.field}){fax.type && ` • ${fax.type}`}</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No fax numbers</p>}
          </div>
        )}
      </Section>

      {/* Addresses */}
      <Section icon={MapPin} title="Addresses">
        {isEditing ? (
          <div className="space-y-4">
            {['BILLING', 'SHIPPING', 'OTHER'].map((field) => {
              const address = editData.addresses?.find(a => a.field === field) || { 
                field, line1: '', line2: '', locality: '', region: '', postal_code: '', zip_code: '', zip_four: '', country_code: 'US' 
              };
              const index = editData.addresses?.findIndex(a => a.field === field) ?? -1;
              return (
                <div key={field} className="border p-4 rounded-lg">
                  <div className="mb-3">
                    <div className="flex items-center justify-center bg-gray-100 rounded px-3 py-2 text-sm font-medium w-32">{field}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input placeholder="Line 1" value={address.line1} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'line1', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, line1: e.target.value }] }));
                      }
                    }} />
                    <Input placeholder="Line 2" value={address.line2} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'line2', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, line2: e.target.value }] }));
                      }
                    }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="City" value={address.locality} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'locality', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, locality: e.target.value }] }));
                      }
                    }} />
                    <Input placeholder="State" value={address.region} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'region', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, region: e.target.value }] }));
                      }
                    }} />
                    <Input placeholder="Country" value={address.country_code} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'country_code', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, country_code: e.target.value }] }));
                      }
                    }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <Input placeholder="Postal Code" value={address.postal_code} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'postal_code', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, postal_code: e.target.value }] }));
                      }
                    }} />
                    <Input placeholder="ZIP" value={address.zip_code} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'zip_code', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, zip_code: e.target.value }] }));
                      }
                    }} />
                    <Input placeholder="ZIP+4" value={address.zip_four} onChange={(e) => {
                      const addresses = editData.addresses || [];
                      if (index >= 0) {
                        updateArrayField('addresses', index, 'zip_four', e.target.value);
                      } else {
                        setEditData(prev => ({ ...prev, addresses: [...addresses, { ...address, zip_four: e.target.value }] }));
                      }
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {['BILLING', 'SHIPPING', 'OTHER'].map((field) => {
              const address = contact?.addresses?.find(a => a.field === field);
              return (
                <div key={field} className="p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium mb-2">{field}</p>
                  {address ? (
                    <p className="text-sm text-gray-600">
                      {address.line1}{address.line2 && `, ${address.line2}`}<br/>
                      {address.locality}, {address.region} {address.postal_code || address.zip_code}
                      {address.zip_four && `-${address.zip_four}`}<br/>
                      {address.country_code}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">No address</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Social Accounts */}
      <Section icon={Globe} title="Social Accounts">
        {isEditing ? (
          <div className="space-y-3">
            {(editData.social_accounts || []).map((social, index) => (
              <div key={index} className="grid grid-cols-3 gap-3">
                <Select value={social.type} onChange={(e) => updateArrayField('social_accounts', index, 'type', e.target.value)}>
                  {['Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'YouTube'].map(type => <option key={type} value={type}>{type}</option>)}
                </Select>
                <Input placeholder="Username" value={social.name} onChange={(e) => updateArrayField('social_accounts', index, 'name', e.target.value)} />
                <Button variant="secondary" size="sm" onClick={() => removeArrayItem('social_accounts', index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => addArrayItem('social_accounts', { name: '', type: 'Facebook' })}>
              <Plus className="h-4 w-4 mr-1" />Add Social
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {contact?.social_accounts?.map((social, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{social.name} ({social.type})</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No social accounts</p>}
          </div>
        )}
      </Section>

      {/* Timestamps */}
      <Section icon={Clock} title="Timestamps">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Created" value={contact?.date_created} />
          <InfoItem label="Updated" value={contact?.last_updated} />
          {contact?.origin?.ip_address && <InfoItem label="Origin IP" value={contact.origin.ip_address} />}
        </div>
      </Section>

      {/* Email Opt-In/Out Modal */}
      <EmailOptModal
        isOpen={showOptModal}
        onClose={() => {
          setShowOptModal(false);
          setSelectedEmailForOpt(null);
          setOptAction('');
        }}
        onConfirm={confirmOptAction}
        email={selectedEmailForOpt}
        action={optAction}
        isLoading={isOptActionLoading}
      />

      {/* Contact Selector Modal for Merge */}
      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelect={handleMergeContactSelect}
        mode="single"
        selectedContactIds={[]} // Don't pre-select any contacts for merge
      />

      {/* Merge Confirmation Modal */}
      <MergeConfirmationModal
        isOpen={showMergeConfirmation}
        onClose={handleMergeCancel}
        onConfirm={handleMergeConfirm}
        currentContactName={getFullName()}
        targetContactName={getSelectedContactName()}
        isMerging={isMerging}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        contactName={getFullName()}
      />

      {/* Loading overlay for delete operation */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <span className="text-gray-900">Deleting contact...</span>
          </div>
        </div>
      )}
    </div>
  );
}