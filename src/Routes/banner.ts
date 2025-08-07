// routes/profileRoutes.ts
import express from 'express';
import path from 'path';
import { bannerController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();

router.get('/', bannerController.getAllBanner);
router.get('/:bannerId', bannerController.getBannerById);
    
router.use(adminJWT)
router.post('/add', bannerController.addBanner);
router.post('/edit', bannerController.updateBanner);
router.delete('/delete/:bannerId', bannerController.deleteBannerById);
export default router;