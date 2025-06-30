import { Router } from 'express';
import { analyzeSingleNews } from '../controllers/newsAnalysisController';

const router = Router();

router.post('/news-analysis/single', analyzeSingleNews);

export default router;
