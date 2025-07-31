import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, MapPin, Building, Edit2, Save, X, ArrowLeft, Printer, Globe, Tag, Clock } from 'lucide-react';
import keapAPI from '../services/keapAPI';

const Input = ({ type = 'text', placeholder, value, onChange, ...props }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" {...props} />
);

const Select = ({ value, onChange, children, ...props }) => (
  <select value={value} onChange={onChange}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" {...props}>
    {children}
  </select>
);

const InfoItem = ({ label, value }) => (
  <div className="mb-2">
    <span className="text-sm font-medium text-gray-500">{label}: </span>
    <span className="text-sm text-gray-900">{value || 'Not provided'}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = { unengagedmarketable: 'yellow', engaged: 'green', unengaged: 'gray', 'non-marketable': 'red' };
  const color = colors[status?.toLowerCase()] || 'gray';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
      {status}
    </span>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <Icon className="h-5 w-5 mr-2" />{title}
    </h3>
    {children}
  </div>
);

export function ContactProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState({});
  const [error, setError] = useState('');

  const phoneFields = ['PHONE1', 'PHONE2', 'PHONE3', 'PHONE4', 'PHONE5'];
  const faxFields = ['FAX1', 'FAX2'];

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        // Mock data - replace with: const contactData = await keapAPI.getContact(id);

        const contactData = await keapAPI.getContactById(id)
        console.log(contactData)
        // const contactData = {
        //   id: parseInt(id), ScoreValue: '85', given_name: 'John', middle_name: 'William', family_name: 'Doe',
        //   preferred_name: 'Johnny', prefix: 'Mr.', suffix: 'Jr.', job_title: 'Software Developer',
        //   contact_type: 'Lead', spouse_name: 'Jane Doe', birthday: '1990-05-15T00:00:00Z',
        //   anniversary: '2015-06-20', website: 'https://johndoe.com', company_name: 'Tech Corp',
        //   company: { id: 456, company_name: 'Tech Corp' }, email_status: 'UnengagedMarketable',
        //   email_opted_in: true, owner_id: 123, lead_source_id: 789, source_type: 'API',
        //   preferred_locale: 'en_US', time_zone: 'America/New_York', opt_in_reason: 'Newsletter signup',
        //   date_created: '2023-01-15T10:30:00Z', last_updated: '2023-12-01T14:45:00Z',
        //   origin: { date: '2023-01-15T10:30:00Z', ip_address: '192.168.1.1' },
        //   email_addresses: [{ email: 'john@example.com', field: 'EMAIL1' }],
        //   phone_numbers: [{ number: '+1234567890', type: 'Mobile', field: 'PHONE1', extension: '123' }],
        //   fax_numbers: [{ number: '+1555555555', type: 'Business', field: 'FAX1' }],
        //   addresses: [{ field: 'BILLING', line1: '123 Main St', line2: 'Apt 4B', locality: 'Anytown', region: 'CA', postal_code: '12345-6789', zip_code: '12345', zip_four: '6789', country_code: 'US' }],
        //   social_accounts: [{ name: 'johndoe', type: 'Facebook' }],
        //   custom_fields: [{ id: 1, content: { value: 'Premium Customer' } }],
        //   tag_ids: [100, 200, 300],
        //   relationships: [{ id: 1, linked_contact_id: 999, relationship_type_id: 5 }]
        // };
        setContact(contactData);
        setEditedContact(contactData);
      } catch (err) {
        setError('Failed to load contact: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Replace with: await keapAPI.updateContact(id, editedContact);
      console.log('Saving contact:', editedContact);
      setContact(editedContact);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save contact: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => setEditedContact(prev => ({ ...prev, [field]: value }));
  
  const updateArrayField = (arrayName, index, field, value) => {
    setEditedContact(prev => ({
      ...prev,
      [arrayName]: prev[arrayName]?.map((item, i) => i === index ? { ...item, [field]: value } : item) || []
    }));
  };

  const getPhoneByField = (field) => editedContact.phone_numbers?.find(p => p.field === field) || { field, number: '', type: '', extension: '' };
  const getFaxByField = (field) => editedContact.fax_numbers?.find(f => f.field === field) || { field, number: '', type: '' };

  const updatePhoneField = (field, key, value) => {
    const phones = editedContact.phone_numbers || [];
    const existingIndex = phones.findIndex(p => p.field === field);
    if (existingIndex >= 0) {
      updateArrayField('phone_numbers', existingIndex, key, value);
    } else {
      setEditedContact(prev => ({ ...prev, phone_numbers: [...phones, { field, [key]: value, number: '', type: '', extension: '' }] }));
    }
  };

  const updateFaxField = (field, key, value) => {
    const faxes = editedContact.fax_numbers || [];
    const existingIndex = faxes.findIndex(f => f.field === field);
    if (existingIndex >= 0) {
      updateArrayField('fax_numbers', existingIndex, key, value);
    } else {
      setEditedContact(prev => ({ ...prev, fax_numbers: [...faxes, { field, [key]: value, number: '', type: '' }] }));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="ml-2 text-gray-600">Loading contact...</p>
    </div>
  );

  if (error && !contact) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={() => navigate('/contacts')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="secondary" size="sm" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Contact Profile</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-md p-4"><p className="text-red-800">{error}</p></div>}

      {/* Header Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {[contact?.prefix, contact?.given_name, contact?.middle_name, contact?.family_name, contact?.suffix].filter(Boolean).join(' ') || 'Unnamed Contact'}
              </h2>
              {contact?.preferred_name && <p className="text-sm text-gray-500">Preferred: {contact.preferred_name}</p>}
              <p className="text-sm text-gray-500">ID: {contact?.id}</p>
              <div className="flex gap-2 mt-2">
                {contact?.email_status && <StatusBadge status={contact.email_status} />}
                {contact?.email_opted_in && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Email Opted In</span>}
                {contact?.ScoreValue && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Score: {contact.ScoreValue}</span>}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => { setIsEditing(false); setEditedContact(contact); setError(''); }} disabled={saving}>
                  <X className="h-4 w-4 mr-1" />Cancel
                </Button>
                <Button size="sm" onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4 mr-1" />Save
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Section icon={User} title="Basic Information">
          {isEditing ? (
            <div className="space-y-3">
              {['prefix', 'given_name', 'middle_name', 'family_name', 'preferred_name', 'suffix', 'job_title', 'contact_type', 'spouse_name', 'website'].map(field => (
                <Input key={field} placeholder={field.replace('_', ' ')} value={editedContact[field] || ''} onChange={(e) => updateField(field, e.target.value)} />
              ))}
              <Input type="date" placeholder="Birthday" value={editedContact.birthday ? editedContact.birthday.split('T')[0] : ''} 
                     onChange={(e) => updateField('birthday', e.target.value ? new Date(e.target.value).toISOString() : '')} />
              <Input type="date" placeholder="Anniversary" value={editedContact.anniversary || ''} onChange={(e) => updateField('anniversary', e.target.value)} />
            </div>
          ) : (
            <>
              {['prefix', 'given_name', 'middle_name', 'family_name', 'preferred_name', 'suffix', 'job_title', 'contact_type', 'spouse_name', 'website'].map(field => (
                <InfoItem key={field} label={field.replace('_', ' ')} value={contact?.[field]} />
              ))}
              <InfoItem label="Birthday" value={contact?.birthday ? new Date(contact.birthday).toLocaleDateString() : ''} />
              <InfoItem label="Anniversary" value={contact?.anniversary} />
            </>
          )}
        </Section>

        {/* Company & Settings */}
        <Section icon={Building} title="Company & Settings">
          {isEditing ? (
            <div className="space-y-3">
              <Input placeholder="Company Name" value={editedContact.company_name || ''} onChange={(e) => updateField('company_name', e.target.value)} />
              <Input type="number" placeholder="Owner ID" value={editedContact.owner_id || ''} onChange={(e) => updateField('owner_id', parseInt(e.target.value) || 0)} />
              <Input type="number" placeholder="Lead Source ID" value={editedContact.lead_source_id || ''} onChange={(e) => updateField('lead_source_id', parseInt(e.target.value) || 0)} />
              <Select value={editedContact.source_type || ''} onChange={(e) => updateField('source_type', e.target.value)}>
                <option value="">Select Source Type</option>
                {['APPOINTMENT', 'FORMAPIHOSTED', 'FORMAPIINTERNAL', 'WEBFORM', 'INTERNALFORM', 'LANDINGPAGE', 'IMPORT', 'MANUAL', 'API', 'OTHER', 'UNKNOWN'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
              <Input placeholder="Preferred Locale" value={editedContact.preferred_locale || ''} onChange={(e) => updateField('preferred_locale', e.target.value)} />
              <Input placeholder="Time Zone" value={editedContact.time_zone || ''} onChange={(e) => updateField('time_zone', e.target.value)} />
              <Input placeholder="Opt-in Reason" value={editedContact.opt_in_reason || ''} onChange={(e) => updateField('opt_in_reason', e.target.value)} />
            </div>
          ) : (
            <>
              <InfoItem label="Company" value={contact?.company_name} />
              <InfoItem label="Company ID" value={contact?.company?.id} />
              <InfoItem label="Owner ID" value={contact?.owner_id} />
              <InfoItem label="Lead Source ID" value={contact?.lead_source_id} />
              <InfoItem label="Source Type" value={contact?.source_type} />
              <InfoItem label="Preferred Locale" value={contact?.preferred_locale} />
              <InfoItem label="Time Zone" value={contact?.time_zone} />
              <InfoItem label="Opt-in Reason" value={contact?.opt_in_reason} />
            </>
          )}
        </Section>
      </div>

      {/* Email Addresses */}
      <Section icon={Mail} title="Email Addresses">
        {isEditing ? (
          <div className="space-y-3">
            {(editedContact.email_addresses || []).map((email, index) => (
              <div key={index} className="flex gap-3">
                <Select value={email.field} onChange={(e) => updateArrayField('email_addresses', index, 'field', e.target.value)} className="w-32">
                  {['EMAIL1', 'EMAIL2', 'EMAIL3'].map(field => <option key={field} value={field}>{field}</option>)}
                </Select>
                <Input type="email" placeholder="email@example.com" value={email.email} onChange={(e) => updateArrayField('email_addresses', index, 'email', e.target.value)} className="flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {contact?.email_addresses?.map((email, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{email.email} ({email.field})</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No emails</p>}
          </div>
        )}
      </Section>

      {/* Phone Numbers */}
      <Section icon={Phone} title="Phone Numbers">
        {isEditing ? (
          <div className="space-y-3">
            {phoneFields.map((field) => {
              const phone = getPhoneByField(field);
              return (
                <div key={field} className="grid grid-cols-4 gap-3">
                  <div className="flex items-center justify-center bg-gray-100 rounded px-3 py-2 text-sm font-medium">{field}</div>
                  <Input placeholder="Phone Number" value={phone.number || ''} onChange={(e) => updatePhoneField(field, 'number', e.target.value)} />
                  <Input placeholder="Type" value={phone.type || ''} onChange={(e) => updatePhoneField(field, 'type', e.target.value)} />
                  <Input placeholder="Extension" value={phone.extension || ''} onChange={(e) => updatePhoneField(field, 'extension', e.target.value)} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {contact?.phone_numbers?.map((phone, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{phone.number} {phone.extension && `ext. ${phone.extension}`} ({phone.field}) {phone.type && `• ${phone.type}`}</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No phones</p>}
          </div>
        )}
      </Section>

      {/* Fax Numbers */}
      <Section icon={Printer} title="Fax Numbers">
        {isEditing ? (
          <div className="space-y-3">
            {faxFields.map((field) => {
              const fax = getFaxByField(field);
              return (
                <div key={field} className="grid grid-cols-3 gap-3">
                  <div className="flex items-center justify-center bg-gray-100 rounded px-3 py-2 text-sm font-medium">{field}</div>
                  <Input placeholder="Fax Number" value={fax.number || ''} onChange={(e) => updateFaxField(field, 'number', e.target.value)} />
                  <Input placeholder="Type" value={fax.type || ''} onChange={(e) => updateFaxField(field, 'type', e.target.value)} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {contact?.fax_numbers?.map((fax, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Printer className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{fax.number} ({fax.field}) {fax.type && `• ${fax.type}`}</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No fax numbers</p>}
          </div>
        )}
      </Section>

      {/* Addresses */}
      <Section icon={MapPin} title="Addresses">
        {isEditing ? (
          <div className="space-y-4">
            {(editedContact.addresses || []).map((address, index) => (
              <div key={index} className="border p-3 rounded">
                <Select value={address.field} onChange={(e) => updateArrayField('addresses', index, 'field', e.target.value)} className="mb-3">
                  {['BILLING', 'SHIPPING', 'OTHER'].map(field => <option key={field} value={field}>{field}</option>)}
                </Select>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input placeholder="Address Line 1" value={address.line1 || ''} onChange={(e) => updateArrayField('addresses', index, 'line1', e.target.value)} />
                  <Input placeholder="Address Line 2" value={address.line2 || ''} onChange={(e) => updateArrayField('addresses', index, 'line2', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input placeholder="City" value={address.locality || ''} onChange={(e) => updateArrayField('addresses', index, 'locality', e.target.value)} />
                  <Input placeholder="State" value={address.region || ''} onChange={(e) => updateArrayField('addresses', index, 'region', e.target.value)} />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input placeholder="ZIP Code" value={address.zip_code || ''} onChange={(e) => updateArrayField('addresses', index, 'zip_code', e.target.value)} />
                  <Input placeholder="ZIP+4" value={address.zip_four || ''} onChange={(e) => updateArrayField('addresses', index, 'zip_four', e.target.value)} />
                  <Input placeholder="Postal Code" value={address.postal_code || ''} onChange={(e) => updateArrayField('addresses', index, 'postal_code', e.target.value)} />
                  <Input placeholder="Country" value={address.country_code || ''} onChange={(e) => updateArrayField('addresses', index, 'country_code', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {contact?.addresses?.map((address, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{address.field}</p>
                    <p className="text-sm text-gray-600">
                      {address.line1}{address.line2 && `, ${address.line2}`}<br/>
                      {address.locality}, {address.region} {address.zip_code}{address.zip_four && `-${address.zip_four}`}<br/>
                      {address.country_code}
                    </p>
                  </div>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No addresses</p>}
          </div>
        )}
      </Section>

      {/* Additional Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Social Accounts */}
        {contact?.social_accounts?.length > 0 && (
          <Section icon={Globe} title="Social Accounts">
            <div className="space-y-2">
              {contact.social_accounts.map((social, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{social.name} ({social.type})</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Custom Fields */}
        {contact?.custom_fields?.length > 0 && (
          <Section icon={Tag} title="Custom Fields">
            <div className="space-y-3">
              {contact.custom_fields.map((field, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium">Field ID: {field.id}</p>
                  <code className="text-xs bg-gray-200 px-1 rounded">{JSON.stringify(field.content)}</code>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Tags */}
        {contact?.tag_ids?.length > 0 && (
          <Section icon={Tag} title="Tags">
            <div className="flex flex-wrap gap-2">
              {contact.tag_ids.map((tagId, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {tagId}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Relationships */}
      {contact?.relationships?.length > 0 && (
        <Section icon={User} title="Relationships">
          <div className="space-y-3">
            {contact.relationships.map((rel, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded grid grid-cols-3 gap-4 text-sm">
                <div><span className="font-medium text-gray-500">Contact ID:</span> {rel.linked_contact_id}</div>
                <div><span className="font-medium text-gray-500">Type:</span> {rel.relationship_type_id}</div>
                <div><span className="font-medium text-gray-500">ID:</span> {rel.id}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Metadata */}
      <Section icon={Clock} title="Metadata">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <InfoItem label="Date Created" value={contact?.date_created ? new Date(contact.date_created).toLocaleString() : ''} />
            <InfoItem label="Last Updated" value={contact?.last_updated ? new Date(contact.last_updated).toLocaleString() : ''} />
            <InfoItem label="Score Value" value={contact?.ScoreValue} />
            <InfoItem label="Email Opted In" value={contact?.email_opted_in ? 'Yes' : 'No'} />
          </div>
          <div className="space-y-3">
            {contact?.origin && (
              <>
                <InfoItem label="Origin Date" value={new Date(contact.origin.date).toLocaleString()} />
                <InfoItem label="Origin IP" value={contact.origin.ip_address} />
              </>
            )}
            <InfoItem label="Email Status" value={contact?.email_status} />
          </div>
        </div>
      </Section>
    </div>
  );
}