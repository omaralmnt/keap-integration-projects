import { useState } from 'react';
import { Button } from '../components/ui/Button';
import keapAPI from '../services/keapAPI';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', ...props }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    {...props}
  />
);

const Select = ({ value, onChange, children, className = '', ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    {...props}
  >
    {children}
  </select>
);

export function CreateContact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Basic Info
    givenName: '',
    familyName: '',
    middleName: '',
    preferredName: '',
    prefix: '',
    suffix: '',
    jobTitle: '',
    contactType: '',
    spouseName: '',
    birthday: '',
    anniversary: '',
    website: '',

    // Email Addresses (fixed 3)
    email1: '',
    email2: '',
    email3: '',

    // Phone Numbers (fixed 5)
    phone1: '',
    phone1Type: '',
    phone1Ext: '',
    phone2: '',
    phone2Type: '',
    phone2Ext: '',
    phone3: '',
    phone3Type: '',
    phone3Ext: '',
    phone4: '',
    phone4Type: '',
    phone4Ext: '',
    phone5: '',
    phone5Type: '',
    phone5Ext: '',

    // Fax Numbers (fixed 2)
    fax1: '',
    fax1Type: '',
    fax2: '',
    fax2Type: '',

    // Addresses (fixed 3)
    billingLine1: '',
    billingLine2: '',
    billingCity: '',
    billingRegion: '',
    billingPostal: '',
    billingZip: '',
    billingZipFour: '',
    billingCountry: 'US',

    shippingLine1: '',
    shippingLine2: '',
    shippingCity: '',
    shippingRegion: '',
    shippingPostal: '',
    shippingZip: '',
    shippingZipFour: '',
    shippingCountry: 'US',

    otherLine1: '',
    otherLine2: '',
    otherCity: '',
    otherRegion: '',
    otherPostal: '',
    otherZip: '',
    otherZipFour: '',
    otherCountry: 'US',

    // Settings
    companyId: '',
    leadSourceId: '',
    ownerId: '',
    optInReason: '',
    preferredLocale: 'en_US',
    timeZone: '',
    sourceType: '',
    duplicateOption: 'Email'
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDateForAPI = (dateString) => dateString ? new Date(dateString).toISOString() : undefined;
  const formatDateOnly = (dateString) => dateString ? dateString.split('T')[0] : undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.givenName.trim() && !formData.familyName.trim()) {
      setError('Please provide at least a given name or family name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const payload = {};

      // Basic info
      if (formData.givenName) payload.given_name = formData.givenName;
      if (formData.familyName) payload.family_name = formData.familyName;
      if (formData.middleName) payload.middle_name = formData.middleName;
      if (formData.preferredName) payload.preferred_name = formData.preferredName;
      if (formData.prefix) payload.prefix = formData.prefix;
      if (formData.suffix) payload.suffix = formData.suffix;
      if (formData.jobTitle) payload.job_title = formData.jobTitle;
      if (formData.contactType) payload.contact_type = formData.contactType;
      if (formData.spouseName) payload.spouse_name = formData.spouseName;
      if (formData.birthday) payload.birthday = formatDateForAPI(formData.birthday);
      if (formData.anniversary) payload.anniversary = formatDateOnly(formData.anniversary);
      if (formData.website) payload.website = formData.website;

      // Email addresses
      const emailAddresses = [];
      if (formData.email1) emailAddresses.push({ email: formData.email1, field: 'EMAIL1' });
      if (formData.email2) emailAddresses.push({ email: formData.email2, field: 'EMAIL2' });
      if (formData.email3) emailAddresses.push({ email: formData.email3, field: 'EMAIL3' });
      if (emailAddresses.length > 0) payload.email_addresses = emailAddresses;

      // Phone numbers
      const phoneNumbers = [];
      if (formData.phone1) phoneNumbers.push({ number: formData.phone1, field: 'PHONE1', type: formData.phone1Type || undefined, extension: formData.phone1Ext || undefined });
      if (formData.phone2) phoneNumbers.push({ number: formData.phone2, field: 'PHONE2', type: formData.phone2Type || undefined, extension: formData.phone2Ext || undefined });
      if (formData.phone3) phoneNumbers.push({ number: formData.phone3, field: 'PHONE3', type: formData.phone3Type || undefined, extension: formData.phone3Ext || undefined });
      if (formData.phone4) phoneNumbers.push({ number: formData.phone4, field: 'PHONE4', type: formData.phone4Type || undefined, extension: formData.phone4Ext || undefined });
      if (formData.phone5) phoneNumbers.push({ number: formData.phone5, field: 'PHONE5', type: formData.phone5Type || undefined, extension: formData.phone5Ext || undefined });
      if (phoneNumbers.length > 0) payload.phone_numbers = phoneNumbers;

      // Fax numbers
      const faxNumbers = [];
      if (formData.fax1) faxNumbers.push({ number: formData.fax1, field: 'FAX1', type: formData.fax1Type || undefined });
      if (formData.fax2) faxNumbers.push({ number: formData.fax2, field: 'FAX2', type: formData.fax2Type || undefined });
      if (faxNumbers.length > 0) payload.fax_numbers = faxNumbers;

      // Addresses
      const addresses = [];
      if (formData.billingLine1) addresses.push({
        field: 'BILLING', line1: formData.billingLine1, line2: formData.billingLine2 || undefined,
        locality: formData.billingCity || undefined, region: formData.billingRegion || undefined,
        postal_code: formData.billingPostal || undefined, zip_code: formData.billingZip || undefined,
        zip_four: formData.billingZipFour || undefined, country_code: formData.billingCountry
      });
      if (formData.shippingLine1) addresses.push({
        field: 'SHIPPING', line1: formData.shippingLine1, line2: formData.shippingLine2 || undefined,
        locality: formData.shippingCity || undefined, region: formData.shippingRegion || undefined,
        postal_code: formData.shippingPostal || undefined, zip_code: formData.shippingZip || undefined,
        zip_four: formData.shippingZipFour || undefined, country_code: formData.shippingCountry
      });
      if (formData.otherLine1) addresses.push({
        field: 'OTHER', line1: formData.otherLine1, line2: formData.otherLine2 || undefined,
        locality: formData.otherCity || undefined, region: formData.otherRegion || undefined,
        postal_code: formData.otherPostal || undefined, zip_code: formData.otherZip || undefined,
        zip_four: formData.otherZipFour || undefined, country_code: formData.otherCountry
      });
      if (addresses.length > 0) payload.addresses = addresses;

      // Settings
      if (formData.companyId) payload.company = { id: parseInt(formData.companyId) };
      if (formData.leadSourceId) payload.lead_source_id = parseInt(formData.leadSourceId);
      if (formData.ownerId) payload.owner_id = parseInt(formData.ownerId);
      if (formData.optInReason) payload.opt_in_reason = formData.optInReason;
      if (formData.preferredLocale) payload.preferred_locale = formData.preferredLocale;
      if (formData.timeZone) payload.time_zone = formData.timeZone;
      if (formData.sourceType) payload.source_type = formData.sourceType;
      if (formData.duplicateOption) payload.duplicate_option = formData.duplicateOption;
    //   console.log(payload)
     const response = await keapAPI.addorEditContact(payload);
     console.log(response)
      setSuccess(true);
      setTimeout(() => resetForm(), 2000);
      
    } catch (error) {
      setError(error.message || 'Failed to create contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      // Basic Info
      givenName: '',
      familyName: '',
      middleName: '',
      preferredName: '',
      prefix: '',
      suffix: '',
      jobTitle: '',
      contactType: '',
      spouseName: '',
      birthday: '',
      anniversary: '',
      website: '',

      // Email Addresses (fixed 3)
      email1: '',
      email2: '',
      email3: '',

      // Phone Numbers (fixed 5)
      phone1: '',
      phone1Type: '',
      phone1Ext: '',
      phone2: '',
      phone2Type: '',
      phone2Ext: '',
      phone3: '',
      phone3Type: '',
      phone3Ext: '',
      phone4: '',
      phone4Type: '',
      phone4Ext: '',
      phone5: '',
      phone5Type: '',
      phone5Ext: '',

      // Fax Numbers (fixed 2)
      fax1: '',
      fax1Type: '',
      fax2: '',
      fax2Type: '',

      // Addresses (fixed 3)
      billingLine1: '',
      billingLine2: '',
      billingCity: '',
      billingRegion: '',
      billingPostal: '',
      billingZip: '',
      billingZipFour: '',
      billingCountry: 'US',

      shippingLine1: '',
      shippingLine2: '',
      shippingCity: '',
      shippingRegion: '',
      shippingPostal: '',
      shippingZip: '',
      shippingZipFour: '',
      shippingCountry: 'US',

      otherLine1: '',
      otherLine2: '',
      otherCity: '',
      otherRegion: '',
      otherPostal: '',
      otherZip: '',
      otherZipFour: '',
      otherCountry: 'US',

      // Settings
      companyId: '',
      leadSourceId: '',
      ownerId: '',
      optInReason: '',
      preferredLocale: 'en_US',
      timeZone: '',
      sourceType: '',
      duplicateOption: 'Email'
    });
    setSuccess(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create New Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800">Contact created successfully! 🎉</div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Given Name *" value={formData.givenName} onChange={(e) => updateFormData('givenName', e.target.value)} />
            <Input placeholder="Middle Name" value={formData.middleName} onChange={(e) => updateFormData('middleName', e.target.value)} />
            <Input placeholder="Family Name" value={formData.familyName} onChange={(e) => updateFormData('familyName', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Prefix" value={formData.prefix} onChange={(e) => updateFormData('prefix', e.target.value)} />
            <Input placeholder="Preferred Name" value={formData.preferredName} onChange={(e) => updateFormData('preferredName', e.target.value)} />
            <Input placeholder="Suffix" value={formData.suffix} onChange={(e) => updateFormData('suffix', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Job Title" value={formData.jobTitle} onChange={(e) => updateFormData('jobTitle', e.target.value)} />
            <Input placeholder="Spouse Name" value={formData.spouseName} onChange={(e) => updateFormData('spouseName', e.target.value)} />
          </div>
        </div>

        {/* Email Addresses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Email Addresses</h2>
          <div className="space-y-3">
            <Input placeholder="Email 1" value={formData.email1} onChange={(e) => updateFormData('email1', e.target.value)} type="email" />
            <Input placeholder="Email 2" value={formData.email2} onChange={(e) => updateFormData('email2', e.target.value)} type="email" />
            <Input placeholder="Email 3" value={formData.email3} onChange={(e) => updateFormData('email3', e.target.value)} type="email" />
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Phone Numbers</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 1" value={formData.phone1} onChange={(e) => updateFormData('phone1', e.target.value)} />
              <Input placeholder="Type" value={formData.phone1Type} onChange={(e) => updateFormData('phone1Type', e.target.value)} />
              <Input placeholder="Extension" value={formData.phone1Ext} onChange={(e) => updateFormData('phone1Ext', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 2" value={formData.phone2} onChange={(e) => updateFormData('phone2', e.target.value)} />
              <Input placeholder="Type" value={formData.phone2Type} onChange={(e) => updateFormData('phone2Type', e.target.value)} />
              <Input placeholder="Extension" value={formData.phone2Ext} onChange={(e) => updateFormData('phone2Ext', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 3" value={formData.phone3} onChange={(e) => updateFormData('phone3', e.target.value)} />
              <Input placeholder="Type" value={formData.phone3Type} onChange={(e) => updateFormData('phone3Type', e.target.value)} />
              <Input placeholder="Extension" value={formData.phone3Ext} onChange={(e) => updateFormData('phone3Ext', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 4" value={formData.phone4} onChange={(e) => updateFormData('phone4', e.target.value)} />
              <Input placeholder="Type" value={formData.phone4Type} onChange={(e) => updateFormData('phone4Type', e.target.value)} />
              <Input placeholder="Extension" value={formData.phone4Ext} onChange={(e) => updateFormData('phone4Ext', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 5" value={formData.phone5} onChange={(e) => updateFormData('phone5', e.target.value)} />
              <Input placeholder="Type" value={formData.phone5Type} onChange={(e) => updateFormData('phone5Type', e.target.value)} />
              <Input placeholder="Extension" value={formData.phone5Ext} onChange={(e) => updateFormData('phone5Ext', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Fax Numbers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Fax Numbers</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Fax 1" value={formData.fax1} onChange={(e) => updateFormData('fax1', e.target.value)} />
              <Input placeholder="Type" value={formData.fax1Type} onChange={(e) => updateFormData('fax1Type', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Fax 2" value={formData.fax2} onChange={(e) => updateFormData('fax2', e.target.value)} />
              <Input placeholder="Type" value={formData.fax2Type} onChange={(e) => updateFormData('fax2Type', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Addresses</h2>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Billing Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <Input placeholder="Address Line 1" value={formData.billingLine1} onChange={(e) => updateFormData('billingLine1', e.target.value)} />
              <Input placeholder="Address Line 2" value={formData.billingLine2} onChange={(e) => updateFormData('billingLine2', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="City" value={formData.billingCity} onChange={(e) => updateFormData('billingCity', e.target.value)} />
              <Input placeholder="State/Region" value={formData.billingRegion} onChange={(e) => updateFormData('billingRegion', e.target.value)} />
              <Input placeholder="ZIP/Postal" value={formData.billingPostal} onChange={(e) => updateFormData('billingPostal', e.target.value)} />
              <Select value={formData.billingCountry} onChange={(e) => updateFormData('billingCountry', e.target.value)}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
                <option value="GB">United Kingdom</option>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <Input placeholder="Address Line 1" value={formData.shippingLine1} onChange={(e) => updateFormData('shippingLine1', e.target.value)} />
              <Input placeholder="Address Line 2" value={formData.shippingLine2} onChange={(e) => updateFormData('shippingLine2', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="City" value={formData.shippingCity} onChange={(e) => updateFormData('shippingCity', e.target.value)} />
              <Input placeholder="State/Region" value={formData.shippingRegion} onChange={(e) => updateFormData('shippingRegion', e.target.value)} />
              <Input placeholder="ZIP/Postal" value={formData.shippingPostal} onChange={(e) => updateFormData('shippingPostal', e.target.value)} />
              <Select value={formData.shippingCountry} onChange={(e) => updateFormData('shippingCountry', e.target.value)}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
                <option value="GB">United Kingdom</option>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Other Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <Input placeholder="Address Line 1" value={formData.otherLine1} onChange={(e) => updateFormData('otherLine1', e.target.value)} />
              <Input placeholder="Address Line 2" value={formData.otherLine2} onChange={(e) => updateFormData('otherLine2', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="City" value={formData.otherCity} onChange={(e) => updateFormData('otherCity', e.target.value)} />
              <Input placeholder="State/Region" value={formData.otherRegion} onChange={(e) => updateFormData('otherRegion', e.target.value)} />
              <Input placeholder="ZIP/Postal" value={formData.otherPostal} onChange={(e) => updateFormData('otherPostal', e.target.value)} />
              <Select value={formData.otherCountry} onChange={(e) => updateFormData('otherCountry', e.target.value)}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
                <option value="GB">United Kingdom</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
              <Input type="datetime-local" value={formData.birthday} onChange={(e) => updateFormData('birthday', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anniversary</label>
              <Input type="date" value={formData.anniversary} onChange={(e) => updateFormData('anniversary', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Contact Type" value={formData.contactType} onChange={(e) => updateFormData('contactType', e.target.value)} />
            <Select value={formData.sourceType} onChange={(e) => updateFormData('sourceType', e.target.value)}>
              <option value="">Select Source</option>
              <option value="APPOINTMENT">APPOINTMENT</option>
              <option value="FORMAPIHOSTED">FORMAPIHOSTED</option>
              <option value="FORMAPIINTERNAL">FORMAPIINTERNAL</option>
              <option value="WEBFORM">WEBFORM</option>
              <option value="INTERNALFORM">INTERNALFORM</option>
              <option value="LANDINGPAGE">LANDINGPAGE</option>
              <option value="IMPORT">IMPORT</option>
              <option value="MANUAL">MANUAL</option>
              <option value="API">API</option>
              <option value="OTHER">OTHER</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </Select>
            <Select value={formData.duplicateOption} onChange={(e) => updateFormData('duplicateOption', e.target.value)}>
              <option value="">Create new</option>
              <option value="Email">Email</option>
              <option value="EmailAndName">EmailAndName</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input type="number" placeholder="Company ID" value={formData.companyId} onChange={(e) => updateFormData('companyId', e.target.value)} />
            <Input type="number" placeholder="Lead Source ID" value={formData.leadSourceId} onChange={(e) => updateFormData('leadSourceId', e.target.value)} />
            <Input type="number" placeholder="Owner ID" value={formData.ownerId} onChange={(e) => updateFormData('ownerId', e.target.value)} />
            <Input placeholder="Website" value={formData.website} onChange={(e) => updateFormData('website', e.target.value)} />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={resetForm} disabled={loading}>Clear Form</Button>
          <Button type="submit" disabled={loading || (!formData.givenName.trim() && !formData.familyName.trim())}>
            {loading ? 'Creating Contact...' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
}