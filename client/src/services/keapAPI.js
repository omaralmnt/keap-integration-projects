import api from './httpClient'

const handleError = (error) => {
    if (error.response) {
        console.log(error.response.status + ' - ' + error.response.data?.message);
    } else {
        console.log(error);
    }

    // Devolver información del error en lugar de lanzarlo
    return {
        status: error.response?.status,
        message: error.response?.data?.message || error.message || 'Unknown error'
    };
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
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    //Contact endpoints-------------------------------------------------------------------------------------------  

    async getContacts(queryParams) {
        try {
            // console.log('testing',queryParams)
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
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
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
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
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
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    async updateContact(id, contactInfo) {
        try {

            delete contactInfo.tag_ids;
            delete contactInfo.ScoreValue;
            delete contactInfo.last_updated_utc_millis;

            Object.keys(contactInfo).forEach(key => {
                if (contactInfo[key] === undefined) {
                    delete contactInfo[key];
                }
            });
            console.log(contactInfo)
            const response = await api.patch(`/contacts/${id}`, contactInfo)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }


    async getContactsPaginated(url) {
        try {
            const response = await api.get(url)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    async getContactById(id) {
        try {
            // console.log(id)
            const response = await api.get(`/contacts/${id}`, {
                params: {
                    optional_properties: 'job_title,website,middle_name,suffix,contact_type,spouse_name,time_zone,birthday,anniversary,social_accounts,source_type'
                }
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async deleteContact(id) {
        try {
            const response = await api.delete(`contacts/${id}`)
            return response
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getCreditCardsByContactId(id) {
        try {
            const response = await api.get(`contacts/${id}/creditCards`,)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async createCreditCard(contactId, cardData) {
        try {
            const response = await api.post(`/contacts/${contactId}/creditCards`, cardData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getEmailsByContactId(contactId, queryParams) {
        try {
            const response = await api.get(`/contacts/${contactId}/emails`, {}, {
                params: queryParams
            }

            )
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, errorInfo }
        }
    }

    async createEmailRecord(contactId, emailData) {
        try {

            const response = await api.post(`/contacts/${contactId}/emails`, emailData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, errorInfo }
        }
    }

    async getContactTags(contactId, queryParams) {
        try {

            const response = await api.get(`contacts/${contactId}/tags`, {}, {
                params: queryParams
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, errorInfo }
        }
    }

    async applyTagsToContact(contactId, tagIds) {
        try {
            const response = await api.post(`contacts/${contactId}/tags`, { tagIds: tagIds })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, errorInfo }
        }
    }



    async removeTagFromContact(contactId, tagId) {
        try {
            const response = await api.delete(`contacts/${contactId}/tags/${tagId}`)
            return response
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, errorInfo }
        }
    }

    async removeTagsFromContact(contactId, tagIds) {
        try {
            //tagIds should be an array of tagIds ex: [1,2,3,4]
            const idsString = tagIds.join(',')  // convierte [181, 119, 127] → "181,119,127"
            const response = await api.delete(`contacts/${contactId}/tags`, {
                params: {
                    ids: idsString
                }
            })
            return response
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, errorInfo }
        }
    }

    //Tag endpoints-------------------------------------------------------------------------------------------  


    async getTags(queryParams) {
        try {
            // Elimina los parámetros vacíos
            const cleanParams = Object.fromEntries(
                Object.entries(queryParams).filter(([_, value]) => value !== null && value !== undefined && value !== '')
            )

            const response = await api.get('tags', {
                params: cleanParams
            })

            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, errorInfo }
        }
    }
    async getTagsPaginated(url) {
        try {
            const response = await api.get(url)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    async createTag(tagData) {
        try {
            const payload = {
                name: tagData.name,
                description: tagData.description,
                category: {
                    id: tagData.category_id
                }
            }
            const response = await api.post(`tags`, payload)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async createTagCategory(tagCategoryData) {
        try {
            const response = await api.post(`tags/categories`, tagCategoryData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }
    async getTag(tagId) {
        try {
            const response = await api.get(`tags/${tagId}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }
    async getTaggedCompanies(tagId) {
        try {
            const response = await api.get(`tags/${tagId}/companies`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }

    async getTaggedContacts(tagId) {
        try {
            const response = await api.get(`tags/${tagId}/contacts`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }

    async applyTagToContacts(tagId, contactIds) {
        try {
            console.log(contactIds)

            const response = await api.post(`tags/${tagId}/contacts`, contactIds)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }

    async tagRemoveTagFromContact(tagId, contactId) {
        try {
            const response = await api.delete(`tags/${tagId}/contacts/${contactId}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }
    async tagRemoveTagFromContacts(tagId, contactIds) {
        try {
            console.log(contactIds)

            const queryString = contactIds.ids.map(id => `ids=${encodeURIComponent(id)}`).join('&')

            const url = `tags/${tagId}/contacts?${queryString}` //THIS ENDPOINT IS NOT WORKING

            const response = await api.delete(url)

            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }
}

const keapAPI = new KeapAPI()
export default keapAPI