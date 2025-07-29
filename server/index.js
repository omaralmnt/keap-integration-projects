// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import keapAuthRouter from './routes/keapAuth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', keapAuthRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
