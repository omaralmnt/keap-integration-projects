// routes/keapApiRouter.js
import express from 'express';
import axios from 'axios';
import { getAccessToken, refreshToken } from '../controllers/keapAuthController.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// URL base de la API de Keap desde variable de entorno
const KEAP_API_BASE_URL = process.env.KEAP_API_BASE_URL;

// Validar que la variable de entorno esté definida
if (!KEAP_API_BASE_URL) {
  console.error('❌ KEAP_API_BASE_URL no está definida en las variables de entorno');
}

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

// Proxy para todas las demás rutas
router.use(async (req, res) => {
  try {
    // Construir la URL completa para Keap API
    const keapPath = req.originalUrl.replace('/api/keap', '');
    const keapUrl = `${KEAP_API_BASE_URL}${keapPath}`;
    
    // Preparar headers
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

    // Hacer la solicitud a Keap API
    const response = await axios(axiosConfig);

    // Devolver la respuesta
    res.status(response.status).send(response.data);

  } catch (error) {
    console.error('Error en proxy:', error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error en proxy' });
    }
  }
});

export default router;