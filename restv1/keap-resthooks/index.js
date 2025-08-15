const functions = require('@google-cloud/functions-framework');
const { Pool } = require('pg');

// Pool de conexiones lazy loading
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      max: 1, // Solo 1 conexión para Functions
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 60000,
    });
  }
  return pool;
}

// Registrar la función keapHook
functions.http('keapHook', async (req, res) => {
  console.log("Webhook received:", req.body);

  const hookSecret = req.header("X-Hook-Secret");

  if (hookSecret) {
    res.set("X-Hook-Secret", hookSecret);
    return res.status(200).send("OK - verification");
  }

  try {
    console.log("Processing webhook data:", req.body);
    
    const { event_key, object_type, object_keys, verification_key } = req.body;

    // Si es webhook de verificación (solo tiene verification_key)
    if (verification_key && !object_keys) {
      console.log(`Verification webhook received: ${event_key} with key: ${verification_key}`);
      return res.status(200).send("OK - verification webhook");
    }

    // Si es webhook real (debe tener object_keys)
    if (!event_key || !object_type || !object_keys || !Array.isArray(object_keys)) {
      console.error("Invalid webhook data - missing required fields:", req.body);
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
        INSERT INTO public.webhook_events 
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
//testing ci/cd 22