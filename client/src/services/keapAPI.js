import api from './httpClient'
function sanitizeDate(dateStr) {
    // Elimina cualquier ":00.000Z" extra al final
    return dateStr.replace(/:00\.000Z$/, '');
}


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

function cleanParams(params) {
    const result = {};

    Object.entries(params).forEach(([key, value]) => {
        if (
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '')
        ) {
            return;
        }

        if (Array.isArray(value)) {
            const filteredArray = value.filter(item =>
                item !== undefined &&
                item !== null &&
                !(typeof item === 'string' && item.trim() === '')
            );

            if (filteredArray.length > 0) {
                result[key] = filteredArray;
            }
        } else {
            result[key] = value;
        }
    });

    return result;
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
    //Email endpoints-------------------------------------------------------------------------------------------  

    async getEmails(queryParams) {
        try {


            const parameters = cleanParams(queryParams)
            const response = await api.get(`emails`, {
                params: parameters
            })
            return response.data

        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }

    async getEmailById(emailId) {
        try {

            const response = await api.get(`emails/${emailId}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error)
            return { success: false, error: errorInfo }
        }
    }
    async getEmailsPaginated(url) {
        try {
            const response = await api.get(url)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    //User endpoints-------------------------------------------------------------------------------------------  
    async getUsers(queryParams) {
        try {
            const params = cleanParams(queryParams)
            const response = await api.get(`users`, {
                params: params
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    async getUserEmailSignature(userId) {
        try {
            const response = await api.get(`users/${userId}/signature`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }


    }

    async createUser(userData) {
        try {
            const params = cleanParams(userData)
            const response = await api.post(`users`, params)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }
    async sendEmail(emailData) {
        try {
            console.log(emailData)
            const response = await api.post(`emails/queue`, emailData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async emailCreateEmailRecord(recordData) {
        try {
            const response = await api.post(`emails`, recordData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async deleteEmailRecord(id) {
        try {
            const response = await api.delete(`emails/${id}`)
            return response
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async createEmailRecordsBatch(batchData) {
        try {
            console.log(batchData)

            batchData.emails = batchData.emails.map(email => ({
                ...email,
                sent_date: sanitizeDate(email.sent_date),
                // Asegúrate de hacerlo también con received_date, opened_date, etc. si existen
            }));
            const response = await api.post(`emails/sync`, batchData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async deleteEmailRecordsBatch(batchData) {
        try {
            // console.log(batchData)
            const response = await api.post(`emails/unsync`, { ids: batchData })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }
    // companies-------------------------------------------------------------------------------------------------------***
    async getCompanies(queryParams) {
        try {
            queryParams.optional_properties = 'notes,fax_number'
            console.log(queryParams)
            const response = await api.get(`companies`, {
                params: queryParams
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getCompanyById(id) {
        try {
            const response = await api.get(`companies/${id}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async createCompany(companyData) {
        try {
            const response = await api.post(`companies`, companyData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    async updateCompany(companyId, companyData) {
        try {
            const CompanyD = cleanParams(companyData)
            const response = await api.patch(`companies/${companyId}`, CompanyD)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }
    // Note endpoints-------------------------------------------------------------------

    async getNotes(queryParams) {
        try {
            const response = await api.get(`notes`, {
                params: queryParams
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async createNote(noteData) {
        try {
            const response = await api.post(`notes`, noteData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async deleteNote(noteId) {
        try {
            const response = await api.delete(`notes/${noteId}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }
    async updateNote(noteId, noteData) {
        try {
            noteData = cleanParams(noteData)
            const response = await api.patch(`notes/${noteId}`, noteData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async replaceNote(noteId, noteData) {
        try {
            const response = await api.put(`notes/${noteId}`, noteData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getAppointments(queryParams) {
        try {
            const response = await api.get(`appointments/`, {
                params: queryParams
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getAppointmentById(id) {
        try {
            const response = await api.get(`appointments/${id}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async createAppointment(apptData) {
        try {
            const response = await api.post(`appointments/`, apptData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async updateAppointment(apptId, apptData) {
        try {
            apptData = cleanParams(apptData)
            const response = await api.patch(`appointments/${apptId}`, apptData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async replaceAppointment(apptId, apptData) {
        try {
            const response = await api.put(`appointments/${apptId}`, apptData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async deleteAppointment(apptId, apptData) {
        try {
            const response = await api.delete(`appointments/${apptId}`, apptData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    // tasks endpoints------------------------- 
    async getTasks(queryParams) {
        try {
            const response = await api.get(`tasks`, {
                params: queryParams
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async createTask(taskData) {
        try {

            taskData = cleanParams(taskData)
            console.log(taskData)
            const response = await api.post('tasks', taskData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }


    async updateTask(taskId, taskData) {
        try {
            taskData = cleanParams(taskData)
            const response = await api.patch(`tasks/${taskId}`, taskData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async replaceTask(taskId, taskData) {
        try {
            const response = await api.put(`tasks/${taskId}`, taskData)
            return response
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async deleteTask(taskId) {
        try {
            const response = await api.delete(`tasks/${taskId}`)
            return response
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }
    // Files endpoints---------------------------------------------------

    async getFiles(queryParams) {
        queryParams = cleanParams(queryParams)
        try {
            const response = await api.get(`files/`, {
                params: queryParams
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }
    async getFileById(fileId) {

        try {
            const response = await api.get(`files/${fileId}`, {
                params: {
                    optional_properties: 'file_data'
                }
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }
    async getFilesPaginated(url) {
        try {
            const response = await api.get(url)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }
    async uploadFile(fileData) {
        try {
            console.log(fileData)
            delete fileData?.public
            const response = await api.post(`files`, fileData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }
    async deleteFile(fileId) {

        try {
            const response = await api.delete(`files/${fileId}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async replaceFile(fileId, fileData) {
        try {
            delete fileData?.public

            const response = await api.put(`files/${fileId}`, fileData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getSettings() {
        try {
            const response = await api.get(`setting/application/configuration/`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    async getApplicationStatus() {
        try {
            const response = await api.get(`setting/application/enabled`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getProducts(queryParams) {
        try {

            console.log(queryParams)
            const response = await api.get(`products`, {
                params: queryParams
            })
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }
    async getProductsPaginated(url) {
        try {
            const response = await api.get(url)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }

    }

    async createProduct(productData) {
        try {
            const response = await api.post('products', productData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async getProductById(productId) {
        try {
            const response = await api.get(`products/${productId}`)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

    async updateProduct(productId, productData) {
        try {
            productData = cleanParams(productData)
            const response = await api.patch(`products/${productId}`, productData)
            return response.data
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };

        }
    }

    async deleteProduct(productId) {
        try {
            const response = await api.delete(`products/${productId}`)
            return response
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };

        }
    }
}

const keapAPI = new KeapAPI()
export default keapAPI