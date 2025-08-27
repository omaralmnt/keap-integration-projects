import { XmlRpcMessage, XmlRpcResponse } from 'xmlrpc-parser';
import api from './httpClient'; // Tu cliente HTTP existente

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
function formatToISO(fechaStr) {
    if (!fechaStr || fechaStr.length < 17) return ""; // evita errores si es undefined o demasiado corta

    const año = fechaStr.slice(0, 4);
    const mes = fechaStr.slice(4, 6);
    const dia = fechaStr.slice(6, 8);
    const hora = fechaStr.slice(9, 11);
    const minutos = fechaStr.slice(12, 14);
    const segundos = fechaStr.slice(15, 17);

    const fecha = new Date(Date.UTC(año, mes - 1, dia, hora, minutos, segundos));

    if (isNaN(fecha.getTime())) return "";

    return fecha.toISOString();
}

const handleError = (error, context = '') => {
    let errorDetails = {
        context,
        message: 'Unknown error'
    };

    if (error.response) {
        errorDetails = {
            ...errorDetails,
            status: error.response.status,
            message: error.response.data?.message || `HTTP ${error.response.status} Error`,
            url: error.response.config?.url
        };
        console.error(`${context} - HTTP Error:`, errorDetails.message);
    } else if (error.request) {
        errorDetails = {
            ...errorDetails,
            message: 'No response received from server'
        };
        console.error(`${context} - Network Error:`, errorDetails.message);
    } else {
        errorDetails = {
            ...errorDetails,
            message: error.message || 'Unknown error'
        };
        console.error(`${context} - Error:`, errorDetails.message);
    }

    return errorDetails;
}

function parseXmlRpcDate(dateString) {
    // "20250220T10:22:14" -> "2025-02-20T10:22:14"
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const time = dateString.substring(9); // "10:22:14"

    return new Date(`${year}-${month}-${day}T${time}`);
}

class KeapAPI {
    constructor() {
        // Configuración base
        this.xmlrpcUrl = '/xmlrpc'; // Usando tu proxy existente
    }

    // Método genérico para llamadas XML-RPC usando xmlrpc-parser
    async xmlRpcCall(method, params = []) {
        const context = `XML-RPC ${method}`;

        try {
            // Obtener access token
            const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}');
            const privateKey = 'x';

            if (!privateKey) {
                throw new Error('Access token requerido para XML-RPC');
            }

            // Agregar privateKey como primer parámetro
            const xmlRpcParams = [privateKey, ...params];

            // Crear el mensaje XML-RPC usando xmlrpc-parser
            const xmlRpcMessage = new XmlRpcMessage(method, xmlRpcParams);
            const xmlPayload = xmlRpcMessage.xml();

            // Enviar la petición usando tu cliente HTTP existente
            const response = await api.post(this.xmlrpcUrl, xmlPayload, {
                headers: {
                    'Content-Type': 'text/xml'
                }
            });

            // Parsear la respuesta
            let parsedResponse;

            try {
                // Verificar si XmlRpcResponse necesita ser instanciado diferente
                if (typeof XmlRpcResponse === 'function') {
                    parsedResponse = new XmlRpcResponse(response.data);
                } else {
                    parsedResponse = XmlRpcResponse(response.data);
                }

                // Verificar si los métodos existen antes de usarlos
                if (parsedResponse && typeof parsedResponse.isFault === 'function') {
                    if (parsedResponse.isFault()) {
                        const fault = parsedResponse.fault();
                        throw new Error(`XML-RPC Fault ${fault.code}: ${fault.string}`);
                    }
                    return parsedResponse.value();
                } else {
                    // Fallback: parsear manualmente el XML
                    return this.parseXmlRpcResponse(response.data);
                }

            } catch (parseError) {
                return this.parseXmlRpcResponse(response.data);
            }

        } catch (error) {
            const errorDetails = handleError(error, context);

            // Re-throw con más contexto específico
            const enhancedError = new Error(`${context} failed: ${errorDetails.message}`);
            enhancedError.originalError = error;
            enhancedError.context = context;

            throw enhancedError;
        }
    }

    // Método fallback para parsear XML-RPC manualmente
    parseXmlRpcResponse(xmlString) {
        try {
            if (!xmlString || typeof xmlString !== 'string') {
                throw new Error('Empty or invalid XML response received');
            }

            // Crear un parser DOM
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            // Verificar errores de parsing
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error(`Invalid XML format: ${parserError.textContent.split('\n')[0]}`);
            }

            // Verificar si es un fault
            const faultNode = xmlDoc.querySelector('methodResponse fault');
            if (faultNode) {
                const structMembers = faultNode.querySelectorAll('struct member');
                let faultCode = 'Unknown';
                let faultString = 'Unknown fault';

                structMembers.forEach(member => {
                    const name = member.querySelector('name')?.textContent;
                    const value = member.querySelector('value')?.textContent;
                    if (name === 'faultCode') faultCode = value;
                    if (name === 'faultString') faultString = value;
                });

                throw new Error(`Server Fault ${faultCode}: ${faultString}`);
            }

            // Verificar si hay una respuesta válida
            const valueNode = xmlDoc.querySelector('methodResponse params param value');
            if (!valueNode) {
                const responseType = xmlDoc.documentElement?.tagName || 'unknown';
                throw new Error(`Invalid XML-RPC response structure. Got '${responseType}' instead of expected 'methodResponse'`);
            }

            // Parsear el valor de respuesta
            return this.parseXmlValue(valueNode);

        } catch (error) {
            if (error.message.includes('XML-RPC') || error.message.includes('Server Fault') || error.message.includes('Invalid XML')) {
                throw error; // Re-throw errores específicos que ya tienen buen formato
            }
            throw new Error(`XML parsing failed: ${error.message}`);
        }
    }

    // Método auxiliar para parsear valores XML-RPC
    parseXmlValue(valueNode) {
        if (!valueNode) {
            throw new Error('Missing value node in XML response');
        }

        try {
            // Array
            const arrayNode = valueNode.querySelector('array data');
            if (arrayNode) {
                const values = arrayNode.querySelectorAll(':scope > value');
                return Array.from(values).map((v, index) => {
                    try {
                        return this.parseXmlValue(v);
                    } catch (error) {
                        throw new Error(`Error parsing array item ${index}: ${error.message}`);
                    }
                });
            }

            // Struct
            const structNode = valueNode.querySelector('struct');
            if (structNode) {
                const members = structNode.querySelectorAll(':scope > member');
                const obj = {};

                members.forEach((member, index) => {
                    try {
                        const name = member.querySelector('name')?.textContent;
                        const value = member.querySelector('value');

                        if (!name) {
                            throw new Error(`Missing name in struct member ${index}`);
                        }
                        if (!value) {
                            throw new Error(`Missing value in struct member '${name}'`);
                        }

                        obj[name] = this.parseXmlValue(value);
                    } catch (error) {
                        throw new Error(`Error parsing struct member ${index}: ${error.message}`);
                    }
                });
                return obj;
            }

            // Tipos primitivos
            const stringNode = valueNode.querySelector('string');
            if (stringNode) {
                return stringNode.textContent || '';
            }

            const intNode = valueNode.querySelector('i4') || valueNode.querySelector('int');
            if (intNode) {
                const intValue = parseInt(intNode.textContent);
                if (isNaN(intValue)) {
                    throw new Error(`Invalid integer value: '${intNode.textContent}'`);
                }
                return intValue;
            }

            const booleanNode = valueNode.querySelector('boolean');
            if (booleanNode) {
                return booleanNode.textContent === '1';
            }

            const doubleNode = valueNode.querySelector('double');
            if (doubleNode) {
                const doubleValue = parseFloat(doubleNode.textContent);
                if (isNaN(doubleValue)) {
                    throw new Error(`Invalid double value: '${doubleNode.textContent}'`);
                }
                return doubleValue;
            }

            // Si no hay tipo específico, verificar si hay contenido directo de texto
            const textContent = valueNode.textContent?.trim();
            if (textContent && !valueNode.querySelector('*')) {
                return textContent;
            }

            // Default: return as string si hay contenido
            return textContent || '';

        } catch (error) {
            if (error.message.includes('Error parsing')) {
                throw error; // Re-throw errores específicos
            }
            throw new Error(`Failed to parse XML value: ${error.message}`);
        }
    }

    // Test de conexión
    async ping() {
        try {
            const result = await this.xmlRpcCall('DataService.ping', []);
            return { success: true, data: result };
        } catch (error) {
            const errorInfo = handleError(error, 'Ping test');
            return { success: false, error: errorInfo };
        }
    }

    //XML FUNCTIONS------------------------------------------------------------------------------------------------------------------------------
    async getContacts(queryParams, fields = ['Id', 'FirstName', 'LastName', 'Email', 'Phone1', 'DateCreated']) {
        try {


            queryParams.query = cleanParams(queryParams.query)
            // console.log('he',queryParams.query)
            const result = await this.xmlRpcCall('DataService.query', [
                'Contact',      // table
                queryParams.limit,          // limit
                queryParams.page,           // page
                queryParams.query || {},      // queryData
                fields,          // selectedFields
                queryParams.OrderBy,//Field to order by
                true//ASCENDING OR DESCENDING (true = asc)
            ]);

            return {
                success: true, contacts: result.map(c => ({
                    id: c.Id,
                    given_name: c.FirstName,
                    family_name: c.LastName,
                    email_addresses: [{ email: c.Email }],
                    phone_numbers: [{ number: c.Phone1 }],
                    date_created: parseXmlRpcDate(c.DateCreated)
                }))
            };
        } catch (error) {
            console.error('Error in getContacts:', error.message);
            const errorInfo = handleError(error, 'Get Contacts');
            return { success: false, error: errorInfo };
        }
    }

    async createOrUpdateContact(duplicateOption = 'Email', contactData) {
        try {
            const result = await this.xmlRpcCall('ContactService.addWithDupCheck', [
                contactData,
                duplicateOption
            ])

            return { success: true, status: result }
        } catch (error) {
            console.error('Error in createOrUpdateContact:', error.message);
            const errorInfo = handleError(error, 'Create/Update Contact');
            return { success: false, error: errorInfo };
        }
    }

    async createContact(contactData) {
        try {
            const result = await this.xmlRpcCall('ContactService.add', [
                contactData
            ])
            return { sucess: true, data: result }
        } catch (error) {
            const errorInfo = handleError(error, 'Create Contact');
            return { success: false, error: errorInfo };
        }
    }

    async getContactById(contactId) {
        try {
            const result = await this.xmlRpcCall('ContactService.load', [
                contactId,
                ['Id', 'FirstName', 'MiddleName', 'LastName', 'JobTitle', 'ContactType', 'SpouseName', 'Website', 'Birthday',
                    'Anniversary', 'Company', 'LeadSource', 'OwnerID', 'TimeZone', 'Email', 'EmailAddress2', 'EmailAddress3', 'Phone1',
                    'Phone1Type', 'Phone1Ext', 'Phone2', 'Phone2Type', 'Phone2Ext', 'Phone3', 'Phone3Type', 'Phone3Ext',
                    'Phone4', 'Phone4Type', 'Phone4Ext', 'Phone5', 'Phone5Type', 'Phone5Ext', 'Fax1', 'Fax1Type', 'Fax2', 'Fax2Type',
                    'DateCreated', 'LastUpdated'
                ]

            ])
            const resultSocial = await this.xmlRpcCall('DataService.query', [
                'SocialAccount',
                10,
                0,
                {
                    'ContactId': contactId
                },
                ['AccountName', 'AccountType']

            ])

            // console.log('social ', resultSocial)
            // console.log(result)
            return {
                given_name: result.FirstName,
                middle_name: result.MiddleName,
                family_name: result.LastName,
                id: result.Id,
                job_title: result.JobTitle,
                contact_type: result.ContactType,
                spouse_name: result.SpouseName,
                website: result.Website,
                anniversary: result.Anniversary,
                company: result.Company,
                source_type: result.LeadSource,
                owner_id: result.OwnerID,
                time_zone: result.TimeZone,
                email_addresses: [
                    {
                        email: result.Email,
                        field: 'EMAIL1'
                    },
                    {
                        email: result.EmailAddress2,
                        field: 'EMAIL2',

                    },
                    {
                        email: result.EmailAddress3,
                        field: 'EMAIL3',

                    }
                ],
                phone_numbers: [
                    {
                        number: result.Phone1,
                        field: 'PHONE1',
                        type: result.Phone1Type,
                        extension: result.Phone1Ext,
                    },

                    {
                        number: result.Phone2,
                        field: 'PHONE2',
                        type: result.Phone2Type,
                        extension: result.Phone2Ext,
                    },
                    {
                        number: result.Phone3,
                        field: 'PHONE3',
                        type: result.Phone3Type,
                        extension: result.Phone3Ext,
                    },
                    {
                        number: result.Phone4,
                        field: 'PHONE4',
                        type: result.Phone4Type,
                        extension: result.Phone4Ext,
                    },
                    {
                        number: result.Phone5,
                        field: 'PHONE5',
                        type: result.Phone5Type,
                        extension: result.Phone5Ext,
                    },
                ],
                fax_numbers: [
                    {
                        field: 'FAX1',
                        number: result.Fax1,
                        type: result.Fax1Type
                    },
                    {
                        field: 'FAX2',
                        number: result.Fax2,
                        type: result.Fax2Type
                    }
                ],
                social_accounts:
                    resultSocial.map(item => ({
                        type: item.AccountType,
                        name: item.AccountName
                    })),
                date_created: result.DateCreated,
                last_updated: result.LastUpdated

            }
        } catch (error) {
            const errorInfo = handleError(error, 'getContactById');
            return { success: false, error: errorInfo };
        }
    }

    async getCompanies(queryParams, fields = [
        'Id',
        'Company',
        'Email',
        'Phone1',
        'Website',
        'City',
        'State',
        'Country',
        'StreetAddress1',
        'PostalCode',
        'ContactNotes',
        'DateCreated'
    ]) {
        try {
            // Limpiar parámetros de consulta
            const cleanedQuery = cleanParams(queryParams.query || {});

            // Si hay company_name en queryParams, agregarlo a la query
            if (queryParams.company_name) {
                cleanedQuery.Company = queryParams.company_name;
            }

            // Determinar ordenamiento
            let orderField = 'DateCreated'; // default
            let orderDirection = true; // true = ASC, false = DESC

            if (queryParams.order) {
                switch (queryParams.order) {
                    case 'id':
                        orderField = 'Id';
                        break;
                    case 'date_created':
                        orderField = 'DateCreated';
                        break;
                    case 'name':
                        orderField = 'Company';
                        break;
                    case 'email':
                        orderField = 'Email';
                        break;
                    default:
                        orderField = 'DateCreated';
                }
            }

            if (queryParams.order_direction === 'DESCENDING') {
                orderDirection = false;
            }

            // Calcular página basada en offset y limit
            const page = Math.floor((queryParams.offset || 0) / (queryParams.limit || 50));

            const result = await this.xmlRpcCall('DataService.query', [
                'Company',           // table
                queryParams.limit || 50,    // limit
                page,               // page
                cleanedQuery,       // queryData
                fields,             // selectedFields
                orderField,         // OrderBy field
                orderDirection      // ASCENDING (true) OR DESCENDING (false)
            ]);

            // Generar URLs de paginación
            const currentOffset = queryParams.offset || 0;
            const limit = queryParams.limit || 50;
            const hasResults = result && result.length > 0;

            let nextUrl = null;
            let previousUrl = null;

            if (hasResults && result.length === limit) {
                // Hay siguiente página
                const nextOffset = currentOffset + limit;
                nextUrl = `?limit=${limit}&offset=${nextOffset}&order=${queryParams.order || 'date_created'}&order_direction=${queryParams.order_direction || 'DESCENDING'}`;
                if (queryParams.company_name) {
                    nextUrl += `&company_name=${encodeURIComponent(queryParams.company_name)}`;
                }
            }

            if (currentOffset > 0) {
                // Hay página anterior
                const prevOffset = Math.max(0, currentOffset - limit);
                previousUrl = `?limit=${limit}&offset=${prevOffset}&order=${queryParams.order || 'date_created'}&order_direction=${queryParams.order_direction || 'DESCENDING'}`;
                if (queryParams.company_name) {
                    previousUrl += `&company_name=${encodeURIComponent(queryParams.company_name)}`;
                }
            }

            return {
                success: true,
                companies: result.map(c => ({
                    id: c.Id,
                    company_name: c.Company,
                    email_address: c.Email,
                    website: c.Website,
                    phone_number: {
                        number: c.Phone1,
                        extension: '', // XML-RPC no parece tener extensión separada
                        type: 'Work'
                    },
                    fax_number: {
                        number: '', // Agregar si tienes campo de fax
                        type: 'Work'
                    },
                    address: {
                        line1: c.StreetAddress1,
                        line2: '', // Agregar si tienes StreetAddress2
                        locality: c.City,
                        region: c.State,
                        zip_code: c.PostalCode,
                        zip_four: '', // Agregar si tienes ZipFour1
                        country_code: c.Country
                    },
                    notes: c.ContactNotes,
                    email_status: 'Unknown', // Agregar lógica si tienes este campo
                    date_created: parseXmlRpcDate(c.DateCreated),
                    opt_in_reason: '' // Agregar si tienes este campo
                })),
                next: nextUrl,
                previous: previousUrl,
                count: result.length
            };
        } catch (error) {
            console.error('Error in getCompanies:', error.message);
            const errorInfo = handleError(error, 'Get Companies');
            return { success: false, error: errorInfo };
        }
    }
    async getContactTags(contactId, queryParams) {
        try {
            const result = await this.xmlRpcCall('DataService.query', [
                'ContactGroupAssign',
                queryParams.limit,
                queryParams.offset,
                {
                    contactId
                },
                ['ContactGroup', 'GroupId']
            ])
            const tags = result.map((item) => ({
                tag: {
                    id: item.GroupId,
                    name: item.ContactGroup
                },
                date_applied: null
            }))

            return {
                success: true,
                tags: tags,
                count: tags.length
            };



        } catch (error) {
            const errorInfo = handleError(error, 'getContactById');
            return { success: false, error: errorInfo };
        }
    }

    /////////////TAGS
    async getTags(queryParams) {
        try {
            const result = await this.xmlRpcCall('DataService.query', [
                'ContactGroup',
                100,
                0,
                {

                },
                ['GroupName', 'Id']
            ])
            const tags = result.map((item) => ({

                id: item.Id,
                name: item.GroupName


            }))
            // console.log('tags', tags)
            return {
                success: true,
                tags: tags,
                count: tags.length
            };



        } catch (error) {
            const errorInfo = handleError(error, 'getTags');
            return { success: false, error: errorInfo };
        }
    }

    async applyTagsToContact(contactId, tagIds) {
        try {
            for (const tag in tagIds) {
                const result = await this.xmlRpcCall('ContactService.addToGroup', [
                    contactId,
                    tagIds[tag]
                ])
            }
            return { sucess: true }
        } catch (error) {
            const errorInfo = handleError(error, 'applyTagsToContact');
            return { success: false, error: errorInfo };
        }
    }

    async removeTagsFromContact(contactId, tagIds) {
        try {
            console.log(tagIds)
            for (const tag in tagIds) {
                await this.xmlRpcCall('ContactService.removeFromGroup', [
                    contactId,
                    tagIds[tag]
                ])
            }
            return { sucess: true }
        } catch (error) {
            const errorInfo = handleError(error, 'removeTagsFromContact');
            return { success: false, error: errorInfo };
        }
    }

    // async getEmailsByContactId(contactId){
    //     try {
    //         const result = await this.xmlRpcCall('DataService.query',[
    //             ''

    //         ])
    //         return { sucess: true }            
    //     } catch (error) {
    //         const errorInfo = handleError(error,'GesEmailsByContactId')
    //         return { success: false, error: errorInfo };

    //     }
    // }

    async createEmailRecord(contactId, emailData) {
        try {
            const data = [
                contactId,
                emailData.sent_from_address,
                emailData.sent_from_address,
                emailData.sent_to_address,
                emailData.sent_to_cc_addresses,
                emailData.sent_to_bcc_addresses,
                'Multipart',
                emailData.subject,
                emailData.html_content,
                emailData.plain_content,
                emailData.headers,
                emailData.received_date,
                emailData.sent_date,
                1

            ]
            // console.log('h', data)
            const result = await this.xmlRpcCall('APIEmailService.attachEmail', data)
            return { success: true, result }
        } catch (error) {
            const errorInfo = handleError(error, 'GesEmailsByContactId')
            return { success: false, error: errorInfo };
        }
    }
    async emailCreateEmailRecord(contactId, emailData) {
        try {
            const data = [
                contactId,
                emailData.sent_from_address,
                emailData.sent_from_address,
                emailData.sent_to_address,
                emailData.sent_to_cc_addresses,
                emailData.sent_to_bcc_addresses,
                'Multipart',
                emailData.subject,
                emailData.html_content,
                emailData.plain_content,
                emailData.headers,
                emailData.received_date,
                emailData.sent_date,
                1

            ]
            // console.log('h', data)
            const result = await this.xmlRpcCall('APIEmailService.attachEmail', data)
            return { success: true, result }
        } catch (error) {
            const errorInfo = handleError(error, 'GesEmailsByContactId')
            return { success: false, error: errorInfo };
        }
    }
    async getCreditCardsByContactId(contactId) {
        try {
            const result = await this.xmlRpcCall('DataService.query', [
                'CreditCard',
                100,
                0,
                {
                    contactId
                },
                ['Id', 'Last4', 'CardType', 'Status'],
            ])
            const statusMap = {
                0: "unknown",
                1: "error",
                2: "deleted",
                3: "OK",
                4: "inactive"
            };
            const data = result.map((data) => ({
                id: data.Id,
                card_type: data.CardType,
                card_number: `xxxxxxxxxxxx${data.Last4}`,
                validation_status: statusMap[data.Status] || "unknown" // fallback
            }))
            return data

        } catch (error) {

            const errorInfo = handleError(error, 'getCreditCardsByContactId')
            return { success: false, error: errorInfo };
        }
    }

    async createCreditCard(contactId, cardData) {
        try {
            const result = await this.xmlRpcCall('DataService.add', [
                'CreditCard',
                {
                    ContactId: contactId,
                    BillCountry: cardData.address?.country_code || '',
                    BillAddress1: cardData.address?.line1 || '',
                    BillAddress2: cardData.address?.line2 || '',
                    BillCity: cardData.address?.locality || '',
                    BillState: cardData.address?.region || '',
                    BillZip: cardData.address?.postal_code || cardData.address?.zip_code || '',
                    CardNumber: cardData.card_number,
                    CardType: cardData.card_type,
                    ExpirationMonth: cardData.expiration_month,
                    ExpirationYear: cardData.expiration_year,
                    CVV2: cardData.verification_code,
                    NameOnCard: cardData.name_on_card,
                    Email: cardData.email_address,
                    MaestroIssueNumber: cardData.maestro_issue_number || '',
                    StartDateMonth: cardData.maestro_start_date_month || '',
                    StartDateYear: cardData.maestro_start_date_year || '',
                    Status: 3 // 3 = OK (activa)
                }
            ]);
            return { success: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'createCreditCard');
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    async updateContact(contactId, contactData) {
        try {
            // Mapear el payload JSON al formato esperado por la API de Infusionsoft
            const mappedData = {};

            // Campos básicos
            if (contactData.given_name) mappedData.FirstName = contactData.given_name;
            if (contactData.family_name) mappedData.LastName = contactData.family_name;
            if (contactData.middle_name) mappedData.MiddleName = contactData.middle_name;
            if (contactData.suffix) mappedData.Suffix = contactData.suffix;
            if (contactData.job_title) mappedData.JobTitle = contactData.job_title;
            if (contactData.spouse_name) mappedData.SpouseName = contactData.spouse_name;
            if (contactData.website) mappedData.Website = contactData.website;
            if (contactData.time_zone) mappedData.TimeZone = contactData.time_zone;
            if (contactData.contact_type) mappedData.ContactType = contactData.contact_type;
            if (contactData.owner_id) mappedData.OwnerID = contactData.owner_id;

            // Fechas
            if (contactData.birthday) mappedData.Birthday = contactData.birthday;
            if (contactData.anniversary) mappedData.Anniversary = contactData.anniversary;

            // Compañía
            if (contactData.company && contactData.company.company_name) {
                mappedData.Company = contactData.company.company_name;
                if (contactData.company.id) mappedData.CompanyID = contactData.company.id;
            }

            // Emails
            if (contactData.email_addresses && contactData.email_addresses.length > 0) {
                contactData.email_addresses.forEach(emailObj => {
                    switch (emailObj.field) {
                        case 'EMAIL1':
                            mappedData.Email = emailObj.email;
                            break;
                        case 'EMAIL2':
                            mappedData.EmailAddress2 = emailObj.email;
                            break;
                        case 'EMAIL3':
                            mappedData.EmailAddress3 = emailObj.email;
                            break;
                        default:
                            console.log('default')
                            break
                    }
                });
            }

            // Teléfonos
            if (contactData.phone_numbers && contactData.phone_numbers.length > 0) {
                contactData.phone_numbers.forEach(phoneObj => {
                    const phoneField = phoneObj.field;
                    // Mapear tipos de teléfono directamente
                    const phoneTypeMapping = {
                        'HOME': 'Home',
                        'WORK': 'Work',
                        'MOBILE': 'Mobile',
                        'OTHER': 'Other'
                    };
                    const phoneType = phoneTypeMapping[phoneObj.type] || 'Other';

                    switch (phoneField) {
                        case 'PHONE1':
                            mappedData.Phone1 = phoneObj.number;
                            if (phoneObj.extension) mappedData.Phone1Ext = phoneObj.extension;
                            mappedData.Phone1Type = phoneType;
                            break;
                        case 'PHONE2':
                            mappedData.Phone2 = phoneObj.number;
                            if (phoneObj.extension) mappedData.Phone2Ext = phoneObj.extension;
                            mappedData.Phone2Type = phoneType;
                            break;
                        case 'PHONE3':
                            mappedData.Phone3 = phoneObj.number;
                            if (phoneObj.extension) mappedData.Phone3Ext = phoneObj.extension;
                            mappedData.Phone3Type = phoneType;
                            break;
                        case 'PHONE4':
                            mappedData.Phone4 = phoneObj.number;
                            if (phoneObj.extension) mappedData.Phone4Ext = phoneObj.extension;
                            mappedData.Phone4Type = phoneType;
                            break;
                        case 'PHONE5':
                            mappedData.Phone5 = phoneObj.number;
                            if (phoneObj.extension) mappedData.Phone5Ext = phoneObj.extension;
                            mappedData.Phone5Type = phoneType;
                            break;
                        default:
                            console.log('default')
                            break
                    }
                });
            }

            // Direcciones
            if (contactData.addresses && contactData.addresses.length > 0) {
                const address = contactData.addresses[0]; // Tomamos la primera dirección

                if (address.field === 'BILLING') {
                    mappedData.StreetAddress1 = address.line1;
                    mappedData.StreetAddress2 = address.line2;
                    mappedData.City = address.locality;
                    mappedData.State = address.region;
                    mappedData.PostalCode = address.postal_code;
                    mappedData.Country = address.country_code;
                    if (address.zip_four) mappedData.ZipFour1 = address.zip_four;
                }

                // Si hay múltiples direcciones, mapear a Address2 y Address3
                if (contactData.addresses.length > 1) {
                    const address2 = contactData.addresses[1];
                    mappedData.Address2Street1 = address2.line1;
                    mappedData.Address2Street2 = address2.line2;
                    mappedData.City2 = address2.locality;
                    mappedData.State2 = address2.region;
                    mappedData.PostalCode2 = address2.postal_code;
                    mappedData.Country2 = address2.country_code;
                    mappedData.Address2Type = address2.field;
                    if (address2.zip_four) mappedData.ZipFour2 = address2.zip_four;
                }

                if (contactData.addresses.length > 2) {
                    const address3 = contactData.addresses[2];
                    mappedData.Address3Street1 = address3.line1;
                    mappedData.Address3Street2 = address3.line2;
                    mappedData.City3 = address3.locality;
                    mappedData.State3 = address3.region;
                    mappedData.PostalCode3 = address3.postal_code;
                    mappedData.Country3 = address3.country_code;
                    mappedData.Address3Type = address3.field;
                    if (address3.zip_four) mappedData.ZipFour3 = address3.zip_four;
                }
            }

            const result = await this.xmlRpcCall('ContactService.update', [
                contactId,
                mappedData
            ]);

            return {
                success: true,
                result: result,
                mappedData: mappedData // Para debugging
            };

        } catch (error) {
            const errorInfo = handleError(error, 'updateContact');
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    async mergeContact(contactId, duplicateContactId) {
        try {
            // console.log('1 - ', contactId)
            // console.log('2 - ', duplicateContactId)

            const result = await this.xmlRpcCall('ContactService.merge',
                [
                    contactId,
                    duplicateContactId
                ]
            )
            return { sucess: true, result }
        } catch (error) {
            const errorInfo = handleError(error, 'updateContact');
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    async getLinkedContacts(contactId) {
        try {

            const result = await this.xmlRpcCall('ContactService.listLinkedContacts',
                [
                    contactId
                ]
            )
            // console.log('conmt', result)
            return { sucess: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'getLinkedContacts');
            return {
                success: false,
                error: errorInfo
            };

        }



    }

    async linkContacts(contactId, contactId2) {
        try {
            // console.log('ga', contactId)
            // console.log('a', contactId2)
            const result = await this.xmlRpcCall('ContactService.linkContacts',
                [
                    contactId,
                    contactId2,
                    2
                ]
            )

            return { sucess: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'link contacts');
            return {
                success: false,
                error: errorInfo
            };

        }



    }

    async unlinkContacts(contactId, contactId2) {
        try {
            // console.log('ga', contactId)
            // console.log('a', contactId2)
            const result = await this.xmlRpcCall('ContactService.unlinkContacts',
                [
                    contactId,
                    contactId2,
                    2
                ]
            )

            return { sucess: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'link contacts');
            return {
                success: false,
                error: errorInfo
            };

        }



    }

    async getUsers(queryParams) {
        try {
            const result = await this.xmlRpcCall('DataService.query', [
                'User',
                100,
                0,
                {

                },
                ['Id', 'FirstName', 'MiddleName', 'LastName', 'Email']

            ])
            const users = result.map((item) => ({

                id: item.Id,
                given_name: item.FirstName,
                middle_name: item.MiddleName,
                family_name: item.LastName,
                email_address: item.Email

            }))
            // console.log('h', result)
            return {
                success: true,
                users: users,
                count: users.length
            };
        } catch (error) {
            const errorInfo = handleError(error, 'link contacts');
            return {
                success: false,
                error: errorInfo
            };
        }
    }
    async getNotes(queryParams) {
        try {

            const result = await this.xmlRpcCall('DataService.query', [
                'ContactAction',
                queryParams.limit || 100,
                queryParams.page || 0,
                {
                    ObjectType: 'Note'
                },
                ['Id', 'ActionDescription', 'CreationNotes', 'ContactId', 'UserID'
                    , 'LastUpdatedBy', 'LastUpdated', 'CreationDate', 'ActionType']
            ])
            const notes = result.map((item) => ({

                id: item.Id,
                title: item.ActionDescription,
                body: item.CreationNotes,
                type: item.ActionType,
                contact_id: item.ContactId,
                user_id: item.UserID,
                last_updated_by: {
                    user_id: item.UserID,
                    given_name: item.LastUpdatedBy
                },
                date_created: formatToISO(item.CreationDate),
                last_updated: formatToISO(item.LastUpdated)
            }))
            // console.log('notes', result)
            return {
                success: true,
                notes: notes,
                count: notes.length
            };



        } catch (error) {
            const errorInfo = handleError(error, 'getNotes');
            return { success: false, error: errorInfo };
        }
    }

    async createNote(noteData) {
        try {

            noteData = cleanParams({
                ActionDescription: noteData.title,
                ActionType: noteData.type,
                CreationNotes: noteData.body,
                UserID: noteData.user_id,
                ContactId: noteData.contact_id
            })

            const result = await this.xmlRpcCall('DataService.add', [
                'ContactAction',
                noteData
            ])

            return {
                sucess: true,
                result
            }
        } catch (error) {
            const errorInfo = handleError(error, 'createNote');
            return { success: false, error: errorInfo };
        }
    }

    async updateNote(noteId, noteData) {
        try {

            noteData = cleanParams({
                ActionDescription: noteData.title,
                ActionType: noteData.type,
                CreationNotes: noteData.body,
                UserID: noteData.user_id,
                ContactId: noteData.contact_id
            })


            const result = await this.xmlRpcCall('DataService.update', [
                'ContactAction',
                noteId,
                noteData
            ])

            return {
                sucess: true,
                result
            }
        } catch (error) {
            const errorInfo = handleError(error, 'createNote');
            return { success: false, error: errorInfo };
        }
    }

    async deleteNote(noteId) {
        try {


            await this.xmlRpcCall('DataService.delete', [
                'ContactAction',
                noteId
            ])

            return {
                sucess: true
            }
        } catch (error) {
            const errorInfo = handleError(error, 'createNote');
            return { success: false, error: errorInfo };
        }
    }

    async getTasks(queryParams) {
        try {

            const result = await this.xmlRpcCall('DataService.query', [
                'ContactAction',
                queryParams.limit || 100,
                queryParams.page || 0,
                {
                    ObjectType: 'Task'
                },
                ['Id', 'ActionDescription', 'CreationNotes', 'ContactId', 'UserID'
                    , 'LastUpdatedBy', 'LastUpdated', 'CreationDate', 'ActionType', 'Priority',
                    'CompletionDate']
            ])
            const tasks = result.map((item) => ({

                id: item.Id,
                title: item.ActionDescription,
                description: item.CreationNotes,
                type: item.ActionType,
                contact: {
                    first_name: item.ContactId
                },
                contact_id: item.ContactId,
                user_id: item.UserID,
                last_updated_by: {
                    user_id: item.UserID,
                    given_name: item.LastUpdatedBy
                },
                creation_date: formatToISO(item.CreationDate),
                modification_date: formatToISO(item.LastUpdated),
                priority: item.Priority,
                completion_date: formatToISO(item?.CompletionDate)
            }))
            // console.log('tasks', result)
            return {
                success: true,
                tasks: tasks,
                count: tasks.length
            };



        } catch (error) {
            const errorInfo = handleError(error, 'getTasks');
            return { success: false, error: errorInfo };
        }
    }

    async createTask(taskData) {
        try {

            taskData = cleanParams({
                ActionDescription: taskData.title,
                ActionType: 'Task',
                CreationNotes: taskData.description,
                UserID: taskData.user_id,
                ContactId: taskData.contact_id,
                ObjectType: 'Task',
                IsAppointment: 1
            })

            const result = await this.xmlRpcCall('DataService.add', [
                'ContactAction',
                taskData
            ])

            return {
                sucess: true,
                result
            }
        } catch (error) {
            const errorInfo = handleError(error, 'createTask');
            return { success: false, error: errorInfo };
        }
    }
    ///////////////////EMAILS ENDPOINTS-------------------------------------------------------------
    async optInEmail(email, reason) {
        try {
            const result = await this.xmlRpcCall('APIEmailService.optIn', [
                email,
                reason
            ])
            // console.log(result)
            return { success: true }

        } catch (error) {
            const errorInfo = handleError(error, 'opt in email');
            return { success: false, error: errorInfo };
        }
    }

    async optOutEmail(email, reason) {
        try {
            await this.xmlRpcCall('APIEmailService.optOut', [
                email,
                reason
            ])

            return { success: true }
        } catch (error) {
            const errorInfo = handleError(error, 'opt out email');
            return { success: false, error: errorInfo };
        }
    }

    async getOptInStatus(email) {
        try {
            const result = await this.xmlRpcCall('APIEmailService.getOptStatus', [email])
            return { success: true, result }
        } catch (error) {
            const errorInfo = handleError(error, 'opt in status email');
            return { success: false, error: errorInfo };
        }
    }

    async sendEmail(emailData) {
        try {
            // console.log(emailData)
            const result = await this.xmlRpcCall('APIEmailService.sendEmail', [
                emailData.contacts,
                emailData.from_address,
                '~Contact.Email~',
                emailData.cc_addresses,
                emailData.bcc_addresses,
                'Multipart', //Can be HTML, Text
                emailData.subject,
                emailData.html_content,
                emailData.plain_content

            ])
            return { success: true, result }
        } catch (error) {
            const errorInfo = handleError(error, 'send email');
            return { success: false, error: errorInfo };
        }
    }
    async getEmailTemplate(templateId) {
        try {

            const result = await this.xmlRpcCall('APIEmailService.getEmailTemplate', [
                templateId
            ])
            // console.log('template', result)
            return { sucess: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'get Email Template');
            return { success: false, error: errorInfo };
        }
    }
    async createEmailTemplate(templateData) {
        try {
            // console.log('templatedata ', templateData)
            const result = await this.xmlRpcCall('APIEmailService.addEmailTemplate', [
                templateData.title,
                templateData.categories,
                templateData.fromAddress,
                templateData.toAddress,
                templateData.ccAddresses,
                templateData.bccAddresses,
                templateData.subject,
                templateData.textBody,
                templateData.htmlBody,
                templateData.contentType,
                templateData.mergeContext

            ])
            // console.log('template', result)
            return { sucess: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'get Email Template');
            return { success: false, error: errorInfo };
        }
    }

    async updateEmailTemplate(templateData) {
        try {
            // console.log('templatedata ', templateData)
            const result = await this.xmlRpcCall('APIEmailService.updateEmailTemplate', [
                templateData.templateId,
                templateData.title,
                templateData.categories,
                templateData.fromAddress,
                templateData.toAddress,
                templateData.ccAddresses,
                templateData.bccAddresses,
                templateData.subject,
                templateData.textBody,
                templateData.htmlBody,
                templateData.contentType,
                templateData.mergeContext

            ])
            // console.log('template', result)
            return { sucess: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'get Email Template');
            return { success: false, error: errorInfo };
        }
    }

    async sendEmailTemplate(contactList, templateId) {
        try {
            // console.log('templatedata ', con)
            const result = await this.xmlRpcCall('APIEmailService.sendEmail', [
                contactList,
                templateId
            ])
            console.log('template', result)
            return { sucess: true, result }

        } catch (error) {
            const errorInfo = handleError(error, 'get Email Template');
            return { success: false, error: errorInfo };
        }
    }



    //FILES ENDPOINTS-------------------------------------------------------------**********/
    async getFiles(queryParams) {
        try {
            // queryParams.query = cleanParams(queryParams.query)
            // console.log('he', queryParams)
            const result = await this.xmlRpcCall('DataService.query', [
                'FileBox',      // table
                queryParams.limit,          // limit
                queryParams.offset,           // page
                {},      // queryData
                ['ContactId', 'FileName', 'Extension', 'FileSize', 'Public', 'Id'],          // selectedFields
                // queryParams.OrderBy,//Field to order by
                // true//ASCENDING OR DESCENDING (true = asc)
            ]);
            // console.log(result)
            return {
                success: true, files: result.map(f => ({
                    id: f.Id,
                    file_name: f.FileName,
                    file_size: f.FileSize,
                    public: f.Public,
                    contact_id: f.ContactId
                }))
            };
        } catch (error) {
            console.error('Error in getFiles:', error.message);
            const errorInfo = handleError(error, 'Get files');
            return { success: false, error: errorInfo };
        }
    }

    async getFileById(fileId) {
        try {
            // queryParams.query = cleanParams(queryParams.query)
            const resultFile = await this.xmlRpcCall('FileService.getFile', [
                fileId
            ]); //this returns the fileitself

            const resultDownloadUrl = await this.xmlRpcCall('FileService.getDownloadUrl', [
                fileId
            ]);
            // console.log(resultFile)
            return {
                success: true,
                file: resultFile,
                download_url: resultDownloadUrl
            };
        } catch (error) {
            console.error('Error in getFileById:', error.message);
            const errorInfo = handleError(error, 'Get file by id');
            return { success: false, error: errorInfo };
        }
    }

    async renameFile(fileId, newName) {
        try {
            // queryParams.query = cleanParams(queryParams.query)
            const resultFile = await this.xmlRpcCall('FileService.renameFile', [
                fileId,
                newName
            ]); //this returns the fileitself

            return {
                success: true,
                result: resultFile,
            };
        } catch (error) {
            console.error('Error in getFileById:', error.message);
            const errorInfo = handleError(error, 'rename file');
            return { success: false, error: errorInfo };
        }
    }

    async replaceFile(fileId, fileData) {
        try {
            // queryParams.query = cleanParams(queryParams.query)
            const resultFile = await this.xmlRpcCall('FileService.replaceFile', [
                fileId,
                fileData
            ]); //this returns the fileitself

            return {
                success: true,
                result: resultFile,
            };
        } catch (error) {
            console.error('Error in getFileById:', error.message);
            const errorInfo = handleError(error, 'rename file');
            return { success: false, error: errorInfo };
        }
    }

    async uploadFile(fileData) {
        try {

            // console.log('file', fileData)
            // queryParams.query = cleanParams(queryParams.query)
            const resultFile = await this.xmlRpcCall('FileService.uploadFile', [
                fileData.contact_id,
                fileData.file_name,
                fileData.file
            ]);
            // console.log('uploadfile', resultFile)
            return {
                success: true,
                result: resultFile,
            };
        } catch (error) {
            console.error('Error in getFileById:', error.message);
            const errorInfo = handleError(error, 'rename file');
            return { success: false, error: errorInfo };
        }
    }

    async getProducts(queryParams) {
        try {
            // Obtener productos
            const result = await this.xmlRpcCall('DataService.query', [
                'Product',
                queryParams.limit || 100,
                0,
                {},
                ['Id', 'Sku', 'Status', 'ProductName', 'Description', 'ProductPrice', 'ShortDescription']
            ]);

            // Cache para categorías para evitar consultas duplicadas
            const categoryCache = {};

            // Mapear productos con sus categorías
            const products = await Promise.all(result.map(async (item) => {
                try {
                    // Obtener asignaciones de categoría para este producto específico
                    const categoryAssignments = await this.xmlRpcCall('DataService.query', [
                        'ProductCategoryAssign',
                        100,
                        0,
                        {
                            ProductId: item.Id
                        },
                        ['ProductCategoryId', 'ProductId']
                    ]);

                    const categories = [];

                    // Para cada asignación de categoría, obtener los detalles de la categoría
                    for (const assignment of categoryAssignments) {
                        const categoryId = assignment.ProductCategoryId;

                        // Usar cache para evitar consultas duplicadas de la misma categoría
                        if (!categoryCache[categoryId]) {
                            try {
                                const categoryResult = await this.xmlRpcCall('DataService.query', [
                                    'ProductCategory',
                                    1,
                                    0,
                                    {
                                        Id: categoryId
                                    },
                                    ['Id', 'CategoryDisplayName']
                                ]);

                                if (categoryResult && categoryResult.length > 0) {
                                    categoryCache[categoryId] = categoryResult[0];
                                }
                            } catch (categoryError) {
                                console.error(`Error fetching category ${categoryId}:`, categoryError);
                                categoryCache[categoryId] = null;
                            }
                        }

                        // Agregar categoría si existe en cache y no es null
                        if (categoryCache[categoryId]) {
                            categories.push({
                                id: categoryCache[categoryId].Id,
                                name: categoryCache[categoryId].CategoryDisplayName
                            });
                        }
                    }

                    return {
                        "id": item.Id,
                        "sku": item.Sku,
                        "status": item.Status,
                        "product_name": item.ProductName,
                        "product_desc": item.Description,
                        "product_price": item.ProductPrice,
                        "product_short_desc": item.ShortDescription,
                        "categories": categories
                    };
                } catch (productError) {
                    console.error(`Error processing product ${item.Id}:`, productError);
                    // Retornar producto sin categorías en caso de error
                    return {
                        "id": item.Id,
                        "sku": item.Sku,
                        "status": item.Status,
                        "product_name": item.ProductName,
                        "product_desc": item.Description,
                        "product_price": item.ProductPrice,
                        "product_short_desc": item.ShortDescription,
                        "categories": []
                    };
                }
            }));

            return {
                success: true,
                products: products,
                count: products.length
            };
        } catch (error) {
            const errorInfo = handleError(error, 'get products'); // Corregir mensaje de error
            return {
                success: false,
                error: errorInfo
            };
        }
    }


    async getProductById(productId) {
        try {
            // Obtener el producto específico por ID
            const result = await this.xmlRpcCall('DataService.query', [
                'Product',
                1,
                0,
                {
                    Id: productId
                },
                ['Id', 'Sku', 'Status', 'ProductName', 'Description', 'ProductPrice', 'ShortDescription', 'LargeImage']
            ]);

            if (!result || result.length === 0) {
                return {
                    success: false,
                    error: 'Product not found'
                };
            }

            const product = result[0];

            // Obtener asignaciones de categoría para este producto
            const categoryAssignments = await this.xmlRpcCall('DataService.query', [
                'ProductCategoryAssign',
                100,
                0,
                {
                    ProductId: product.Id
                },
                ['ProductCategoryId', 'ProductId']
            ]);

            const categories = [];

            // Para cada asignación de categoría, obtener los detalles de la categoría
            for (const assignment of categoryAssignments) {
                try {
                    const categoryResult = await this.xmlRpcCall('DataService.query', [
                        'ProductCategory',
                        1,
                        0,
                        {
                            Id: assignment.ProductCategoryId
                        },
                        ['Id', 'CategoryDisplayName']
                    ]);

                    if (categoryResult && categoryResult.length > 0) {
                        categories.push({
                            id: categoryResult[0].Id,
                            name: categoryResult[0].CategoryDisplayName
                        });
                    }
                } catch (categoryError) {
                    console.error(`Error fetching category ${assignment.ProductCategoryId}:`, categoryError);
                }
            }

            // Obtener subscription plans para este producto
            const subscriptionPlans = [];
            try {
                const subscriptionResult = await this.xmlRpcCall('DataService.query', [
                    'SubscriptionPlan',
                    100,
                    0,
                    {
                        ProductId: product.Id
                    },
                    ['Id', 'Active', 'Cycle', 'Frequency', 'NumberOfCycles', 'PlanPrice']
                ]);

                // Mapear subscription plans al formato esperado
                subscriptionResult.forEach((plan, index) => {
                    // Convertir cycle string a número según documentación
                    const getCycleType = (cycle) => {
                        switch (cycle) {
                            case '1': return 'YEAR';
                            case '2': return 'MONTH';
                            case '3': return 'WEEK';
                            case '6': return 'DAY';
                            default: return 'MONTH'; // default
                        }
                    };

                    subscriptionPlans.push({
                        "id": plan.Id,
                        "frequency": plan.Frequency,
                        "active": plan.Active,
                        "cycle_type": getCycleType(plan.Cycle),
                        "plan_price": plan.PlanPrice,
                        "subscription_plan_name": null, // No disponible en la tabla
                        "number_of_cycles": plan.NumberOfCycles,
                        "subscription_plan_index": index + 1,
                        "cycle": 0 // No está claro qué representa este campo
                    });
                });
            } catch (subscriptionError) {
                console.error(`Error fetching subscription plans for product ${product.Id}:`, subscriptionError);
            }

            // Mapear a formato esperado por frontend (solo campos disponibles)
            const productData = {
                "id": product.Id,
                "sku": product.Sku,
                "active": product.Status === 1, // Status 1 = Active, 0 = Inactive
                "product_name": product.ProductName,
                "sub_category_id": 0, // No disponible, valor por defecto
                "product_desc": product.Description,
                "product_price": product.ProductPrice,
                "product_short_desc": product.ShortDescription,
                // "subscription_only": subscriptionPlans.length > 0 && product.ProductPrice === 0, // Inferir si es solo suscripción
                "product_options": [], // No disponible en la tabla Product
                "subscription_plans": subscriptionPlans,
                "status": product.Status,
                "categories": categories,
                large_image: product.LargeImage
            };

            return productData

        } catch (error) {
            const errorInfo = handleError(error, 'get product by id');
            return {
                success: false,
                error: errorInfo
            };
        }
    }


    async updateProduct(productId, productData) {
        try {
            // Validar que el producto existe
            const existingProduct = await this.getProductById(productId);
            if (!existingProduct || existingProduct.success === false) {
                return {
                    success: false,
                    error: 'Product not found'
                };
            }

            // Actualizar el producto principal
            const productUpdateData = {
                Id: productId,
                Sku: productData.sku,
                Status: productData.active ? 1 : 0, // Convertir boolean a número
                ProductName: productData.product_name,
                Description: productData.product_desc,
                ProductPrice: productData.product_price,
                ShortDescription: productData.product_short_desc,
                // LargeImage: productData.large_image
            };

            const productUpdateResult = await this.xmlRpcCall('DataService.update', [
                'Product',
                productId,
                productUpdateData
            ]);

            if (!productUpdateResult) {
                return {
                    success: false,
                    error: 'Failed to update product'
                };
            }

            // Retornar el producto actualizado
            const updatedProduct = await this.getProductById(productId);
            return {
                success: true,
                data: updatedProduct
            };

        } catch (error) {
            const errorInfo = handleError(error, 'update product');
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    async uploadProductImage(productId, imageData) {
        try {
            const result = await this.xmlRpcCall('DataService.update',
                [
                    'Product',
                    productId,
                    {
                        LargeImage: imageData
                    }
                ]
            )
            // console.log('result ', result)
            return { sucess: true, result }
        } catch (error) {
            const errorInfo = handleError(error, 'update product');
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    async createProductSubscription(productId, planData) {
        try {
            // Función para convertir cycle_type a número según la documentación
            const getCycleNumber = (cycleType) => {
                switch (cycleType) {
                    case 'YEAR': return 1;
                    case 'MONTH': return 2;
                    case 'WEEK': return 3;
                    case 'DAY': return 6;
                    default: return 2; // default MONTH
                }
            };

            // Preparar los datos para el subscription plan
            const subscriptionPlanData = {
                ProductId: productId,
                Active: planData.active,
                Cycle: getCycleNumber(planData.cycle_type),
                Frequency: planData.frequency,
                NumberOfCycles: planData.number_of_cycles,
                PlanPrice: planData.plan_price,
                PreAuthorizeAmount: 0, // Valor por defecto si no se proporciona
                Prorate: false // Valor por defecto si no se proporciona
            };

            // Crear el subscription plan
            const result = await this.xmlRpcCall('DataService.add', [
                'SubscriptionPlan',
                subscriptionPlanData
            ]);



            return {
                success: true,
                result
            };

        } catch (error) {
            const errorInfo = handleError(error, 'create subscription plan');
            return {
                success: false,
                error: errorInfo
            };
        }
    }


    async updateProductSubscription(planId, planData) {
        try {
            // Función para convertir cycle_type a número según la documentación
            const getCycleNumber = (cycleType) => {
                switch (cycleType) {
                    case 'YEAR': return 1;
                    case 'MONTH': return 2;
                    case 'WEEK': return 3;
                    case 'DAY': return 6;
                    default: return 2; // default MONTH
                }
            };

            // Preparar los datos para el subscription plan
            const subscriptionPlanData = {
                Active: planData.active,
                Cycle: getCycleNumber(planData.cycle_type),
                Frequency: planData.frequency,
                NumberOfCycles: planData.number_of_cycles,
                PlanPrice: planData.plan_price,
                PreAuthorizeAmount: 0, // Valor por defecto si no se proporciona
                Prorate: false // Valor por defecto si no se proporciona
            };

            // Crear el subscription plan
            const result = await this.xmlRpcCall('DataService.update', [
                'SubscriptionPlan',
                planId,
                subscriptionPlanData
            ]);



            return {
                success: true,
                result
            };

        } catch (error) {
            const errorInfo = handleError(error, 'create subscription plan');
            return {
                success: false,
                error: errorInfo
            };
        }

    }

    async getProductInventory(productId) {
        try {
            const result = await this.xmlRpcCall('ProductService.getInventory', [productId])
            // console.log('inv', result)
            return result
        } catch (error) {
            const errorInfo = handleError(error, 'create subscription plan');
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    async incrementProductInventory(productId) {
        try {
            const result = await this.xmlRpcCall('ProductService.incrementInventory', [productId])
            // console.log('inv', result)
            return result
        } catch (error) {
            const errorInfo = handleError(error, 'incrementInventory');
            return {
                success: false,
                error: errorInfo
            };
        }
    }
    async decrementProductInventory(productId) {
        try {
            const result = await this.xmlRpcCall('ProductService.decrementInventory', [productId])
            // console.log('inv', result)
            return result
        } catch (error) {
            const errorInfo = handleError(error, 'incrementInventory');
            return {
                success: false,
                error: errorInfo
            };
        }
    }

        async adjustProductInventory(action = 'increase',productId,quantity) {
        try {

            if (action === 'increase') {
                action ='ProductService.increaseInventory'
            }else if (action === 'decrease') {
               action ='ProductService.decreaseInventory'
            }
            const result = await this.xmlRpcCall(action, [productId,quantity])
            // console.log('inv', result)
            return result
        } catch (error) {
            const errorInfo = handleError(error, 'incrementInventory');
            return {
                success: false,
                error: errorInfo
            };
        }
    }
}


const keapAPI = new KeapAPI();
export default keapAPI;