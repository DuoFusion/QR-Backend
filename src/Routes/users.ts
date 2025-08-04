// routes/profileRoutes.ts
import express from 'express';
import { usersController } from '../controllers';

const router = express.Router();

router.post('/add', usersController.add_user);
router.post('/edit', usersController.update_user);
router.delete('/delete/:userId', usersController.delete_user);

router.get('/:userId',usersController.getUserById);
router.get('/',usersController.get_all_users);
export default router;
