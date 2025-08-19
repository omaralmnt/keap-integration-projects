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
const handleError = (error) => {
    if (error.response) {
        console.log(error.response.status + ' - ' + error.response.data?.message);
    } else {
        console.log(error);
    }

    return {
        status: error.response?.status,
        message: error.response?.data?.message || error.message || 'Unknown error'
    };
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
        try {
            // Obtener access token
            const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}');
            const privateKey = tokens.access_token;

            if (!privateKey) {
                throw new Error('Access token requerido para XML-RPC');
            }

            // Agregar privateKey como primer parámetro
            const xmlRpcParams = [privateKey, ...params];
            
            // console.log('XML-RPC Call:', method, 'Params:', params);

            // Crear el mensaje XML-RPC usando xmlrpc-parser
            const xmlRpcMessage = new XmlRpcMessage(method, xmlRpcParams);
            const xmlPayload = xmlRpcMessage.xml();

            // console.log('XML Payload:', xmlPayload);

            // Enviar la petición usando tu cliente HTTP existente
            const response = await api.post(this.xmlrpcUrl, xmlPayload, {
                headers: {
                    'Content-Type': 'text/xml'
                }
            });

            // console.log('XML Response:', response.data);

            // CORRECCIÓN: Parsear la respuesta de manera más robusta
            let parsedResponse;
            
            try {
                // Opción 1: Verificar si XmlRpcResponse necesita ser instanciado diferente
                if (typeof XmlRpcResponse === 'function') {
                    parsedResponse = new XmlRpcResponse(response.data);
                } else {
                    // Algunas versiones pueden exportar directamente una función
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
                console.warn('Error parsing with xmlrpc-parser, using fallback:', parseError);
                return this.parseXmlRpcResponse(response.data);
            }

        } catch (error) {
            console.error('XML-RPC Error:', error);
            throw error;
        }
    }

    // Método fallback para parsear XML-RPC manualmente
    parseXmlRpcResponse(xmlString) {
        try {
            // Crear un parser DOM
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            
            // Verificar si es un fault
            const faultNode = xmlDoc.querySelector('fault');
            if (faultNode) {
                const faultCode = xmlDoc.querySelector('fault member[name="faultCode"] value')?.textContent;
                const faultString = xmlDoc.querySelector('fault member[name="faultString"] value')?.textContent;
                throw new Error(`XML-RPC Fault ${faultCode}: ${faultString}`);
            }
            
            // Parsear el valor de respuesta
            return this.parseXmlValue(xmlDoc.querySelector('params param value'));
            
        } catch (error) {
            console.error('Error parsing XML response:', error);
            throw new Error('Failed to parse XML-RPC response');
        }
    }

    // Método auxiliar para parsear valores XML-RPC
    parseXmlValue(valueNode) {
        if (!valueNode) return null;
        
        // Array
        const arrayNode = valueNode.querySelector('array data');
        if (arrayNode) {
            const values = arrayNode.querySelectorAll(':scope > value'); // Solo hijos directos
            return Array.from(values).map(v => this.parseXmlValue(v));
        }
        
        // Struct
        const structNode = valueNode.querySelector('struct');
        if (structNode) {
            const members = structNode.querySelectorAll(':scope > member'); // Solo hijos directos
            const obj = {};
            members.forEach(member => {
                const name = member.querySelector('name')?.textContent;
                const value = member.querySelector('value');
                if (name && value) {
                    obj[name] = this.parseXmlValue(value);
                }
            });
            return obj;
        }
        
        // String
        const stringNode = valueNode.querySelector('string');
        if (stringNode) {
            return stringNode.textContent;
        }
        
        // Integer
        const intNode = valueNode.querySelector('i4') || valueNode.querySelector('int');
        if (intNode) {
            return parseInt(intNode.textContent);
        }
        
        // Boolean
        const booleanNode = valueNode.querySelector('boolean');
        if (booleanNode) {
            return booleanNode.textContent === '1';
        }
        
        // Double
        const doubleNode = valueNode.querySelector('double');
        if (doubleNode) {
            return parseFloat(doubleNode.textContent);
        }
        
        // Si no hay tipo específico, verificar si hay contenido directo de texto
        const textContent = valueNode.textContent?.trim();
        if (textContent && !valueNode.querySelector('*')) {
            return textContent;
        }
        
        // Default: return as string si hay contenido
        return textContent || '';
    }

    // Test de conexión
    async ping() {
        try {
            const result = await this.xmlRpcCall('DataService.ping', []);
            return { success: true, data: result };
        } catch (error) {
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }

//XML FUNCTIONS------------------------------------------------------------------------------------------------------------------------------
    async getContacts(queryParams, fields = ['Id', 'FirstName', 'LastName', 'Email','Phone1','DateCreated']) {
        try {
            console.log('parametros',queryParams)
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
            
            return { success: true, contacts: result.map(c => ({
                id: c.Id,
                given_name: c.FirstName,
                family_name: c.LastName,
                email_addresses:[{email:c.Email}],
                phone_numbers:[{number:c.Phone1}],
                date_created: parseXmlRpcDate(c.DateCreated)
            })) };
        } catch (error) {
            console.error('Error in getContacts:', error);
            const errorInfo = handleError(error);
            return { success: false, error: errorInfo };
        }
    }


}

const keapAPI = new KeapAPI();
export default keapAPI;