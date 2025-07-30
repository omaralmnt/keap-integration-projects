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

  // Basic Info
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [contactType, setContactType] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [website, setWebsite] = useState('');

  // Email Addresses (fixed 3)
  const [email1, setEmail1] = useState('');
  const [email2, setEmail2] = useState('');
  const [email3, setEmail3] = useState('');

  // Phone Numbers (fixed 5)
  const [phone1, setPhone1] = useState('');
  const [phone1Type, setPhone1Type] = useState('');
  const [phone1Ext, setPhone1Ext] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone2Type, setPhone2Type] = useState('');
  const [phone2Ext, setPhone2Ext] = useState('');
  const [phone3, setPhone3] = useState('');
  const [phone3Type, setPhone3Type] = useState('');
  const [phone3Ext, setPhone3Ext] = useState('');
  const [phone4, setPhone4] = useState('');
  const [phone4Type, setPhone4Type] = useState('');
  const [phone4Ext, setPhone4Ext] = useState('');
  const [phone5, setPhone5] = useState('');
  const [phone5Type, setPhone5Type] = useState('');
  const [phone5Ext, setPhone5Ext] = useState('');

  // Fax Numbers (fixed 2)
  const [fax1, setFax1] = useState('');
  const [fax1Type, setFax1Type] = useState('');
  const [fax2, setFax2] = useState('');
  const [fax2Type, setFax2Type] = useState('');

  // Addresses (fixed 3)
  const [billingLine1, setBillingLine1] = useState('');
  const [billingLine2, setBillingLine2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingRegion, setBillingRegion] = useState('');
  const [billingPostal, setBillingPostal] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingZipFour, setBillingZipFour] = useState('');
  const [billingCountry, setBillingCountry] = useState('US');

  const [shippingLine1, setShippingLine1] = useState('');
  const [shippingLine2, setShippingLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingRegion, setShippingRegion] = useState('');
  const [shippingPostal, setShippingPostal] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingZipFour, setShippingZipFour] = useState('');
  const [shippingCountry, setShippingCountry] = useState('US');

  const [otherLine1, setOtherLine1] = useState('');
  const [otherLine2, setOtherLine2] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [otherRegion, setOtherRegion] = useState('');
  const [otherPostal, setOtherPostal] = useState('');
  const [otherZip, setOtherZip] = useState('');
  const [otherZipFour, setOtherZipFour] = useState('');
  const [otherCountry, setOtherCountry] = useState('US');

  // Settings
  const [companyId, setCompanyId] = useState('');
  const [leadSourceId, setLeadSourceId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [optInReason, setOptInReason] = useState('');
  const [preferredLocale, setPreferredLocale] = useState('en_US');
  const [timeZone, setTimeZone] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [duplicateOption, setDuplicateOption] = useState('Email');

  const formatDateForAPI = (dateString) => dateString ? new Date(dateString).toISOString() : undefined;
  const formatDateOnly = (dateString) => dateString ? dateString.split('T')[0] : undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!givenName.trim() && !familyName.trim()) {
      setError('Please provide at least a given name or family name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const payload = {};

      // Basic info
      if (givenName) payload.given_name = givenName;
      if (familyName) payload.family_name = familyName;
      if (middleName) payload.middle_name = middleName;
      if (preferredName) payload.preferred_name = preferredName;
      if (prefix) payload.prefix = prefix;
      if (suffix) payload.suffix = suffix;
      if (jobTitle) payload.job_title = jobTitle;
      if (contactType) payload.contact_type = contactType;
      if (spouseName) payload.spouse_name = spouseName;
      if (birthday) payload.birthday = formatDateForAPI(birthday);
      if (anniversary) payload.anniversary = formatDateOnly(anniversary);
      if (website) payload.website = website;

      // Email addresses
      const emailAddresses = [];
      if (email1) emailAddresses.push({ email: email1, field: 'EMAIL1' });
      if (email2) emailAddresses.push({ email: email2, field: 'EMAIL2' });
      if (email3) emailAddresses.push({ email: email3, field: 'EMAIL3' });
      if (emailAddresses.length > 0) payload.email_addresses = emailAddresses;

      // Phone numbers
      const phoneNumbers = [];
      if (phone1) phoneNumbers.push({ number: phone1, field: 'PHONE1', type: phone1Type || undefined, extension: phone1Ext || undefined });
      if (phone2) phoneNumbers.push({ number: phone2, field: 'PHONE2', type: phone2Type || undefined, extension: phone2Ext || undefined });
      if (phone3) phoneNumbers.push({ number: phone3, field: 'PHONE3', type: phone3Type || undefined, extension: phone3Ext || undefined });
      if (phone4) phoneNumbers.push({ number: phone4, field: 'PHONE4', type: phone4Type || undefined, extension: phone4Ext || undefined });
      if (phone5) phoneNumbers.push({ number: phone5, field: 'PHONE5', type: phone5Type || undefined, extension: phone5Ext || undefined });
      if (phoneNumbers.length > 0) payload.phone_numbers = phoneNumbers;

      // Fax numbers
      const faxNumbers = [];
      if (fax1) faxNumbers.push({ number: fax1, field: 'FAX1', type: fax1Type || undefined });
      if (fax2) faxNumbers.push({ number: fax2, field: 'FAX2', type: fax2Type || undefined });
      if (faxNumbers.length > 0) payload.fax_numbers = faxNumbers;

      // Addresses
      const addresses = [];
      if (billingLine1) addresses.push({
        field: 'BILLING', line1: billingLine1, line2: billingLine2 || undefined,
        locality: billingCity || undefined, region: billingRegion || undefined,
        postal_code: billingPostal || undefined, zip_code: billingZip || undefined,
        zip_four: billingZipFour || undefined, country_code: billingCountry
      });
      if (shippingLine1) addresses.push({
        field: 'SHIPPING', line1: shippingLine1, line2: shippingLine2 || undefined,
        locality: shippingCity || undefined, region: shippingRegion || undefined,
        postal_code: shippingPostal || undefined, zip_code: shippingZip || undefined,
        zip_four: shippingZipFour || undefined, country_code: shippingCountry
      });
      if (otherLine1) addresses.push({
        field: 'OTHER', line1: otherLine1, line2: otherLine2 || undefined,
        locality: otherCity || undefined, region: otherRegion || undefined,
        postal_code: otherPostal || undefined, zip_code: otherZip || undefined,
        zip_four: otherZipFour || undefined, country_code: otherCountry
      });
      if (addresses.length > 0) payload.addresses = addresses;

      // Settings
      if (companyId) payload.company = { id: parseInt(companyId) };
      if (leadSourceId) payload.lead_source_id = parseInt(leadSourceId);
      if (ownerId) payload.owner_id = parseInt(ownerId);
      if (optInReason) payload.opt_in_reason = optInReason;
      if (preferredLocale) payload.preferred_locale = preferredLocale;
      if (timeZone) payload.time_zone = timeZone;
      if (sourceType) payload.source_type = sourceType;
      if (duplicateOption) payload.duplicate_option = duplicateOption;

      const response = await keapAPI.createContact(payload);
      setSuccess(true);
      setTimeout(() => resetForm(), 2000);
      
    } catch (error) {
      setError(error.message || 'Failed to create contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGivenName(''); setFamilyName(''); setMiddleName(''); setPreferredName(''); setPrefix(''); setSuffix('');
    setJobTitle(''); setContactType(''); setSpouseName(''); setBirthday(''); setAnniversary(''); setWebsite('');
    setEmail1(''); setEmail2(''); setEmail3('');
    setPhone1(''); setPhone1Type(''); setPhone1Ext(''); setPhone2(''); setPhone2Type(''); setPhone2Ext('');
    setPhone3(''); setPhone3Type(''); setPhone3Ext(''); setPhone4(''); setPhone4Type(''); setPhone4Ext('');
    setPhone5(''); setPhone5Type(''); setPhone5Ext('');
    setFax1(''); setFax1Type(''); setFax2(''); setFax2Type('');
    setBillingLine1(''); setBillingLine2(''); setBillingCity(''); setBillingRegion(''); setBillingPostal('');
    setBillingZip(''); setBillingZipFour(''); setBillingCountry('US');
    setShippingLine1(''); setShippingLine2(''); setShippingCity(''); setShippingRegion(''); setShippingPostal('');
    setShippingZip(''); setShippingZipFour(''); setShippingCountry('US');
    setOtherLine1(''); setOtherLine2(''); setOtherCity(''); setOtherRegion(''); setOtherPostal('');
    setOtherZip(''); setOtherZipFour(''); setOtherCountry('US');
    setCompanyId(''); setLeadSourceId(''); setOwnerId(''); setOptInReason(''); setPreferredLocale('en_US');
    setTimeZone(''); setSourceType(''); setDuplicateOption('Email');
    setSuccess(false); setError('');
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
            <Input placeholder="Given Name *" value={givenName} onChange={(e) => setGivenName(e.target.value)} />
            <Input placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            <Input placeholder="Family Name" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
            <Input placeholder="Preferred Name" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
            <Input placeholder="Suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Input placeholder="Spouse Name" value={spouseName} onChange={(e) => setSpouseName(e.target.value)} />
          </div>
        </div>

        {/* Email Addresses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Email Addresses</h2>
          <div className="space-y-3">
            <Input placeholder="Email 1" value={email1} onChange={(e) => setEmail1(e.target.value)} type="email" />
            <Input placeholder="Email 2" value={email2} onChange={(e) => setEmail2(e.target.value)} type="email" />
            <Input placeholder="Email 3" value={email3} onChange={(e) => setEmail3(e.target.value)} type="email" />
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Phone Numbers</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 1" value={phone1} onChange={(e) => setPhone1(e.target.value)} />
              <Input placeholder="Type" value={phone1Type} onChange={(e) => setPhone1Type(e.target.value)} />
              <Input placeholder="Extension" value={phone1Ext} onChange={(e) => setPhone1Ext(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 2" value={phone2} onChange={(e) => setPhone2(e.target.value)} />
              <Input placeholder="Type" value={phone2Type} onChange={(e) => setPhone2Type(e.target.value)} />
              <Input placeholder="Extension" value={phone2Ext} onChange={(e) => setPhone2Ext(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 3" value={phone3} onChange={(e) => setPhone3(e.target.value)} />
              <Input placeholder="Type" value={phone3Type} onChange={(e) => setPhone3Type(e.target.value)} />
              <Input placeholder="Extension" value={phone3Ext} onChange={(e) => setPhone3Ext(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 4" value={phone4} onChange={(e) => setPhone4(e.target.value)} />
              <Input placeholder="Type" value={phone4Type} onChange={(e) => setPhone4Type(e.target.value)} />
              <Input placeholder="Extension" value={phone4Ext} onChange={(e) => setPhone4Ext(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Phone 5" value={phone5} onChange={(e) => setPhone5(e.target.value)} />
              <Input placeholder="Type" value={phone5Type} onChange={(e) => setPhone5Type(e.target.value)} />
              <Input placeholder="Extension" value={phone5Ext} onChange={(e) => setPhone5Ext(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Fax Numbers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Fax Numbers</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Fax 1" value={fax1} onChange={(e) => setFax1(e.target.value)} />
              <Input placeholder="Type" value={fax1Type} onChange={(e) => setFax1Type(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Fax 2" value={fax2} onChange={(e) => setFax2(e.target.value)} />
              <Input placeholder="Type" value={fax2Type} onChange={(e) => setFax2Type(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Addresses</h2>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Billing Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <Input placeholder="Address Line 1" value={billingLine1} onChange={(e) => setBillingLine1(e.target.value)} />
              <Input placeholder="Address Line 2" value={billingLine2} onChange={(e) => setBillingLine2(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="City" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
              <Input placeholder="State/Region" value={billingRegion} onChange={(e) => setBillingRegion(e.target.value)} />
              <Input placeholder="ZIP/Postal" value={billingPostal} onChange={(e) => setBillingPostal(e.target.value)} />
              <Select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)}>
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
              <Input placeholder="Address Line 1" value={shippingLine1} onChange={(e) => setShippingLine1(e.target.value)} />
              <Input placeholder="Address Line 2" value={shippingLine2} onChange={(e) => setShippingLine2(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="City" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} />
              <Input placeholder="State/Region" value={shippingRegion} onChange={(e) => setShippingRegion(e.target.value)} />
              <Input placeholder="ZIP/Postal" value={shippingPostal} onChange={(e) => setShippingPostal(e.target.value)} />
              <Select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)}>
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
              <Input placeholder="Address Line 1" value={otherLine1} onChange={(e) => setOtherLine1(e.target.value)} />
              <Input placeholder="Address Line 2" value={otherLine2} onChange={(e) => setOtherLine2(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="City" value={otherCity} onChange={(e) => setOtherCity(e.target.value)} />
              <Input placeholder="State/Region" value={otherRegion} onChange={(e) => setOtherRegion(e.target.value)} />
              <Input placeholder="ZIP/Postal" value={otherPostal} onChange={(e) => setOtherPostal(e.target.value)} />
              <Select value={otherCountry} onChange={(e) => setOtherCountry(e.target.value)}>
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
              <Input type="datetime-local" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anniversary</label>
              <Input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Contact Type" value={contactType} onChange={(e) => setContactType(e.target.value)} />
            <Select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
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
            <Select value={duplicateOption} onChange={(e) => setDuplicateOption(e.target.value)}>
              <option value="Email">Email</option>
              <option value="EmailAndName">EmailAndName</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input type="number" placeholder="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
            <Input type="number" placeholder="Lead Source ID" value={leadSourceId} onChange={(e) => setLeadSourceId(e.target.value)} />
            <Input type="number" placeholder="Owner ID" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} />
            <Input placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={resetForm} disabled={loading}>Clear Form</Button>
          <Button type="submit" disabled={loading || (!givenName.trim() && !familyName.trim())}>
            {loading ? 'Creating Contact...' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
}