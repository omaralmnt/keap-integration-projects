import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

// Input component - definido fuera para evitar re-renders
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed' : '';
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
};

// FormField component - definido fuera para evitar re-renders
const FormField = ({ label, error, required = false, children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

export function EditAccountModal({ 
  isOpen, 
  onClose, 
  accountInfo, 
  onSave,
  isLoading = false 
}) {
  // Form state - ajustado al endpoint
  const [formData, setFormData] = useState({
    name: accountInfo?.name || '',
    email: accountInfo?.email || '',
    phone: accountInfo?.phone || '',
    phone_ext: accountInfo?.phone_ext || '',
    website: accountInfo?.website || '',
    language_tag: accountInfo?.language_tag || 'en-US',
    currency_code: accountInfo?.currency_code || 'USD',
    time_zone: accountInfo?.time_zone || 'America/New_York',
    logo_url: accountInfo?.logo_url || '',
    business_goals: accountInfo?.business_goals || [],
    // Address fields - ajustado al esquema del endpoint
    address_field: accountInfo?.address?.field || 'BILLING',
    address_line1: accountInfo?.address?.line1 || '',
    address_line2: accountInfo?.address?.line2 || '',
    address_locality: accountInfo?.address?.locality || '',
    address_region: accountInfo?.address?.region || '',
    address_postal_code: accountInfo?.address?.postal_code || '',
    address_zip_code: accountInfo?.address?.zip_code || '',
    address_zip_four: accountInfo?.address?.zip_four || '',
    address_country_code: accountInfo?.address?.country_code || 'US',
    // Business fields
    business_type: accountInfo?.business_type || '',
    business_primary_color: accountInfo?.business_primary_color || '',
    business_secondary_color: accountInfo?.business_secondary_color || ''
  });

  const [errors, setErrors] = useState({});
  
  // Handle business goals - mantener como string mientras se edita
  const [businessGoalsString, setBusinessGoalsString] = useState('');

  useEffect(() => {
    if (isOpen && accountInfo) {
      setFormData({
        name: accountInfo.name || '',
        email: accountInfo.email || '',
        phone: accountInfo.phone || '',
        phone_ext: accountInfo.phone_ext || '',
        website: accountInfo.website || '',
        language_tag: accountInfo.language_tag || 'en-US',
        currency_code: accountInfo.currency_code || 'USD',
        time_zone: accountInfo.time_zone || 'America/New_York',
        logo_url: accountInfo.logo_url || '',
        business_goals: accountInfo.business_goals || [],
        // Address fields
        address_field: accountInfo.address?.field || 'BILLING',
        address_line1: accountInfo.address?.line1 || '',
        address_line2: accountInfo.address?.line2 || '',
        address_locality: accountInfo.address?.locality || '',
        address_region: accountInfo.address?.region || '',
        address_postal_code: accountInfo.address?.postal_code || '',
        address_zip_code: accountInfo.address?.zip_code || '',
        address_zip_four: accountInfo.address?.zip_four || '',
        address_country_code: accountInfo.address?.country_code || 'US',
        // Business fields
        business_type: accountInfo.business_type || '',
        business_primary_color: accountInfo.business_primary_color || '',
        business_secondary_color: accountInfo.business_secondary_color || ''
      });
      setErrors({});
      
      // Sync business goals string
      if (Array.isArray(accountInfo?.business_goals)) {
        setBusinessGoalsString(accountInfo.business_goals.join(', '));
      } else {
        setBusinessGoalsString('');
      }
    }
  }, [isOpen, accountInfo]);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBusinessGoalsChange = (value) => {
    setBusinessGoalsString(value);
    // NO actualizar formData.business_goals aquí para evitar loops
  };

  // Handle form submission - transformar datos al formato del endpoint
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convertir business goals string a array justo antes del envío
    const goalsArray = businessGoalsString.split(',').map(goal => goal.trim()).filter(goal => goal);
    
    // Transformar los datos al formato que espera el endpoint
    const transformedData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      phone_ext: formData.phone_ext,
      website: formData.website,
      language_tag: formData.language_tag,
      currency_code: formData.currency_code,
      time_zone: formData.time_zone,
      logo_url: formData.logo_url,
      business_goals: goalsArray, // Usar el array convertido del string
      business_type: formData.business_type,
      business_primary_color: formData.business_primary_color,
      business_secondary_color: formData.business_secondary_color,
      address: {
        field: formData.address_field,
        line1: formData.address_line1,
        line2: formData.address_line2,
        locality: formData.address_locality,
        region: formData.address_region,
        postal_code: formData.address_postal_code,
        zip_code: formData.address_zip_code,
        zip_four: formData.address_zip_four,
        country_code: formData.address_country_code
      }
    };

    console.log('Form data to save:', transformedData);
    onSave(transformedData);
  };

  // Reset form when modal opens/closes
  const handleClose = () => {
    setFormData({
      name: accountInfo?.name || '',
      email: accountInfo?.email || '',
      phone: accountInfo?.phone || '',
      phone_ext: accountInfo?.phone_ext || '',
      website: accountInfo?.website || '',
      language_tag: accountInfo?.language_tag || 'en-US',
      currency_code: accountInfo?.currency_code || 'USD',
      time_zone: accountInfo?.time_zone || 'America/New_York',
      logo_url: accountInfo?.logo_url || '',
      business_goals: accountInfo?.business_goals || [],
      address_field: accountInfo?.address?.field || 'BILLING',
      address_line1: accountInfo?.address?.line1 || '',
      address_line2: accountInfo?.address?.line2 || '',
      address_locality: accountInfo?.address?.locality || '',
      address_region: accountInfo?.address?.region || '',
      address_postal_code: accountInfo?.address?.postal_code || '',
      address_zip_code: accountInfo?.address?.zip_code || '',
      address_zip_four: accountInfo?.address?.zip_four || '',
      address_country_code: accountInfo?.address?.country_code || 'US',
      business_type: accountInfo?.business_type || '',
      business_primary_color: accountInfo?.business_primary_color || '',
      business_secondary_color: accountInfo?.business_secondary_color || ''
    });
    setErrors({});
    setBusinessGoalsString(Array.isArray(accountInfo?.business_goals) ? accountInfo.business_goals.join(', ') : '');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Edit Account Information"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Business Name" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter business name"
                error={!!errors.name}
              />
            </FormField>

            <FormField label="Email" required error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                error={!!errors.email}
              />
            </FormField>

            <FormField label="Phone" error={errors.phone}>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                error={!!errors.phone}
              />
            </FormField>

            <FormField label="Phone Extension" error={errors.phone_ext}>
              <Input
                value={formData.phone_ext}
                onChange={(e) => handleChange('phone_ext', e.target.value)}
                placeholder="Extension (optional)"
                error={!!errors.phone_ext}
              />
            </FormField>

            <FormField label="Website" error={errors.website} className="md:col-span-2">
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.example.com"
                error={!!errors.website}
              />
            </FormField>

            <FormField label="Logo URL" error={errors.logo_url} className="md:col-span-2">
              <Input
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
                error={!!errors.logo_url}
              />
            </FormField>
          </div>
        </div>

        {/* Localization Settings */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Localization Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Language" error={errors.language_tag}>
              <select
                value={formData.language_tag}
                onChange={(e) => handleChange('language_tag', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="es-MX">Spanish (Mexico)</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </FormField>

            <FormField label="Currency" error={errors.currency_code}>
              <select
                value={formData.currency_code}
                onChange={(e) => handleChange('currency_code', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="MXN">MXN - Mexican Peso</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </FormField>

            <FormField label="Time Zone" error={errors.time_zone}>
              <select
                value={formData.time_zone}
                onChange={(e) => handleChange('time_zone', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Europe/Berlin">Berlin</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Address Type" error={errors.address_field}>
              <select
                value={formData.address_field}
                onChange={(e) => handleChange('address_field', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="BILLING">Billing Address</option>
                <option value="SHIPPING">Shipping Address</option>
              </select>
            </FormField>

            <FormField label="Country" error={errors.address_country_code}>
              <select
                value={formData.address_country_code}
                onChange={(e) => handleChange('address_country_code', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="MX">Mexico</option>
              </select>
            </FormField>

            <FormField label="Address Line 1" error={errors.address_line1} className="md:col-span-2">
              <Input
                value={formData.address_line1}
                onChange={(e) => handleChange('address_line1', e.target.value)}
                placeholder="Street address"
                error={!!errors.address_line1}
              />
            </FormField>

            <FormField label="Address Line 2" error={errors.address_line2} className="md:col-span-2">
              <Input
                value={formData.address_line2}
                onChange={(e) => handleChange('address_line2', e.target.value)}
                placeholder="Apartment, suite, etc. (optional)"
                error={!!errors.address_line2}
              />
            </FormField>

            <FormField label="City" error={errors.address_locality}>
              <Input
                value={formData.address_locality}
                onChange={(e) => handleChange('address_locality', e.target.value)}
                placeholder="City"
                error={!!errors.address_locality}
              />
            </FormField>

            <FormField label="State/Region" error={errors.address_region}>
              <Input
                value={formData.address_region}
                onChange={(e) => handleChange('address_region', e.target.value)}
                placeholder="State or region"
                error={!!errors.address_region}
              />
            </FormField>

            <FormField label="Postal Code" error={errors.address_postal_code}>
              <Input
                value={formData.address_postal_code}
                onChange={(e) => handleChange('address_postal_code', e.target.value)}
                placeholder="Postal code"
                error={!!errors.address_postal_code}
              />
            </FormField>

            <FormField label="ZIP Code" error={errors.address_zip_code}>
              <Input
                value={formData.address_zip_code}
                onChange={(e) => handleChange('address_zip_code', e.target.value)}
                placeholder="ZIP code (US only)"
                error={!!errors.address_zip_code}
              />
            </FormField>

            <FormField label="ZIP+4" error={errors.address_zip_four} className="md:col-span-2">
              <Input
                value={formData.address_zip_four}
                onChange={(e) => handleChange('address_zip_four', e.target.value)}
                placeholder="ZIP+4 extension (US only)"
                error={!!errors.address_zip_four}
              />
            </FormField>
          </div>
        </div>

        {/* Business Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Business Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Business Type" error={errors.business_type}>
              <select
                value={formData.business_type}
                onChange={(e) => handleChange('business_type', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select business type</option>
                <option value="businessType.values.business">Business</option>
                <option value="businessType.values.personal">Personal</option>
                <option value="businessType.values.nonprofit">Non-profit</option>
              </select>
            </FormField>

            <FormField label="Business Goals" error={errors.business_goals}>
              <Input
                value={businessGoalsString}
                onChange={(e) => handleBusinessGoalsChange(e.target.value)}
                placeholder="e.g., growth, efficiency, customer satisfaction"
                error={!!errors.business_goals}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple goals with commas</p>
            </FormField>

            <FormField label="Primary Brand Color" error={errors.business_primary_color}>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.business_primary_color}
                  onChange={(e) => handleChange('business_primary_color', e.target.value)}
                  className="w-12 h-10 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  value={formData.business_primary_color}
                  onChange={(e) => handleChange('business_primary_color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </FormField>

            <FormField label="Secondary Brand Color" error={errors.business_secondary_color}>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.business_secondary_color}
                  onChange={(e) => handleChange('business_secondary_color', e.target.value)}
                  className="w-12 h-10 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  value={formData.business_secondary_color}
                  onChange={(e) => handleChange('business_secondary_color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}