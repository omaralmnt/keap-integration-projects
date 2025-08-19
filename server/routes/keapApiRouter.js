// routes/keapApiRouter.js - VERSIÓN CORREGIDA
import express from 'express';
import axios from 'axios';
import { getAccessToken, refreshToken } from '../controllers/keapAuthController.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// URLs base de la API de Keap desde variables de entorno
const KEAP_API_BASE_URL = process.env.KEAP_API_BASE_URL;
const KEAP_XMLRPC_URL = process.env.KEAP_XMLRPC_URL;

// Validar que las variables de entorno estén definidas
if (!KEAP_API_BASE_URL) {
  console.error('❌ KEAP_API_BASE_URL no está definida en las variables de entorno');
}
if (!KEAP_XMLRPC_URL) {
  console.error('❌ KEAP_XMLRPC_URL no está definida en las variables de entorno');
}

// MIDDLEWARE PARA PARSEAR XML CORRECTAMENTE
router.use('/xmlrpc', express.text({ type: 'text/xml', limit: '10mb' }));

// Función para detectar si es una petición XML-RPC
const isXmlRpcRequest = (req) => {
  return req.originalUrl.includes('/xmlrpc') || 
         req.headers['content-type']?.includes('text/xml') ||
         (typeof req.body === 'string' && req.body.includes('<?xml'));
};

// Middleware que maneja CORS para todas las respuestas
router.use((req, res, next) => {
  // Headers CORS
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Max-Age': '0'
  });
  
  // Si es OPTIONS, responder inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Rutas de autenticación (manejan lógica específica)
router.post('/auth', getAccessToken);
router.post('/auth/refresh', refreshToken);

// Handler para peticiones REST
const handleRestRequest = async (req, res) => {
  // Construir la URL completa para Keap API
  const keapPath = req.originalUrl.replace('/api/keap', '');
  const keapUrl = `${KEAP_API_BASE_URL}${keapPath}`;
  
  // Preparar headers para REST
  const headers = {
    'Authorization': req.headers.authorization,
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'KeapProxy/1.0'
  };
  
  // Remover headers undefined
  Object.keys(headers).forEach(key => {
    if (headers[key] === undefined) {
      delete headers[key];
    }
  });
  
  // Configuración para axios
  const axiosConfig = {
    method: req.method,
    url: keapUrl,
    headers: headers,
    timeout: 30000,
  };

  // Agregar body si existe
  if (req.body && Object.keys(req.body).length > 0) {
    axiosConfig.data = req.body;
  }

  return await axios(axiosConfig);
};

// Handler para peticiones XML-RPC CORREGIDO
const handleXmlRpcRequest = async (req, res) => {
  console.log('🔧 XML-RPC Body type:', typeof req.body);
  console.log('🔧 XML-RPC Body length:', req.body?.length);
  console.log('🔧 XML-RPC Body preview:', req.body?.substring(0, 200));
  
  // Preparar headers para XML-RPC
  const headers = {
    'Content-Type': 'text/xml',
    'Accept': 'text/xml',
    'User-Agent': 'KeapProxy/1.0'
  };
  
  // Mantener Authorization header si existe
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
    console.log('🔧 Authorization header:', req.headers.authorization?.substring(0, 20) + '...');
  }
  
  console.log('🔧 Final headers:', headers);
  
  // Configuración para axios (XML-RPC siempre es POST)
  const axiosConfig = {
    method: 'POST',
    url: KEAP_XMLRPC_URL,
    headers: headers,
    data: req.body, // El XML viene como string del middleware express.text()
    timeout: 30000,
  };

  console.log('🔧 Sending to Keap URL:', KEAP_XMLRPC_URL);
  return await axios(axiosConfig);
};

// Proxy principal que maneja ambos tipos de peticiones
router.use(async (req, res) => {
  try {
    const isXmlRpc = isXmlRpcRequest(req);
    
    let response;
    
    if (isXmlRpc) {
      console.log('🔄 Procesando petición XML-RPC');
      response = await handleXmlRpcRequest(req, res);
    } else {
      console.log('🔄 Procesando petición REST');
      response = await handleRestRequest(req, res);
    }

    // Devolver la respuesta
    res.status(response.status).send(response.data);

  } catch (error) {
    console.error('❌ Error en proxy:', error.message);
    console.error('❌ Error details:', error.response?.data);

    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).json({ error: 'Error en proxy' });
    }
  }
});

export default router;