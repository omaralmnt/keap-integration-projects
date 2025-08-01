import { useState } from 'react';
import keapAPI from '../services/keapAPI';
import { toast } from 'react-toastify';

export function CreateOrUpdateContact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Basic Info
    givenName: '', familyName: '', middleName: '', preferredName: '', prefix: '', suffix: '',
    jobTitle: '', contactType: '', spouseName: '', birthday: '', anniversary: '', website: '',

    // Email Addresses
    email1: '', email2: '', email3: '',

    // Phone Numbers
    phone1: '', phone1Type: '', phone1Ext: '', phone2: '', phone2Type: '', phone2Ext: '',
    phone3: '', phone3Type: '', phone3Ext: '', phone4: '', phone4Type: '', phone4Ext: '',
    phone5: '', phone5Type: '', phone5Ext: '',

    // Fax Numbers
    fax1: '', fax1Type: '', fax2: '', fax2Type: '',

    // Addresses
    billingLine1: '', billingLine2: '', billingCity: '', billingRegion: '', billingPostal: '',
    billingZip: '', billingZipFour: '', billingCountry: 'US',
    shippingLine1: '', shippingLine2: '', shippingCity: '', shippingRegion: '', shippingPostal: '',
    shippingZip: '', shippingZipFour: '', shippingCountry: 'US',
    otherLine1: '', otherLine2: '', otherCity: '', otherRegion: '', otherPostal: '',
    otherZip: '', otherZipFour: '', otherCountry: 'US',

    // Social Accounts
    socialName1: '', socialType1: '', socialName2: '', socialType2: '',

    // Custom Fields
    customField1Id: '', customField1Content: '', customField2Id: '', customField2Content: '',

    // Settings
    companyId: '', leadSourceId: '', ownerId: '', optInReason: '', preferredLocale: 'en_US',
    timeZone: '', sourceType: '', duplicateOption: 'Email', ipAddress: ''
  });

  const updateFormData = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => { // ← Agregué async aquí
    try {
      if (!formData.givenName.trim() && !formData.familyName.trim()) {
        setError('Please provide at least a given name or family name');
        return;
      }
      if (!formData.email1 && !formData.phone1) {
        setError('Must provide at least one email or phone number');
        return;
      }

      setLoading(true);
      setError('');

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
      if (formData.birthday) payload.birthday = new Date(formData.birthday).toISOString();
      if (formData.anniversary) payload.anniversary = formData.anniversary;
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

      // Social accounts
      const socialAccounts = [];
      if (formData.socialName1) socialAccounts.push({ name: formData.socialName1, type: formData.socialType1 });
      if (formData.socialName2) socialAccounts.push({ name: formData.socialName2, type: formData.socialType2 });
      if (socialAccounts.length > 0) payload.social_accounts = socialAccounts;

      // Custom fields
      const customFields = [];
      if (formData.customField1Id) customFields.push({ id: parseInt(formData.customField1Id), content: formData.customField1Content });
      if (formData.customField2Id) customFields.push({ id: parseInt(formData.customField2Id), content: formData.customField2Content });
      if (customFields.length > 0) payload.custom_fields = customFields;

      // Settings
      if (formData.companyId) payload.company = { id: parseInt(formData.companyId) };
      if (formData.leadSourceId) payload.lead_source_id = parseInt(formData.leadSourceId);
      if (formData.ownerId) payload.owner_id = parseInt(formData.ownerId);
      if (formData.optInReason) payload.opt_in_reason = formData.optInReason;
      if (formData.preferredLocale) payload.preferred_locale = formData.preferredLocale;
      if (formData.timeZone) payload.time_zone = formData.timeZone;
      if (formData.sourceType) payload.source_type = formData.sourceType;
      if (formData.duplicateOption) payload.duplicate_option = formData.duplicateOption;
      if (formData.ipAddress) payload.origin = { ip_address: formData.ipAddress };

      console.log('Payload:', payload);

      // ← CAMBIOS PRINCIPALES AQUÍ:
      const response = await keapAPI.createOrUpdateContact(payload); // Usar el método correcto + await
      console.log('Success response:', response);

      // Mostrar mensaje de éxito usando setError en lugar de toast
      setError(''); // Limpiar errores
      toast.success('Contact created/updated successfully')

    } catch (error) {
      console.error('Error creating contact:', error);

      // Manejar diferentes tipos de errores
      let errorMessage = 'Error creating/updating the contact';

      if (error.response) {
        // Error del servidor con respuesta
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.message) {
        // Error con mensaje específico
        errorMessage = error.message;
      }

      setError(errorMessage);
      setSuccess(false);

    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      givenName: '', familyName: '', middleName: '', preferredName: '', prefix: '', suffix: '',
      jobTitle: '', contactType: '', spouseName: '', birthday: '', anniversary: '', website: '',
      email1: '', email2: '', email3: '',
      phone1: '', phone1Type: '', phone1Ext: '', phone2: '', phone2Type: '', phone2Ext: '',
      phone3: '', phone3Type: '', phone3Ext: '', phone4: '', phone4Type: '', phone4Ext: '',
      phone5: '', phone5Type: '', phone5Ext: '',
      fax1: '', fax1Type: '', fax2: '', fax2Type: '',
      billingLine1: '', billingLine2: '', billingCity: '', billingRegion: '', billingPostal: '',
      billingZip: '', billingZipFour: '', billingCountry: 'US',
      shippingLine1: '', shippingLine2: '', shippingCity: '', shippingRegion: '', shippingPostal: '',
      shippingZip: '', shippingZipFour: '', shippingCountry: 'US',
      otherLine1: '', otherLine2: '', otherCity: '', otherRegion: '', otherPostal: '',
      otherZip: '', otherZipFour: '', otherCountry: 'US',
      socialName1: '', socialType1: '', socialName2: '', socialType2: '',
      customField1Id: '', customField1Content: '', customField2Id: '', customField2Content: '',
      companyId: '', leadSourceId: '', ownerId: '', optInReason: '', preferredLocale: 'en_US',
      timeZone: '', sourceType: '', duplicateOption: 'Email', ipAddress: ''
    });
    setSuccess(false);
    setError('');
  };

  const inputClass = "w-full px-2 py-1 text-sm border border-gray-300 rounded";
  const selectClass = "w-full px-2 py-1 text-sm border border-gray-300 rounded";
  const sectionClass = "bg-white p-4 rounded shadow";
  const gridClass = "grid grid-cols-2 md:grid-cols-3 gap-2";

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Create Contact</h1>

      {/* {success && <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800">Contact created! 🎉</div>} */}
      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">{error}</div>}

      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className="font-medium mb-2">Basic Info</h2>
        <div className={gridClass}>
          <input placeholder="Given Name *" value={formData.givenName} onChange={(e) => updateFormData('givenName', e.target.value)} className={inputClass} />
          <input placeholder="Middle Name" value={formData.middleName} onChange={(e) => updateFormData('middleName', e.target.value)} className={inputClass} />
          <input placeholder="Family Name" value={formData.familyName} onChange={(e) => updateFormData('familyName', e.target.value)} className={inputClass} />
          <input placeholder="Prefix" value={formData.prefix} onChange={(e) => updateFormData('prefix', e.target.value)} className={inputClass} />
          <input placeholder="Preferred Name" value={formData.preferredName} onChange={(e) => updateFormData('preferredName', e.target.value)} className={inputClass} />
          <input placeholder="Suffix" value={formData.suffix} onChange={(e) => updateFormData('suffix', e.target.value)} className={inputClass} />
          <input placeholder="Job Title" value={formData.jobTitle} onChange={(e) => updateFormData('jobTitle', e.target.value)} className={inputClass} />
          <select value={formData.contactType} onChange={(e) => updateFormData('contactType', e.target.value)} className={selectClass}>
            <option value="">Contact Type</option>
            <option value="Lead">Lead</option>
            <option value="Client">Client</option>
            <option value="Other">Other</option>
          </select>
          <input placeholder="Spouse Name" value={formData.spouseName} onChange={(e) => updateFormData('spouseName', e.target.value)} className={inputClass} />
          <input placeholder="Website" value={formData.website} onChange={(e) => updateFormData('website', e.target.value)} className={inputClass} />
          <input type="datetime-local" placeholder="Birthday" value={formData.birthday} onChange={(e) => updateFormData('birthday', e.target.value)} className={inputClass} />
          <input type="date" placeholder="Anniversary" value={formData.anniversary} onChange={(e) => updateFormData('anniversary', e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Emails */}
      <div className={sectionClass}>
        <h2 className="font-medium mb-2">Emails</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input type="email" placeholder="Email 1 *" value={formData.email1} onChange={(e) => updateFormData('email1', e.target.value)} className={inputClass} />
          <input type="email" placeholder="Email 2" value={formData.email2} onChange={(e) => updateFormData('email2', e.target.value)} className={inputClass} />
          <input type="email" placeholder="Email 3" value={formData.email3} onChange={(e) => updateFormData('email3', e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Phones */}
      <div className={sectionClass}>
        <h2 className="font-medium mb-2">Phones</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input placeholder={`Phone ${i} ${i === 1 ? '*' : ''}`} value={formData[`phone${i}`]} onChange={(e) => updateFormData(`phone${i}`, e.target.value)} className={inputClass} />
              <select value={formData[`phone${i}Type`]} onChange={(e) => updateFormData(`phone${i}Type`, e.target.value)} className={selectClass}>
                <option value="">Type</option>
                <option value="HOME">HOME</option>
                <option value="WORK">WORK</option>
                <option value="MOBILE">MOBILE</option>
                <option value="OTHER">OTHER</option>
              </select>
              <input placeholder="Extension" value={formData[`phone${i}Ext`]} onChange={(e) => updateFormData(`phone${i}Ext`, e.target.value)} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {/* Fax */}
      <div className={sectionClass}>
        <h2 className="font-medium mb-2">Fax</h2>
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input placeholder={`Fax ${i}`} value={formData[`fax${i}`]} onChange={(e) => updateFormData(`fax${i}`, e.target.value)} className={inputClass} />
              <select value={formData[`fax${i}Type`]} onChange={(e) => updateFormData(`fax${i}Type`, e.target.value)} className={selectClass}>
                <option value="">Type</option>
                <option value="Home">HOME</option>
                <option value="Work">WORK</option>
                <option value="Other">OTHER</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Addresses */}
      <div className={sectionClass}>
        <h2 className="font-medium mb-2">Addresses</h2>
        {['billing', 'shipping', 'other'].map(type => (
          <div key={type} className="mb-4">
            <h3 className="text-sm font-medium mb-2 capitalize">{type}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input placeholder="Line 1" value={formData[`${type}Line1`]} onChange={(e) => updateFormData(`${type}Line1`, e.target.value)} className={inputClass} />
              <input placeholder="Line 2" value={formData[`${type}Line2`]} onChange={(e) => updateFormData(`${type}Line2`, e.target.value)} className={inputClass} />
              <input placeholder="City" value={formData[`${type}City`]} onChange={(e) => updateFormData(`${type}City`, e.target.value)} className={inputClass} />
              <input placeholder="Region" value={formData[`${type}Region`]} onChange={(e) => updateFormData(`${type}Region`, e.target.value)} className={inputClass} />
              <input placeholder="Postal" value={formData[`${type}Postal`]} onChange={(e) => updateFormData(`${type}Postal`, e.target.value)} className={inputClass} />
              <input placeholder="ZIP" value={formData[`${type}Zip`]} onChange={(e) => updateFormData(`${type}Zip`, e.target.value)} className={inputClass} />
              <input placeholder="ZIP+4" value={formData[`${type}ZipFour`]} onChange={(e) => updateFormData(`${type}ZipFour`, e.target.value)} className={inputClass} />
              <select value={formData[`${type}Country`]} onChange={(e) => updateFormData(`${type}Country`, e.target.value)} className={selectClass}>
                <option value="US">US</option>
                <option value="CA">CA</option>
                <option value="MX">MX</option>
                <option value="GB">GB</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Social & Custom */}
      <div className={sectionClass}>
        <h2 className="font-medium mb-2">Social & Custom</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <input placeholder="Social Name 1" value={formData.socialName1} onChange={(e) => updateFormData('socialName1', e.target.value)} className={inputClass} />
          <select value={formData.socialType1} onChange={(e) => updateFormData('socialType1', e.target.value)} className={selectClass}>
            <option value="">Social Type</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
          </select>
          <input placeholder="Social Name 2" value={formData.socialName2} onChange={(e) => updateFormData('socialName2', e.target.value)} className={inputClass} />
          <select value={formData.socialType2} onChange={(e) => updateFormData('socialType2', e.target.value)} className={selectClass}>
            <option value="">Social Type</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input type="number" placeholder="Custom Field 1 ID" value={formData.customField1Id} onChange={(e) => updateFormData('customField1Id', e.target.value)} className={inputClass} />
          <input placeholder="Custom Field 1 Content" value={formData.customField1Content} onChange={(e) => updateFormData('customField1Content', e.target.value)} className={inputClass} />
          <input type="number" placeholder="Custom Field 2 ID" value={formData.customField2Id} onChange={(e) => updateFormData('customField2Id', e.target.value)} className={inputClass} />
          <input placeholder="Custom Field 2 Content" value={formData.customField2Content} onChange={(e) => updateFormData('customField2Content', e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Settings */}
      <div className={sectionClass}>
        <h2 className="font-medium mb-2">Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input type="number" placeholder="Company ID" value={formData.companyId} onChange={(e) => updateFormData('companyId', e.target.value)} className={inputClass} />
          <input type="number" placeholder="Lead Source ID" value={formData.leadSourceId} onChange={(e) => updateFormData('leadSourceId', e.target.value)} className={inputClass} />
          <input type="number" placeholder="Owner ID" value={formData.ownerId} onChange={(e) => updateFormData('ownerId', e.target.value)} className={inputClass} />
          <input placeholder="Opt-in Reason" value={formData.optInReason} onChange={(e) => updateFormData('optInReason', e.target.value)} className={inputClass} />
          <select value={formData.preferredLocale} onChange={(e) => updateFormData('preferredLocale', e.target.value)} className={selectClass}>
            <option value="en_US">en_US</option>
            <option value="es_ES">es_ES</option>
            <option value="fr_FR">fr_FR</option>
          </select>
          <input placeholder="Time Zone" value={formData.timeZone} onChange={(e) => updateFormData('timeZone', e.target.value)} className={inputClass} />
          <select value={formData.sourceType} onChange={(e) => updateFormData('sourceType', e.target.value)} className={selectClass}>
            <option value="">Source Type</option>
            <option value="APPOINTMENT">APPOINTMENT</option>
            <option value="WEBFORM">WEBFORM</option>
            <option value="IMPORT">IMPORT</option>
            <option value="MANUAL">MANUAL</option>
            <option value="API">API</option>
          </select>
          <select value={formData.duplicateOption} onChange={(e) => updateFormData('duplicateOption', e.target.value)} className={selectClass}>
            <option value="Email">Email</option>
            <option value="EmailAndName">EmailAndName</option>
          </select>
          <input placeholder="IP Address" value={formData.ipAddress} onChange={(e) => updateFormData('ipAddress', e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button onClick={resetForm} disabled={loading} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50">
          Clear
        </button>
        <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Contact'}
        </button>
      </div>
    </div>
  );
}