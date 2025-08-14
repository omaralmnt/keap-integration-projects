const express = require('express');
const { Pool } = require('pg');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Pool de conexiones lazy loading
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST, // Ya tienes la ruta correcta en las env vars
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Health check endpoint (OBLIGATORIO para Cloud Run)
app.get('/', (req, res) => {
  res.status(200).send('Keap Webhook Service is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Tu función keapHook convertida a endpoint
app.post('/webhook', async (req, res) => {
  console.log("Webhook received:", req.body);

  const hookSecret = req.header("X-Hook-Secret");

  if (hookSecret) {
    res.set("X-Hook-Secret", hookSecret);
    return res.status(200).send("OK - verification");
  }

  try {
    const { event_key, object_type, object_keys } = req.body;

    if (!event_key || !object_type || !object_keys || !Array.isArray(object_keys)) {
      console.error("Invalid webhook data:", req.body);
      return res.status(400).send("Incomplete webhook data");
    }

    const dbPool = getPool();

    for (const objectData of object_keys) {
      const { apiUrl, id, timestamp } = objectData;
      
      if (!apiUrl || !id || !timestamp) {
        console.error("Invalid object:", objectData);
        continue; 
      }

      const query = `
        INSERT INTO public.webhook_eventos 
        (event_key, object_type, api_url, object_id, timestamp, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `;
      
      const values = [
        event_key,
        object_type,
        apiUrl,
        id,
        timestamp
      ];

      await dbPool.query(query, values);
      console.log(`Event inserted: ${event_key} - ${object_type} - ID: ${id}`);
    }

    res.status(200).send("OK");

  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal server error");
  }
});

// Compatibilidad: también acepta POST en la raíz para mantener URLs existentes
app.post('/', async (req, res) => {
  // Redirigir al endpoint principal
  return app._router.handle(Object.assign(req, { url: '/webhook', originalUrl: '/webhook' }), res);
});

// Puerto requerido por Cloud Run
const port = process.env.PORT || 8080;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    if (pool) {
      pool.end();
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    if (pool) {
      pool.end();
    }
    process.exit(0);
  });
});