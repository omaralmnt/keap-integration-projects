import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_APP_KEAP_PROXY_URL
})

api.interceptors.request.use(
    (config) => {
        const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}')

        if (tokens.access_token) {
            config.headers.Authorization = `Bearer ${tokens.access_token}`
        }

        // Para XML-RPC, mantener el Authorization header (no removerlo)
        if (config.headers['Content-Type'] === 'text/xml') {
            console.log('🔍 XML-RPC detected - keeping Authorization header');
        }

        return config
    },
    (error) => Promise.reject(error)

);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // No intentar refresh para XML-RPC requests que fallan
        if (originalRequest.headers['Content-Type'] === 'text/xml') {
            console.log('🚫 XML-RPC request failed - not attempting token refresh');
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                console.log('Token expired, refreshing...')
                
                const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}')

                const refreshResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/keap/auth/refresh`, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        refresh_token: tokens.refresh_token 
                    })
                })

                if (!refreshResponse.ok) {
                    throw new Error('Refresh failed')
                }

                const newTokens = await refreshResponse.json() 

                localStorage.setItem('keap_tokens', JSON.stringify(newTokens))

                originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`
                
                return api(originalRequest) 

            } catch (refreshError) {
                console.error('Refresh failed, logging out:', refreshError)
                localStorage.clear()
                window.location.href = '/' 
                return Promise.reject(refreshError) 
            }
        }

        return Promise.reject(error) 
    }
)
export default api