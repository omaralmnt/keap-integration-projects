import axios from 'axios'

const api = axios.create({
    baseURL:'https://api.infusionsoft.com/crm/rest/v1'
})

api.interceptors.request.use(
    (config) => {
        const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}')

        if (tokens.access_token) {
            config.headers.Authorization = `Bearer ${tokens.access_token}`
        }

        return config
    },
    (error) => Promise.reject(error)

);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                console.log('Token expired, refreshing...')
                
                const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}')

                // Llamar a TU backend, no directo a Keap
                const refreshResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/keap/refresh`, {
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