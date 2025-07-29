import api from './httpClient'

class KeapAPI{


//ACCOUNT INFO ENDPOINTS ------------------------
    async  getAccountProfile() {
        try {
            const response = await api.get('/account/profile')
            return response.data
        } catch (error) {
          console.log(error)
          throw error  
        }
        
    }
    async updateAccountProfile(accountInfo) {
        try {
            const response = await api.put('/account/profile',accountInfo)
            return response.data
        } catch (error) {
            console.log(error)
            throw error
        }
    }

 //AFFILIATE ENDPOINTS 
    async getAffiliates(queryParams){
        try {
            const response = await api.get('/affiliates')
            return response.data
        } catch (error) {
            console.log(error)
            throw error
        }
    }


}

const keapAPI = new KeapAPI()
export default keapAPI

