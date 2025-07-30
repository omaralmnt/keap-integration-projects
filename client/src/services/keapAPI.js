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
        const payload = {
            addresses: contactInfo.addresses?.map(addr => ({
                country_code: addr.country_code,
                field: addr.field, // "BILLING"
                line1: addr.line1,
                line2: addr.line2,
                locality: addr.locality,
                postal_code: addr.postal_code,
                region: addr.region,
                zip_code: addr.zip_code,
                zip_four: addr.zip_four
            })) || [],
            
            anniversary: contactInfo.anniversary, // yyyy-MM-dd format
            birthday: contactInfo.birthday, // ISO datetime string, ex: "2019-08-24T14:15:22Z"
            
            company: contactInfo.company ? {
                id: contactInfo.company.id
            } : undefined,
            
            contact_type: contactInfo.contact_type,
            
            custom_fields: contactInfo.custom_fields?.map(field => ({
                content: field.content,
                id: field.id
            })) || [],
            
            email_addresses: contactInfo.email_addresses?.map(eml => ({
                email: eml.email,
                field: eml.field // Enum: "EMAIL1" "EMAIL2" "EMAIL3"
            })) || [],

            family_name: contactInfo.family_name,
            
            fax_numbers: contactInfo.fax_numbers?.map(fx => ({
                field: fx.field, // "FAX1"
                number: fx.number,
                type: fx.type
            })) || [],
            
            given_name: contactInfo.given_name,
            job_title: contactInfo.job_title,
            lead_source_id: contactInfo.lead_source_id,
            middle_name: contactInfo.middle_name,
            opt_in_reason: contactInfo.opt_in_reason,
            
            origin: contactInfo.origin ? {
                ip_address: contactInfo.origin.ip_address
            } : undefined,
            
            owner_id: contactInfo.owner_id,
            
            phone_numbers: contactInfo.phone_numbers?.map(phone => ({
                extension: phone.extension,
                field: phone.field, // "PHONE1"
                number: phone.number,
                number_e164: phone.number_e164,
                type: phone.type
            })) || [],
            
            preferred_locale: contactInfo.preferred_locale, // "en_US"
            preferred_name: contactInfo.preferred_name,
            prefix: contactInfo.prefix,
            
            social_accounts: contactInfo.social_accounts?.map(social => ({
                name: social.name,
                type: social.type // "Facebook"
            })) || [],
            
            source_type: contactInfo.source_type, // "APPOINTMENT"
            spouse_name: contactInfo.spouse_name,
            suffix: contactInfo.suffix,
            time_zone: contactInfo.time_zone,
            website: contactInfo.website,
            duplicate_option: contactInfo.duplicate_option // "Email"
        };

        // Remove undefined fields to keep payload clean
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) {
                delete payload[key];
            }
        });
         



         
        } catch (error) {
            console.log(error)
            throw error
        }

    }


}

const keapAPI = new KeapAPI()
export default keapAPI

