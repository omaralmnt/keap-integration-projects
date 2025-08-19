import { useState } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { useNavigate } from 'react-router-dom';

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Main Contacts Component
export function Contacts() {
    const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search parameters
  const [email, setEmail] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [limit, setLimit] = useState(3);
  const [order, setOrder] = useState('DateCreated');
  const [orderDirection, setOrderDirection] = useState('TRUE');
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');
  const [page,setPage] = useState(0)

  // Search function - TÚ IMPLEMENTARÁS LA LÓGICA DE API

  const handlePagination = async (action) => {
    // let newPage
    if (action === 'next') {
      setPage(page +1)
      // newPage = page + 1
    }else{
       setPage(page -1)
     

    }
  handleSearch()
        
  }
  const handleSearch = async () => {
    try {
            setLoading(true);

    // const formattedUntil = formatDateForApi(until)
    // console.log('s',formattedSince)
    const queryParams = {
      query:{
      Email: email,
      FirstName: givenName,
      LastName: familyName,

      },
      limit,
      page:page,
      OrderBy:order,
      asc:orderDirection.toUpperCase() === "TRUE"
      


    };
    if(since){
    const formattedSince = formatDateForApi(since)

      queryParams.query.LastUpdated = `~>=~ ${formattedSince}`

    }
    // console.log(queryParams)

    const data = await keapAPI.getContacts(queryParams)
    console.log(data)
    setContacts(data.contacts)
    // setPrevious(data.previous)
    // setNext(data.next)
 
    } catch (error) {
     console.log(error)   
    }
    finally{
      setLoading(false);

    }
    
  };
function formatDateForApi(fecha) {
    // Asegura que sea un objeto Date
    const d = fecha instanceof Date ? fecha : new Date(fecha);

    const pad = n => String(n).padStart(2, '0');

    // Formato YYYY-MM-DD HH:mm:ss
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

  const newContact = () => {
      navigate('/contacts/create');
  };
  const createOrUpdateContact = () => {
      navigate('/contacts/createOrUpdate');
  };

  const viewContact = (contactId) => {
      navigate(`/contacts/profile/${contactId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Given Name"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
          />
          <Input
            placeholder="Family Name"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
              min="1"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Page</label>
            <Input
              type="number"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="DateCreated">Date Created</option>
              <option value="LastUpdated">Last Updated</option>
              <option value="LastName">Last name</option>
              <option value="FirstName">Firstname</option>
              <option value="Email">Email</option>
               <option value="Id">ID</option>

            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Direction</label>
            <select
              value={orderDirection}
              onChange={(e) => setOrderDirection(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="TRUE">ASC</option>
              <option value="FALSE">DESC</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Last updated since</label>
            <Input
              type="datetime-local"
              value={since}
              onChange={(e) => setSince(e.target.value)}
            />
          </div>
          {/* <div>
            <label className="block text-xs text-gray-500 mb-1">Until </label>
            <Input
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
            />
          </div> */}
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={createOrUpdateContact}>
            Create/Update
          </Button>
          <Button variant="secondary" onClick={newContact}>
            Create
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({contacts.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No contacts found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{contact.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {contact.given_name} {contact.family_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {contact.email_addresses?.[0]?.email || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {contact.phone_numbers?.[0]?.number || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(contact.date_created).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewContact(contact.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && contacts.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 0}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('previous')}

              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={contacts.length < limit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}