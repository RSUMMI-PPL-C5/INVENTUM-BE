import { Router } from 'express';
import DivisiController from '../controllers/divisi.controller';
import verifyToken from '../middleware/verifyToken';

const router = Router();
const divisiController = new DivisiController();

router.post('/', verifyToken, divisiController.addDivisi);

export default router;