import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Callback() {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Connecting to Keap...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // 1. Capturar el código de la URL  
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        console.log(error)
        if (error) {
          setStatus('error');
          setMessage('Authorization failed. Please try again.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

     
        if (!code) {
          setStatus('error');
          setMessage('No authorization code received.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        setMessage('Processing authorization...');

        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/keap`,{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({code}),

        })

        let data = await response.json();
        console.log(data)
        localStorage.setItem('keap_tokens', JSON.stringify(data));
      
        if (!data.access_token) {
            setStatus('error')
            return
        }
        // console.log(localStorage.getItem('keap_tokens'))
        setStatus('success');
        setMessage('Successfully connected to Keap!');

        // 8. Redirigir al dashboard después de 1.5 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        
        {/* Status Icon */}
        <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-full">
          {status === 'processing' && (
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="animate-spin w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'processing' && 'Connecting...'}
          {status === 'success' && 'Connected!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        {/* Message */}
        <p className={`text-lg mb-6 ${
          status === 'processing' ? 'text-gray-600' :
          status === 'success' ? 'text-green-600' :
          'text-red-600'
        }`}>
          {message}
        </p>

        {/* Progress Steps (solo cuando está procesando) */}
        {status === 'processing' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Verifying authorization</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Fetching access tokens</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Setting up your account</span>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {status === 'success' && (
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        )}

        {status === 'error' && (
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        )}
      </div>
    </div>
  );
}

export default Callback;