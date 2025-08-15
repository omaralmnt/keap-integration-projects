import { useEffect, useState } from 'react';

function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleKeapConnect = () => {
    setIsLoading(true);
    const authUrl =  `${process.env.REACT_APP_KEAP_AUTH_URL}?client_id=${process.env.REACT_APP_KEAP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_KEAP_REDIRECT_URI}&response_type=${process.env.REACT_APP_KEAP_RESPONSE_TYPE}&scope=${process.env.REACT_APP_KEAP_SCOPE}`   

    // console.log(authUrl)
    window.location.href = authUrl
    // AQUÍ VAS A IMPLEMENTAR TU LÓGICA DE OAUTH
    //console.log('Iniciando conexión con Keap...');
    
    // Simulando loading por ahora
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}');
    if (tokens.access_token) {
      window.location.href = '/dashboard'; // Redirigir al dashboard si ya hay tokens
    }

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Keap Integration</h1>
          <p className="text-gray-600">Connect your Keap account to get started</p>
        </div>

        {/* Info Cards */}
        {/* <div className="space-y-3 mb-8">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">Secure OAuth 2.0 connection</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">Access your contacts & campaigns</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">Sync data in real-time</span>
          </div>
        </div> */}

        {/* Connect Button */}
        <button
          onClick={() =>handleKeapConnect()}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </div>
          ) : (
            'Connect to Keap'
          )}
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By connecting, you agree to share your Keap data with this application
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;