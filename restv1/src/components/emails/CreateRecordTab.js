import { useState } from 'react';
import { Mail, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from './EmailCompose';
import ContactSelector from '../misc/ContactSelector';

export default function CreateRecordTab({ data, onChange, onSubmit, loading }) {
  const [isContactSelectorOpen, setIsContactSelectorOpen] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle contact selection
  const handleContactSelect = (contact) => {
    if (contact) {
      // Update contact_id and auto-fill email if available
      handleInputChange('contact_id', contact.id.toString());
      
      // Auto-fill the "To Address" if it's empty and contact has an email
      const primaryEmail = contact.email_addresses?.find(email => email.field === 'EMAIL1')?.email;
      if (primaryEmail && !data.sent_to_address) {
        handleInputChange('sent_to_address', primaryEmail);
      }
    }
  };

  // Get selected contact display name
  const getSelectedContactDisplay = () => {
    if (!data.contact_id) return null;
    
    // If we have contact details from a recent selection, we could display them
    // For now, just show the ID
    return `Contact ID: ${data.contact_id}`;
  };

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* Basic Email Information */}
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Email Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Address *
            </label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={data.sent_to_address}
              onChange={(e) => handleInputChange('sent_to_address', e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Address
            </label>
            <Input
              type="email"
              placeholder="sender@example.com"
              value={data.sent_from_address}
              onChange={(e) => handleInputChange('sent_from_address', e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Input
              placeholder="Email subject"
              value={data.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reply To Address
            </label>
            <Input
              type="email"
              placeholder="reply@example.com"
              value={data.sent_from_reply_address}
              onChange={(e) => handleInputChange('sent_from_reply_address', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsContactSelectorOpen(true)}
                className="w-full justify-start text-left"
              >
                <User className="h-4 w-4 mr-2" />
                {data.contact_id ? getSelectedContactDisplay() : 'Select Contact'}
              </Button>
              
     
              
  
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CC Addresses
            </label>
            <Input
              placeholder="cc1@example.com, cc2@example.com"
              value={data.sent_to_cc_addresses}
              onChange={(e) => handleInputChange('sent_to_cc_addresses', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BCC Addresses
            </label>
            <Input
              placeholder="bcc1@example.com, bcc2@example.com"
              value={data.sent_to_bcc_addresses}
              onChange={(e) => handleInputChange('sent_to_bcc_addresses', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HTML Content
            </label>
            <Textarea
              placeholder="<h1>Hello World</h1><p>This is the HTML content...</p>"
              value={data.html_content}
              onChange={(e) => handleInputChange('html_content', e.target.value)}
              rows={8}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plain Text Content
            </label>
            <Textarea
              placeholder="Hello World&#10;&#10;This is the plain text content..."
              value={data.plain_content}
              onChange={(e) => handleInputChange('plain_content', e.target.value)}
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Provider Information */}
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Provider Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Provider
            </label>
            <Select
              value={data.original_provider}
              onChange={(e) => handleInputChange('original_provider', e.target.value)}
            >
              <option value="UNKNOWN">UNKNOWN</option>
              <option value="INFUSIONSOFT">INFUSIONSOFT</option>
              <option value="MICROSOFT">MICROSOFT</option>
              <option value="GOOGLE">GOOGLE</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider ID
            </label>
            <Input
              placeholder="provider-unique-id"
              value={data.original_provider_id}
              onChange={(e) => handleInputChange('original_provider_id', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider Source ID
            </label>
            <Input
              placeholder="source@example.com"
              value={data.provider_source_id}
              onChange={(e) => handleInputChange('provider_source_id', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Date Information */}
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sent Date
            </label>
            <Input
              type="datetime-local"
              value={data.sent_date ? data.sent_date.slice(0, 16) : ''}
              onChange={(e) => handleInputChange('sent_date', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received Date
            </label>
            <Input
              type="datetime-local"
              value={data.received_date ? data.received_date.slice(0, 16) : ''}
              onChange={(e) => handleInputChange('received_date', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opened Date
            </label>
            <Input
              type="datetime-local"
              value={data.opened_date ? data.opened_date.slice(0, 16) : ''}
              onChange={(e) => handleInputChange('opened_date', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clicked Date
            </label>
            <Input
              type="datetime-local"
              value={data.clicked_date ? data.clicked_date.slice(0, 16) : ''}
              onChange={(e) => handleInputChange('clicked_date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Headers (Optional) */}
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Headers (Optional)</h2>
        
        <Textarea
          placeholder="X-Custom-Header: value&#10;X-Another-Header: another-value"
          value={data.headers}
          onChange={(e) => handleInputChange('headers', e.target.value)}
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Create Email Record
            </>
          )}
        </Button>
      </div>

      {/* Contact Selector Modal */}
      <ContactSelector
        isOpen={isContactSelectorOpen}
        onClose={() => setIsContactSelectorOpen(false)}
        onSelect={handleContactSelect}
        selectedContactIds={data.contact_id ? [data.contact_id] : []}
        mode="single"
      />
    </form>
  );
}