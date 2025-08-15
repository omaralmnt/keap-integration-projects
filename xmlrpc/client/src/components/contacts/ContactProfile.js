import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { User, Mail, Phone, MapPin, ArrowLeft, Edit2, Save, X, Clock, Tag, Globe, Printer, Plus, Trash2, AlertTriangle } from 'lucide-react';
import keapAPI from '../../services/keapAPI';
import { CreditCardSection } from './CreditCardSection'; // Import the new component
import { EmailSection } from './EmailSection';
import { TagSection } from './TagSection';

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

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const contactData = await keapAPI.getContactById(id);
      setContact(contactData);
      setEditData(contactData);
    } catch (err) {
      setError('Failed to load contact: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log(editData)
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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error && !contact) return <div className="text-center py-12"><p className="text-red-600 mb-4">{error}</p><Button onClick={() => navigate('/contacts')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></div>;

  const getFullName = () => {
    const parts = [contact?.prefix, contact?.given_name, contact?.middle_name, contact?.family_name, contact?.suffix].filter(Boolean);
    return parts.length ? parts.join(' ') : 'Unnamed Contact';
  };

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
      {/* Credit Cards Section */}
      <TagSection contactId={id}/>
      <EmailSection contactId={contact?.id} />

      <CreditCardSection contactId={id}/>

    
      {/* Email Addresses */}
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
          <div className="space-y-2">
            {contact?.email_addresses?.map((email, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm flex-1">{email.email}</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{email.field}</span>
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

      {/* Custom Fields */}
      <Section icon={Tag} title="Custom Fields">
        {isEditing ? (
          <div className="space-y-3">
            {(editData.custom_fields || []).map((field, index) => (
              <div key={index} className="grid grid-cols-3 gap-3">
                <Input type="number" placeholder="ID" value={field.id} onChange={(e) => updateArrayField('custom_fields', index, 'id', parseInt(e.target.value) || 0)} />
                <Input placeholder='Content {"key":"value"}' value={JSON.stringify(field.content || {})} onChange={(e) => {
                  try { updateArrayField('custom_fields', index, 'content', JSON.parse(e.target.value)); } catch {}
                }} />
                <Button variant="secondary" size="sm" onClick={() => removeArrayItem('custom_fields', index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => addArrayItem('custom_fields', { id: 0, content: {} })}>
              <Plus className="h-4 w-4 mr-1" />Add Custom Field
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {contact?.custom_fields?.map((field, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">ID: {field.id}</p>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">{JSON.stringify(field.content)}</code>
              </div>
            )) || <p className="text-gray-500 text-sm">No custom fields</p>}
          </div>
        )}
      </Section>

      {/* Timestamps */}
      <Section icon={Clock} title="Timestamps">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Created" value={formatDateTime(contact?.date_created)} />
          <InfoItem label="Updated" value={formatDateTime(contact?.last_updated)} />
          <InfoItem label="Email Status" value={contact?.email_status} />
          <InfoItem label="Email Opted In" value={contact?.email_opted_in ? 'Yes' : 'No'} />
          {contact?.origin?.ip_address && <InfoItem label="Origin IP" value={contact.origin.ip_address} />}
        </div>
      </Section>

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