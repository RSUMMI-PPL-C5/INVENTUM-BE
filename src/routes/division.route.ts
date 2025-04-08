import { Router } from 'express';
import DivisionController from '../controllers/division.controller';
import verifyToken from '../middleware/verifyToken';

const router = Router();
const divisionController = new DivisionController();

router.post('/', verifyToken, divisionController.addDivision);

export default router;