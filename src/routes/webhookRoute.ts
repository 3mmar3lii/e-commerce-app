import express from 'express'
import { imageKitWebhook } from '../controllers/imageKitWebhookController';

const router = express.Router();



router.route("/imagekit").post(imageKitWebhook);

export default router;