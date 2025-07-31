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
            console.log(accountInfo)
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

 //Contact endpoints---------   

    async getContacts(queryParams){
        try {
            // console.log('testing',queryParams)
            
            const response = await api.get('/contacts', 
                {
                    params:{
                        email: queryParams.email,
                        family_name: queryParams.family_name,
                        given_name: queryParams.given_name,
                        limit: queryParams.limit,
                        offset: queryParams.offset,
                        // optional_properties: [],// Eg: ead_source_id, custom_fields, and job_title aren't included, by default.
                        order: queryParams.order, // Options -> Enum: "id" "date_created" "last_updated" "name" "firstName" "email" 
                        order_direction: queryParams.order_direction, //Enum: "ASCENDING" "DESCENDING"
                        since: queryParams.since,//n LastUpdated ex. 2017-01-01T22:17:59.039Z
                        until: queryParams.until, //n LastUpdated ex. 2017-01-01T22:17:59.039Z
                    }
                    
                }
            )

            return response.data
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async addorEditContact(contactInfo){
        try {

        Object.keys(contactInfo).forEach(key => {
            if (contactInfo[key] === undefined) {
                delete contactInfo[key];
            }
        });
        console.log(contactInfo)
        const response = await api.put('/contacts', contactInfo)
        return response.data
        
                  
        } catch (error) {
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.log('Error de API:', error.response.data);
            console.log('Código de estado:', error.response.status);
            console.log('Encabezados:', error.response.headers);
        } else if (error.request) {
            // La solicitud fue hecha pero no hubo respuesta
            console.log('No hubo respuesta del servidor:', error.request);
        } else {
            // Ocurrió un error al configurar la solicitud
            console.log('Error al configurar la solicitud:', error.message);
        }
            throw error
        }


    }
    async getContactsPaginated(url) {
        try {
         const response = await api.get(url)
         return response.data
        } catch (error) {
            console.log(error)
            throw error
        }
        
    }

    async getContactById(id){
        try {
            console.log(id)
         const response = await api.get('/contacts/'+id) 
         return response.data       
        } catch (error) {
            console.log(error)
            throw error
        }
    }




}

const keapAPI = new KeapAPI()
export default keapAPI

