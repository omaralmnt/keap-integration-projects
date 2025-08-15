import { useState } from 'react';
import { Button } from '../ui/Button';
import { Plus, Trash2, Upload, Send, User, Search, Users } from 'lucide-react';
import { Input, Textarea, Select } from './EmailCompose';
import UserSelector from '../misc/UserSelector';
import ContactSelector from '../misc/ContactSelector';

// Attachment Component for Send Email (same as before)
const AttachmentInput = ({ attachment, index, onChange, onRemove }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'manual'

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB');
      e.target.value = '';
      return;
    }

    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1]; // Remove data:mime;base64, prefix
        onChange(index, 'file_name', file.name);
        onChange(index, 'file_data', base64Data);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert('Error reading file');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Estimate file size from base64
  const getBase64Size = (base64String) => {
    if (!base64String) return 0;
    return Math.round((base64String.length * 3) / 4);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-700">Attachment {index + 1}</h4>
          {attachment.file_data && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {formatFileSize(getBase64Size(attachment.file_data))}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700"
          disabled={isProcessing}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Upload Method Toggle */}
      <div className="mb-3">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={`upload-method-${index}`}
              value="file"
              checked={uploadMethod === 'file'}
              onChange={(e) => setUploadMethod(e.target.value)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Upload File</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={`upload-method-${index}`}
              value="manual"
              checked={uploadMethod === 'manual'}
              onChange={(e) => setUploadMethod(e.target.value)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Manual Entry</span>
          </label>
        </div>
      </div>
      
      {uploadMethod === 'file' ? (
        // File Upload Method
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Select File (Max 1MB)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {isProcessing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
          </div>
          
          {attachment.file_name && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">File Name</label>
              <Input
                placeholder="document.pdf"
                value={attachment.file_name}
                onChange={(e) => onChange(index, 'file_name', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          )}

          {attachment.file_data && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Base64 Data Preview
              </label>
              <Input
                value={attachment.file_data.substring(0, 50) + '...'}
                disabled={true}
                className="bg-gray-100 text-gray-500"
              />
            </div>
          )}
        </div>
      ) : (
        // Manual Entry Method
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">File Name</label>
            <Input
              placeholder="document.pdf"
              value={attachment.file_name}
              onChange={(e) => onChange(index, 'file_name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Base64 Data</label>
            <Textarea
              placeholder="Base64 encoded file content"
              value={attachment.file_data}
              onChange={(e) => onChange(index, 'file_data', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}

      {/* File Info */}
      {attachment.file_data && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Upload className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800">
              {attachment.file_name || 'Unnamed file'} - {formatFileSize(getBase64Size(attachment.file_data))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Contacts *</label>
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
// User Selection Component
const UserSelectionField = ({ selectedUser, onSelectUser, keapApi }) => {
  const [showUserSelector, setShowUserSelector] = useState(false);

  const handleUserSelect = (user) => {
    onSelectUser(user);
    setShowUserSelector(false);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
        <div className="flex space-x-2">
          {selectedUser ? (
            <div className="flex-1 flex items-center p-3 border border-gray-300 rounded-md bg-gray-50">
              <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {[selectedUser.given_name, selectedUser.family_name].filter(Boolean).join(' ') || 
                   selectedUser.preferred_name || 'Unknown User'}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {selectedUser.id} • {selectedUser.email_address || 'No email'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center p-3 border border-gray-300 rounded-md bg-white">
              <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-sm text-gray-500">No user selected</div>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUserSelector(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            {selectedUser ? 'Change' : 'Select'} User
          </Button>
        </div>
      </div>

      <UserSelector
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onSelect={handleUserSelect}
        selectedUserId={selectedUser?.id}
        keapApi={keapApi}
      />
    </>
  );
};

// Main SendEmailTab Component
export default function SendEmailTab({ data, onChange, onSubmit, loading, keapApi }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    handleInputChange('user_id', user.id.toString());
  };

  // Handle contact selection
  const handleContactSelect = (contacts) => {
    setSelectedContacts(contacts);
    // Convert contacts to comma-separated IDs for the API
    const contactIds = contacts.map(contact => contact.id).join(', ');
    handleInputChange('contacts', contactIds);
  };

  // Attachment functions
  const addAttachment = () => {
    if (data.attachments.length < 10) {
      onChange(prev => ({
        ...prev,
        attachments: [...prev.attachments, { file_name: '', file_data: '' }]
      }));
    }
  };

  const updateAttachment = (index, field, value) => {
    onChange(prev => ({
      ...prev,
      attachments: prev.attachments.map((att, idx) => 
        idx === index ? { ...att, [field]: value } : att
      )
    }));
  };

  const removeAttachment = (index) => {
    onChange(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== index)
    }));
  };

  // Form validation
  const isFormValid = selectedUser && data.subject && selectedContacts.length > 0;

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* User Selection */}
      <UserSelectionField
        selectedUser={selectedUser}
        onSelectUser={handleUserSelect}
        keapApi={keapApi}
      />

      {/* Contact Selection */}
      <ContactSelectionField
        selectedContacts={selectedContacts}
        onSelectContacts={handleContactSelect}
        keapApi={keapApi}
      />

      {/* Basic Email Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <Input
            placeholder="Email subject"
            value={data.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Field</label>
          <Input
            placeholder="Email, EmailAddress2, etc."
            value={data.address_field}
            onChange={(e) => handleInputChange('address_field', e.target.value)}
          />
        </div>
      </div>

      {/* Email Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
        <Textarea
          placeholder="<h1>Hello</h1><p>Email content...</p>"
          value={data.html_content}
          onChange={(e) => handleInputChange('html_content', e.target.value)}
          rows={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plain Text Content</label>
        <Textarea
          placeholder="Plain text email content..."
          value={data.plain_content}
          onChange={(e) => handleInputChange('plain_content', e.target.value)}
          rows={4}
        />
      </div>

      {/* Attachments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Attachments ({data.attachments.length}/10)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAttachment}
            disabled={data.attachments.length >= 10}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Attachment
          </Button>
        </div>
        
        <div className="space-y-3">
          {data.attachments.map((attachment, index) => (
            <AttachmentInput
              key={index}
              attachment={attachment}
              index={index}
              onChange={updateAttachment}
              onRemove={removeAttachment}
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={loading || !isFormValid}
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
      {!isFormValid && (
        <div className="text-sm text-gray-600 text-center">
          Please select a user, enter a subject, and select at least one contact to send the email.
        </div>
      )}
    </form>
  );
}