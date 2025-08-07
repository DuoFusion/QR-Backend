// routes/profileRoutes.ts
import express from 'express';
import path from 'path';
import { settingController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();

router.get('/', settingController.getAllsetting);
router.get('/:settingId', settingController.getsettingById);
    
router.use(adminJWT)
router.post('/add', settingController.addsetting);
router.post('/edit', settingController.updatesetting);
router.delete('/delete/:settingId', settingController.deletesettingById);
export default router;