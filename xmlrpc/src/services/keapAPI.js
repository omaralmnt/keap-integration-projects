import { XmlRpcMessage, XmlRpcResponse } from 'xmlrpc-parser';
import api from './httpClient'; // Tu cliente HTTP existente
import { data } from 'react-router-dom';

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
            const result = await this.xmlRpcCall('DataService.query', [
                'Contact',      // table
                queryParams.limit,          // limit
                queryParams.page,           // page
                queryParams.query,      // queryData
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
                ['Id', 'FirstName', 'MiddleName', 'LastName','JobTitle','ContactType','SpouseName','Website','Birthday',
                 'Anniversary','Company','LeadSource'
                ]

            ])
            console.log(result)
            return {
                    given_name:result.FirstName,
                    middle_name:result.MiddleName,
                    family_name:result.LastName,
                    id:result.Id,
                    job_title:result.JobTitle,
                    contact_type:result.ContactType,
                    spouse_name:result.SpouseName,
                    website:result.Website,
                    anniversary:result.Anniversary,
                    company:result.Company,
                    source_type:result.LeadSource





                
            }
        } catch (error) {
            const errorInfo = handleError(error, 'getContactById');
            return { success: false, error: errorInfo };
        }
    }
}

const keapAPI = new KeapAPI();
export default keapAPI;