// index.js
import express from 'express';
// import cors from 'cors';
import dotenv from 'dotenv';
import keapRouter from './routes/keapApiRouter.js';

dotenv.config();

const app = express();

// CORS configurado correctamente
// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // INCLUIR PATCH
//   allowedHeaders: '*',
//   credentials: true
// }));

app.use(express.json());
app.use('/api/keap', keapRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});