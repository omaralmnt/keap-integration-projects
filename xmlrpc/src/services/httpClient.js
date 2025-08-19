import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_APP_KEAP_PROXY_URL
})

// API Key constante
const KEAP_API_KEY = 'KeapAK-14f4164b91fa1394570f97c7a5c4069fd7c34a80c1b2230ce1'

api.interceptors.request.use(
    (config) => {
        // Usar la API Key directamente en lugar de tokens del localStorage
        config.headers.Authorization = `Bearer ${KEAP_API_KEY}`

        // Para XML-RPC, mantener el Authorization header
        if (config.headers['Content-Type'] === 'text/xml') {
            console.log('🔍 XML-RPC detected - using API Key authorization');
        }

        return config
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Como usamos API Key en lugar de tokens OAuth, no necesitamos lógica de refresh
        // Solo manejamos errores directamente
        
        if (error.response?.status === 401) {
            console.error('🚫 API Key authentication failed');
            // Opcional: redirigir o manejar error de autenticación
        }

        return Promise.reject(error)
    }
)

export default api