"use strict"
import { Router } from 'express'
import settingRouter from './setting'
import productRouter from './product'
import adminRouter from './admin'
import usersRouter from './users'
import { uploadRoutes } from './upload'
import InquiryRouter from './Inquiries'
import orderRouter from './order'
import { downloadContact } from './contact'
import { adminJWT } from '../helper/jwt'

const router = Router()

router.use('/auth', adminRouter);
router.use('/users', usersRouter);
router.use('/setting', settingRouter);
router.use('/product', productRouter);
router.use('/inquiry', InquiryRouter);
router.use('/order', orderRouter);
router.use('/contact', downloadContact);

router.use(adminJWT)
router.use('/upload', uploadRoutes)
export { router }