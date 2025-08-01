import api from './httpClient'

const handleError = (error) => {
    if (error.response) {
        console.log(error.response.status + ' - ' + error.response.data?.message)
    } else {
        console.log(error)

    }
    throw error
}
class KeapAPI {


    //ACCOUNT INFO ENDPOINTS ------------------------
    async getAccountProfile() {
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
            const response = await api.put('/account/profile', accountInfo)
            return response.data
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    //AFFILIATE ENDPOINTS 
    async getAffiliates(queryParams) {
        try {
            const response = await api.get('/affiliates')
            return response.data
        } catch (error) {
            handleError(error)
        }
    }

    //Contact endpoints---------   

    async getContacts(queryParams) {
        try {
            // console.log('testing',queryParams)
            console.log('params',queryParams)
            const response = await api.get('/contacts',
                {
                    params: {
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
            handleError(error)
        }
    }

    async createOrUpdateContact(contactInfo) {
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
            handleError(error)
        }


    }

    async createContact(contactInfo) {
        try {

            Object.keys(contactInfo).forEach(key => {
                if (contactInfo[key] === undefined) {
                    delete contactInfo[key];
                }
            });
            console.log(contactInfo)
            const response = await api.post('/contacts', contactInfo)
            return response.data


        } catch (error) {
            handleError(error)
        }

    }

    async updateContact(id,contactInfo) {
        try {
            Object.keys(contactInfo).forEach(key => {
                if (contactInfo[key] === undefined) {
                    delete contactInfo[key];
                }
            });

            const response = await api.patch(`/contacts/${id}`,contactInfo)
            return response.data
        } catch (error) {
            handleError(error)
        }
    }


    async getContactsPaginated(url) {
        try {
            const response = await api.get(url)
            return response.data
        } catch (error) {
            handleError(error)
        }

    }

    async getContactById(id) {
        try {
            console.log(id)
            const response = await api.get(`/contacts/${id}`, {
                params: {
                    optional_properties: 'job_title,website,middle_name,suffix,contact_type,spouse_name,time_zone,birthday,anniversary'
                }
            })
            return response.data
        } catch (error) {
            handleError(error)
        }
    }




}

const keapAPI = new KeapAPI()
export default keapAPI

