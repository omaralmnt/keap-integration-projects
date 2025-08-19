import { useState } from 'react';
import { toast } from 'react-toastify';
import keapAPI from '../../services/keapAPI';

export function CreateContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
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
    timeZone: '', sourceType: '', ipAddress: ''
  });

  const updateFormData = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
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
      if (formData.givenName) payload.FirstName = formData.givenName;
      if (formData.familyName) payload.LastName = formData.familyName;
      if (formData.middleName) payload.MiddleName = formData.middleName;
      // if (formData.preferredName) payload.preferred_name = formData.preferredName;
      // if (formData.prefix) payload.prefix = formData.prefix;
      if (formData.suffix) payload.Suffix = formData.suffix;
      if (formData.jobTitle) payload.JobTitle = formData.jobTitle;
      if (formData.contactType) payload.ContactType = formData.contactType;
      if (formData.spouseName) payload.SpouseName = formData.spouseName;
      if (formData.birthday) payload.Birthday = new Date(formData.birthday).toISOString();
      if (formData.anniversary) payload.Anniversary = formData.anniversary;
      if (formData.website) payload.Website = formData.website;

      if (formData.email1) payload.Email = formData.email1;
      if (formData.email2) payload.EmailAddress2 = formData.email2;
      if (formData.email3) payload.EmailAddress3 = formData.email3;

      if (formData.phone1) payload.Phone1 = formData.phone1;
      if (formData.phone1Type) payload.Phone1Type = formData.phone1Type;
      if (formData.phone1Ext) payload.Phone1Ext = formData.phone1Ext;

      if (formData.phone2) payload.Phone2 = formData.phone2;
      if (formData.phone2Type) payload.Phone2Type = formData.phone2Type;
      if (formData.phone2Ext) payload.Phone2Ext = formData.phone2Ext;      
  
      if (formData.phone3) payload.Phone3 = formData.phone3;
      if (formData.phone3Type) payload.Phone3Type = formData.phone3Type;
      if (formData.phone3Ext) payload.Phone3Ext = formData.phone3Ext;     

      if (formData.phone4) payload.Phone4 = formData.phone4;
      if (formData.phone4Type) payload.Phone4Type = formData.phone4Type;
      if (formData.phone4Ext) payload.Phone4Ext = formData.phone4Ext;     
    
      if (formData.phone5) payload.Phone5 = formData.phone5;
      if (formData.phone5Type) payload.Phone5Type = formData.phone5Type;
      if (formData.phone5Ext) payload.Phone5Ext = formData.phone5Ext;     

      // // Fax numbers
    
      if (formData.fax1) payload.Fax1 = formData.fax1;
      if (formData.fax1Type) payload.fax1Type = formData.fax1Type;
  
      if (formData.fax2) payload.Fax2 = formData.fax2;
      if (formData.fax2Type) payload.fax2Type = formData.fax2Type;


if (formData.billingLine1) payload.StreetAddress1 = formData.billingLine1;
if (formData.billingLine2) payload.StreetAddress2 = formData.billingLine2;
if (formData.billingCity) payload.City = formData.billingCity;
if (formData.billingRegion) payload.State = formData.billingRegion;
if (formData.billingPostal) payload.PostalCode = formData.billingPostal;
if (formData.billingZipFour) payload.ZipFour1 = formData.billingZipFour;
if (formData.billingCountry) payload.Country = formData.billingCountry;
if (formData.billingType) payload.Address1Type = formData.billingType;
// Address 2 (Secondary)
if (formData.shippingLine1) payload.Address2Street1 = formData.shippingLine1;
if (formData.shippingLine2) payload.Address2Street2 = formData.shippingLine2;
if (formData.shippingCity) payload.City2 = formData.shippingCity;
if (formData.shippingRegion) payload.State2 = formData.shippingRegion;
if (formData.shippingPostal) payload.PostalCode2 = formData.shippingPostal;
if (formData.shippingZipFour) payload.ZipFour2 = formData.shippingZipFour;
if (formData.shippingCountry) payload.Country2 = formData.shippingCountry;
if (formData.shippingType) payload.Address2Type = formData.shippingType;

// Address 3 (Tertiary)
if (formData.otherLine1) payload.Address3Street1 = formData.otherLine1;
if (formData.otherLine2) payload.Address3Street2 = formData.otherLine2;
if (formData.otherCity) payload.City3 = formData.otherCity;
if (formData.otherRegion) payload.State3 = formData.otherRegion;
if (formData.otherPostal) payload.PostalCode3 = formData.otherPostal;
if (formData.otherZipFour) payload.ZipFour3 = formData.otherZipFour;
if (formData.otherCountry) payload.Country3 = formData.otherCountry;
if (formData.otherType) payload.Address3Type = formData.otherType;
      console.log('Payload:', payload);

      const response = await keapAPI.createContact(payload);
      console.log(response)
      toast.success('Contact created successfully!');
      resetForm();

    } catch (error) {
      console.error('Error creating contact:', error);
      setError(error.message || 'Error creating the contact');
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
      timeZone: '', sourceType: '', ipAddress: ''
    });
    setError('');
  };

  const c = "w-full px-2 py-1 text-sm border border-gray-300 rounded";
  const s = "bg-white p-4 rounded shadow";
  const g = "grid grid-cols-2 md:grid-cols-3 gap-2";

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Create Contact</h1>
      {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">{error}</div>}

      {/* Basic Info */}
      <div className={s}>
        <h2 className="font-medium mb-2">Basic Info</h2>
        <div className={g}>
          <input placeholder="Given Name *" value={formData.givenName} onChange={(e) => updateFormData('givenName', e.target.value)} className={c} />
          <input placeholder="Middle Name" value={formData.middleName} onChange={(e) => updateFormData('middleName', e.target.value)} className={c} />
          <input placeholder="Family Name" value={formData.familyName} onChange={(e) => updateFormData('familyName', e.target.value)} className={c} />
          <input placeholder="Prefix" value={formData.prefix} onChange={(e) => updateFormData('prefix', e.target.value)} className={c} />
          <input placeholder="Preferred Name" value={formData.preferredName} onChange={(e) => updateFormData('preferredName', e.target.value)} className={c} />
          <input placeholder="Suffix" value={formData.suffix} onChange={(e) => updateFormData('suffix', e.target.value)} className={c} />
          <input placeholder="Job Title" value={formData.jobTitle} onChange={(e) => updateFormData('jobTitle', e.target.value)} className={c} />
          <select value={formData.contactType} onChange={(e) => updateFormData('contactType', e.target.value)} className={c}>
            <option value="">Contact Type</option>
            <option value="Lead">Lead</option>
            <option value="Client">Client</option>
            <option value="Other">Other</option>
          </select>
          <input placeholder="Spouse Name" value={formData.spouseName} onChange={(e) => updateFormData('spouseName', e.target.value)} className={c} />
          <input placeholder="Website" value={formData.website} onChange={(e) => updateFormData('website', e.target.value)} className={c} />
          <input type="datetime-local" placeholder="Birthday" value={formData.birthday} onChange={(e) => updateFormData('birthday', e.target.value)} className={c} />
          <input type="date" placeholder="Anniversary" value={formData.anniversary} onChange={(e) => updateFormData('anniversary', e.target.value)} className={c} />
        </div>
      </div>

      {/* Emails */}
      <div className={s}>
        <h2 className="font-medium mb-2">Emails</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input type="email" placeholder="Email 1 *" value={formData.email1} onChange={(e) => updateFormData('email1', e.target.value)} className={c} />
          <input type="email" placeholder="Email 2" value={formData.email2} onChange={(e) => updateFormData('email2', e.target.value)} className={c} />
          <input type="email" placeholder="Email 3" value={formData.email3} onChange={(e) => updateFormData('email3', e.target.value)} className={c} />
        </div>
      </div>

      {/* Phones */}
      <div className={s}>
        <h2 className="font-medium mb-2">Phones</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input placeholder={`Phone ${i} ${i === 1 ? '*' : ''}`} value={formData[`phone${i}`]} onChange={(e) => updateFormData(`phone${i}`, e.target.value)} className={c} />
              <select value={formData[`phone${i}Type`]} onChange={(e) => updateFormData(`phone${i}Type`, e.target.value)} className={c}>
                <option value="">Type</option>
                <option value="HOME">HOME</option>
                <option value="WORK">WORK</option>
                <option value="MOBILE">MOBILE</option>
                <option value="OTHER">OTHER</option>
              </select>
              <input placeholder="Extension" value={formData[`phone${i}Ext`]} onChange={(e) => updateFormData(`phone${i}Ext`, e.target.value)} className={c} />
            </div>
          ))}
        </div>
      </div>

      {/* Fax */}
      <div className={s}>
        <h2 className="font-medium mb-2">Fax</h2>
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input placeholder={`Fax ${i}`} value={formData[`fax${i}`]} onChange={(e) => updateFormData(`fax${i}`, e.target.value)} className={c} />
              <select value={formData[`fax${i}Type`]} onChange={(e) => updateFormData(`fax${i}Type`, e.target.value)} className={c}>
                <option value="">Type</option>
                <option value="HOME">HOME</option>
                <option value="WORK">WORK</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Addresses */}
      <div className={s}>
        <h2 className="font-medium mb-2">Addresses</h2>
        {['billing', 'shipping', 'other'].map(type => (
          <div key={type} className="mb-4">
            <h3 className="text-sm font-medium mb-2 capitalize">{type}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input placeholder="Line 1" value={formData[`${type}Line1`]} onChange={(e) => updateFormData(`${type}Line1`, e.target.value)} className={c} />
              <input placeholder="Line 2" value={formData[`${type}Line2`]} onChange={(e) => updateFormData(`${type}Line2`, e.target.value)} className={c} />
              <input placeholder="City" value={formData[`${type}City`]} onChange={(e) => updateFormData(`${type}City`, e.target.value)} className={c} />
              <input placeholder="Region" value={formData[`${type}Region`]} onChange={(e) => updateFormData(`${type}Region`, e.target.value)} className={c} />
              <input placeholder="Postal" value={formData[`${type}Postal`]} onChange={(e) => updateFormData(`${type}Postal`, e.target.value)} className={c} />
              <input placeholder="ZIP" value={formData[`${type}Zip`]} onChange={(e) => updateFormData(`${type}Zip`, e.target.value)} className={c} />
              <input placeholder="ZIP+4" value={formData[`${type}ZipFour`]} onChange={(e) => updateFormData(`${type}ZipFour`, e.target.value)} className={c} />
              <select value={formData[`${type}Country`]} onChange={(e) => updateFormData(`${type}Country`, e.target.value)} className={c}>
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
      <div className={s}>
        <h2 className="font-medium mb-2">Social & Custom</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <input placeholder="Social Name 1" value={formData.socialName1} onChange={(e) => updateFormData('socialName1', e.target.value)} className={c} />
          <select value={formData.socialType1} onChange={(e) => updateFormData('socialType1', e.target.value)} className={c}>
            <option value="">Social Type</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
          </select>
          <input placeholder="Social Name 2" value={formData.socialName2} onChange={(e) => updateFormData('socialName2', e.target.value)} className={c} />
          <select value={formData.socialType2} onChange={(e) => updateFormData('socialType2', e.target.value)} className={c}>
            <option value="">Social Type</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input type="number" placeholder="Custom Field 1 ID" value={formData.customField1Id} onChange={(e) => updateFormData('customField1Id', e.target.value)} className={c} />
          <input placeholder="Custom Field 1 Content" value={formData.customField1Content} onChange={(e) => updateFormData('customField1Content', e.target.value)} className={c} />
          <input type="number" placeholder="Custom Field 2 ID" value={formData.customField2Id} onChange={(e) => updateFormData('customField2Id', e.target.value)} className={c} />
          <input placeholder="Custom Field 2 Content" value={formData.customField2Content} onChange={(e) => updateFormData('customField2Content', e.target.value)} className={c} />
        </div>
      </div>

      {/* Settings */}
      <div className={s}>
        <h2 className="font-medium mb-2">Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input type="number" placeholder="Company ID" value={formData.companyId} onChange={(e) => updateFormData('companyId', e.target.value)} className={c} />
          <input type="number" placeholder="Lead Source ID" value={formData.leadSourceId} onChange={(e) => updateFormData('leadSourceId', e.target.value)} className={c} />
          <input type="number" placeholder="Owner ID" value={formData.ownerId} onChange={(e) => updateFormData('ownerId', e.target.value)} className={c} />
          <input placeholder="Opt-in Reason" value={formData.optInReason} onChange={(e) => updateFormData('optInReason', e.target.value)} className={c} />
          <select value={formData.preferredLocale} onChange={(e) => updateFormData('preferredLocale', e.target.value)} className={c}>
            <option value="en_US">en_US</option>
            <option value="es_ES">es_ES</option>
            <option value="fr_FR">fr_FR</option>
          </select>
          <input placeholder="Time Zone" value={formData.timeZone} onChange={(e) => updateFormData('timeZone', e.target.value)} className={c} />
          <select value={formData.sourceType} onChange={(e) => updateFormData('sourceType', e.target.value)} className={c}>
            <option value="">Source Type</option>
            <option value="APPOINTMENT">APPOINTMENT</option>
            <option value="WEBFORM">WEBFORM</option>
            <option value="IMPORT">IMPORT</option>
            <option value="MANUAL">MANUAL</option>
            <option value="API">API</option>
          </select>
          <input placeholder="IP Address" value={formData.ipAddress} onChange={(e) => updateFormData('ipAddress', e.target.value)} className={c} />
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