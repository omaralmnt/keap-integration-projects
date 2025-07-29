// routes/keapAuth.js
import express from 'express'
import { getAccessToken, refreshToken } from '../controllers/keapAuthController.js';

const router = express.Router();

router.post('/keap', getAccessToken);
router.post('/keap/refresh', refreshToken )

export default router