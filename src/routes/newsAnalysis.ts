import { Router } from 'express';
import { analyzeNews } from '../controllers/newsAnalysisController';

const router = Router();

router.post('/news-analysis', analyzeNews);

export default router;
