import { useState } from 'react';
import { Button } from '../ui/Button';
import { Send, User, Search, Users, Trash2 } from 'lucide-react';
import { Input, Textarea, Select } from './EmailCompose';
import ContactSelector from '../misc/ContactSelector';

// Contact Selection Component
const ContactSelectionField = ({ selectedContacts, onSelectContacts, keapApi }) => {
  const [showContactSelector, setShowContactSelector] = useState(false);

  const handleContactSelect = (contacts) => {
    onSelectContacts(contacts);
    setShowContactSelector(false);
  };

  const removeContact = (contactToRemove) => {
    onSelectContacts(selectedContacts.filter(contact => contact.id !== contactToRemove.id));
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contacts * <span className="text-xs text-gray-500">(Maximum 1000 contacts per request)</span>
        </label>
        <div className="space-y-2">
          {/* Selected Contacts Display */}
          {selectedContacts.length > 0 ? (
            <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((contact) => {
                  const name = [contact.given_name, contact.family_name]
                    .filter(Boolean)
                    .join(' ') || contact.preferred_name || `Contact ${contact.id}`;
                  const email = contact.email_addresses?.[0]?.email;
                  
                  return (
                    <div
                      key={contact.id}
                      className="inline-flex items-center bg-white border border-gray-300 rounded-full px-3 py-1 text-sm"
                    >
                      <div className="flex-shrink-0 h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-gray-900 truncate max-w-32">{name}</span>
                        {email && (
                          <span className="text-xs text-gray-500 truncate max-w-32">{email}</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeContact(contact)}
                        className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                {selectedContacts.length > 1000 && (
                  <span className="text-red-500 ml-2">⚠ Maximum 1000 contacts allowed</span>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <div className="flex items-center text-gray-500">
                <Users className="h-5 w-5 mr-2" />
                <span className="text-sm">No contacts selected</span>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowContactSelector(true)}
              disabled={selectedContacts.length >= 1000}
            >
              <Search className="h-4 w-4 mr-2" />
              {selectedContacts.length > 0 ? 'Add More' : 'Select'} Contacts
            </Button>
            {selectedContacts.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onSelectContacts([])}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelect={handleContactSelect}
        selectedContactIds={selectedContacts.map(c => c.id.toString())}
        keapApi={keapApi}
      />
    </>
  );
};

// Main SendEmailTab Component
export default function SendEmailTab({ data, onChange, onSubmit, loading, keapApi }) {
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle contact selection
  const handleContactSelect = (contacts) => {
    setSelectedContacts(contacts);
    // Convert contacts to comma-separated string of contact IDs for compatibility
    const contactIds = contacts.map(contact => contact.id).join(',');
    handleInputChange('contacts', contactIds);
  };

  // Form validation
  const isFormValid = () => {
    return (
      selectedContacts.length > 0 && 
      selectedContacts.length <= 1000 &&
      data.from_address &&
      data.subject &&
      (data.html_content || data.plain_content)
    );
  };

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* Contact Selection */}
      <ContactSelectionField
        selectedContacts={selectedContacts}
        onSelectContacts={handleContactSelect}
        keapApi={keapApi}
      />

      {/* Email Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Address *</label>
          <Input
            type="email"
            placeholder="sender@yourdomain.com"
            value={data.from_address || ''}
            onChange={(e) => handleInputChange('from_address', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Address *
            <span className="text-xs text-gray-500 ml-1">(Use ~Contact.Email~ for merge field)</span>
          </label>
          <Input
            placeholder="~Contact.Email~"
            value={data.to_address || '~Contact.Email~'}
            onChange={(e) => handleInputChange('to_address', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CC Addresses
            <span className="text-xs text-gray-500 ml-1">(comma-separated)</span>
          </label>
          <Input
            type="email"
            placeholder="cc1@example.com, cc2@example.com"
            value={data.cc_addresses || ''}
            onChange={(e) => handleInputChange('cc_addresses', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BCC Addresses
            <span className="text-xs text-gray-500 ml-1">(comma-separated)</span>
          </label>
          <Input
            type="email"
            placeholder="bcc1@example.com, bcc2@example.com"
            value={data.bcc_addresses || ''}
            onChange={(e) => handleInputChange('bcc_addresses', e.target.value)}
          />
        </div>
      </div>

      {/* Email Content Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <Input
            placeholder="Email subject"
            value={data.subject || ''}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content Type *</label>
          <Select
            value={data.content_type || 'Multipart'}
            onChange={(e) => handleInputChange('content_type', e.target.value)}
            required
          >
            <option value="HTML">HTML</option>
            <option value="Text">Text</option>
            <option value="Multipart">Multipart</option>
          </Select>
        </div>
      </div>

      {/* Email Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          HTML Content {data.content_type !== 'Text' ? '*' : ''}
        </label>
        <Textarea
          placeholder="<h1>Hello</h1><p>Email content...</p>"
          value={data.html_content || ''}
          onChange={(e) => handleInputChange('html_content', e.target.value)}
          rows={6}
          required={data.content_type !== 'Text'}
          disabled={data.content_type === 'Text'}
        />
        {data.content_type === 'Text' && (
          <p className="text-xs text-gray-500 mt-1">HTML content disabled for Text content type</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plain Text Content {data.content_type !== 'HTML' ? '*' : ''}
        </label>
        <Textarea
          placeholder="Plain text email content..."
          value={data.plain_content || ''}
          onChange={(e) => handleInputChange('plain_content', e.target.value)}
          rows={4}
          required={data.content_type !== 'HTML'}
          disabled={data.content_type === 'HTML'}
        />
        {data.content_type === 'HTML' && (
          <p className="text-xs text-gray-500 mt-1">Plain text content disabled for HTML content type</p>
        )}
      </div>

      {/* API Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">API Call Preview</h3>
        <div className="text-xs text-blue-800 font-mono bg-white p-2 rounded border overflow-x-auto">
          APIEmailService.sendEmail([
          <br />
          &nbsp;&nbsp;[{data.contacts ? data.contacts.split(',').join(', ') : ''}], // Contact IDs
          <br />
          &nbsp;&nbsp;"{data.from_address || 'from@example.com'}", // From Address
          <br />
          &nbsp;&nbsp;"{data.to_address || '~Contact.Email~'}", // To Address
          <br />
          &nbsp;&nbsp;"{data.cc_addresses || ''}", // CC Addresses
          <br />
          &nbsp;&nbsp;"{data.bcc_addresses || ''}", // BCC Addresses
          <br />
          &nbsp;&nbsp;"{data.content_type || 'Multipart'}", // Content Type
          <br />
          &nbsp;&nbsp;"{data.subject || 'Subject'}", // Subject
          <br />
          &nbsp;&nbsp;"HTML Content...", // HTML Body
          <br />
          &nbsp;&nbsp;"Text Content..." // Text Body
          <br />
          ])
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={loading || !isFormValid()}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>

      {/* Form validation message */}
      {!isFormValid() && (
        <div className="text-sm text-gray-600 text-center space-y-1">
          <div>Please ensure all required fields are filled:</div>
          <ul className="text-xs text-left inline-block">
            {selectedContacts.length === 0 && <li>• Select at least one contact</li>}
            {selectedContacts.length > 1000 && <li>• Maximum 1000 contacts allowed</li>}
            {!data.from_address && <li>• Enter from address</li>}
            {!data.subject && <li>• Enter subject</li>}
            {!data.html_content && !data.plain_content && <li>• Enter email content (HTML or plain text)</li>}
          </ul>
        </div>
      )}
    </form>
  );
}