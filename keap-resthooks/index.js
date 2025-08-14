const { Pool } = require('pg');

// No crear el pool inmediatamente
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
      max: 1, // Solo 1 conexión para Cloud Functions
      idleTimeoutMillis: 0, // No timeout en Cloud Functions
      connectionTimeoutMillis: 60000,
    });
  }
  return pool;
}

exports.keapHook = async (req, res) => {
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

    // Obtener el pool solo cuando se necesite
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
};