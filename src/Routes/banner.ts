// routes/profileRoutes.ts
import express from 'express';
import path from 'path';
import { bannerController } from '../controllers';

const router = express.Router();

router.post('/add', bannerController.addBanner);
router.post('/update', bannerController.updateBanner);
router.get('/:BannerId', bannerController.getBannerById);
router.get('/', bannerController.getAllBanner);

router.delete('/delete/:BannerId', bannerController.deleteBannerById);

export default router;