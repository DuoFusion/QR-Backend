// routes/profileRoutes.ts
import express from 'express';
import { adminController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();

router.post('/signUp', adminController.signUp);
router.post('/login', adminController.login);

router.post('/forgot_password', adminController.forgot_password);
router.post('/verify_otp', adminController.verify_otp);
router.post('/reset_password', adminController.reset_password);

router.use(adminJWT);
router.post('/change-password', adminController.change_password)

export default router;
