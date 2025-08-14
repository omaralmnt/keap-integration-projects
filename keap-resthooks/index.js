const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,

});

exports.keapHook = async (req, res) => {
  console.log("Webhook received:", req.body);

  const hookSecret = req.header("X-Hook-Secret");

  if (hookSecret) {
    res.set("X-Hook-Secret", hookSecret);
    return res.status(200).send("OK - verification");
  }

  try {
    // console.log("Datos del webhook:", req.body);
    
    const { event_key, object_type, object_keys } = req.body;

    if (!event_key || !object_type || !object_keys || !Array.isArray(object_keys)) {
      console.error("invalid webhook data:", req.body);
      return res.status(400).send("Incomplete webhook data");
    }

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

      await pool.query(query, values);
      console.log(`Event inserted: ${event_key} - ${object_type} - ID: ${id}`);
    }

    res.status(200).send("OK");

  } catch (error) {
    console.error("Error processing rest hook:", error);
    res.status(500).send("Internal server error");
  }
};

process.on('SIGTERM', () => {
  pool.end();
});

process.on('SIGINT', () => {
  pool.end();
});