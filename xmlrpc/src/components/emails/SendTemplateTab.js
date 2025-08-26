import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { BookImage, Send, Eye, Search, Users, Trash2, User, Download } from 'lucide-react';
import { Input, Select } from './EmailCompose';
import ContactSelector from '../misc/ContactSelector';
import keapAPI from '../../services/keapAPI';

// Template Loader Component
const TemplateLoader = ({ templateId, onTemplateLoad, template, loading, error }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template ID *
        </label>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Enter template ID (e.g., 1234)"
            value={templateId}
            onChange={(e) => onTemplateLoad(e.target.value, null)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => onTemplateLoad(templateId, 'load')}
            disabled={!templateId || loading}
            className="flex-shrink-0"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Load
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-800">
            <strong>Error loading template:</strong> {error}
          </div>
          <div className="text-xs text-red-600 mt-1">
            Make sure the template ID exists and you have permission to access it.
          </div>
        </div>
      )}

      {/* Loaded Template Display */}
      {template && (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <BookImage className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-green-900">Template Loaded Successfully</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>Title:</strong> {template.pieceTitle}</div>
                <div><strong>Subject:</strong> {template.subject}</div>
                <div className="flex space-x-4 text-xs text-green-700">
                  <span>ID: {templateId}</span>
                  <span>Category: {template.categories || 'Uncategorized'}</span>
                  <span>Type: {template.contentType}</span>
                  <span>Context: {template.mergeContext}</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onTemplateLoad('', 'clear')}
              className="text-green-600 hover:text-green-700"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* API Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-1">API Information</h4>
        <div className="text-xs text-blue-700">
          Uses <code className="bg-white px-1 rounded">APIEmailService.getEmailTemplate(templateId)</code> to retrieve template details.
        </div>
      </div>
    </div>
  );
};

// Contact Selection Component (same as before)
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
          Recipients * <span className="text-xs text-gray-500">(Maximum 1000 contacts per request)</span>
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
                        type="button"
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
                <span className="text-sm">No recipients selected</span>
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
              {selectedContacts.length > 0 ? 'Add More' : 'Select'} Recipients
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

// Template Preview Component
const TemplatePreview = ({ template }) => {
  if (!template) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <Eye className="h-4 w-4 mr-2" />
        Template Preview
      </h3>
      
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">From:</span> {template.fromAddress}
          </div>
          <div>
            <span className="font-medium text-gray-700">To:</span> {template.toAddress}
          </div>
        </div>
        
        {(template.ccAddress || template.bccAddress) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {template.ccAddress && (
              <div>
                <span className="font-medium text-gray-700">CC:</span> {template.ccAddress}
              </div>
            )}
            {template.bccAddress && (
              <div>
                <span className="font-medium text-gray-700">BCC:</span> {template.bccAddress}
              </div>
            )}
          </div>
        )}
        
        <div>
          <span className="font-medium text-gray-700">Subject:</span> {template.subject}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium text-gray-700">Content Type:</span> {template.contentType}
          </div>
          <div>
            <span className="font-medium text-gray-700">Merge Context:</span> {template.mergeContext}
          </div>
        </div>
        
        {template.htmlBody && (
          <div>
            <span className="font-medium text-gray-700">HTML Content Preview:</span>
            <div className="mt-1 p-2 bg-white border rounded text-xs max-h-32 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ 
                __html: template.htmlBody.length > 200 
                  ? template.htmlBody.substring(0, 200) + '...' 
                  : template.htmlBody 
              }} />
            </div>
          </div>
        )}
        
        {template.textBody && (
          <div>
            <span className="font-medium text-gray-700">Text Content:</span>
            <div className="mt-1 p-2 bg-white border rounded text-xs max-h-20 overflow-y-auto whitespace-pre-wrap">
              {template.textBody.length > 200 
                ? template.textBody.substring(0, 200) + '...'
                : template.textBody}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main SendTemplateTab Component
export default function SendTemplateTab({ data, onChange, onSubmit, loading, keapApi }) {
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle template loading
  const handleTemplateLoad = async (templateId, action) => {
    if (action === 'clear') {
      handleInputChange('templateId', '');
      handleInputChange('selectedTemplate', null);
      setTemplateError(null);
      return;
    }

    if (action === 'load' && templateId) {
      try {
        setTemplateLoading(true);
        setTemplateError(null);
        
        // TODO: Replace with actual API call
        const template = await keapAPI.getEmailTemplate(templateId);
        
        // Mock API call for demonstration
        // await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate API response (you'll replace this with actual API call)
        // const mockTemplate = {
        //   pieceTitle: `Template ${templateId}`,
        //   categories: "API Category",
        //   fromAddress: "from@yourcompany.com",
        //   toAddress: "~Contact.Email~",
        //   ccAddress: "",
        //   bccAddress: "",
        //   subject: `Template ${templateId} Subject Line`,
        //   textBody: "This is the text email body with merge fields like ~Contact.FirstName~",
        //   htmlBody: `<h1>Hello ~Contact.FirstName~!</h1><p>This is template ${templateId} HTML content.</p>`,
        //   contentType: "Multipart",
        //   mergeContext: "Contact"
        // };

        handleInputChange('selectedTemplate', template.result);
        
      } catch (error) {
        console.error('Error loading template:', error);
        setTemplateError(error.message || 'Failed to load template');
        handleInputChange('selectedTemplate', null);
      } finally {
        setTemplateLoading(false);
      }
    } else {
      // Just update the ID without loading
      handleInputChange('templateId', templateId);
      if (!templateId) {
        handleInputChange('selectedTemplate', null);
        setTemplateError(null);
      }
    }
  };

  // Handle contact selection
  const handleContactSelect = (contacts) => {
    setSelectedContacts(contacts);
    const contactIds = contacts.map(contact => contact.id);
    handleInputChange('contactList', contactIds);
  };

  // Form validation
  const isFormValid = () => {
    return (
      data.selectedTemplate &&
      data.templateId &&
      selectedContacts.length > 0 && 
      selectedContacts.length <= 1000
    );
  };

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* Template Loading */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BookImage className="h-5 w-5 mr-2 text-blue-600" />
          Load Template
        </h3>
        <TemplateLoader
          templateId={data.templateId}
          onTemplateLoad={handleTemplateLoad}
          template={data.selectedTemplate}
          loading={templateLoading}
          error={templateError}
        />
      </div>

      {/* Contact Selection */}
      {data.selectedTemplate && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Select Recipients
          </h3>
          <ContactSelectionField
            selectedContacts={selectedContacts}
            onSelectContacts={handleContactSelect}
            keapApi={keapApi}
          />
        </div>
      )}

      {/* Template Preview */}
      {data.selectedTemplate && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Template Details</h3>
          <TemplatePreview template={data.selectedTemplate} />
        </div>
      )}

      {/* API Information */}
      {isFormValid() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">API Call Preview</h3>
          <div className="text-xs text-blue-800 font-mono bg-white p-3 rounded border overflow-x-auto">
            APIEmailService.sendEmail(
            <br />
            &nbsp;&nbsp;privateKey,
            <br />
            &nbsp;&nbsp;[{selectedContacts.map(c => c.id).join(', ')}], // Contact IDs ({selectedContacts.length} contacts)
            <br />
            &nbsp;&nbsp;{data.templateId} // Template ID
            <br />
            )
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
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
              Send Template Email to {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Form validation message */}
      {!isFormValid() && (
        <div className="text-sm text-gray-600 text-center space-y-1">
          <div>Complete these steps to send template email:</div>
          <ul className="text-xs text-left inline-block space-y-1">
            {!data.templateId && <li>1. Enter a template ID</li>}
            {data.templateId && !data.selectedTemplate && <li>2. Click "Load" to retrieve template details</li>}
            {data.selectedTemplate && selectedContacts.length === 0 && <li>3. Select at least one recipient</li>}
            {selectedContacts.length > 1000 && <li>⚠ Maximum 1000 recipients allowed</li>}
          </ul>
        </div>
      )}
    </form>
  );
}