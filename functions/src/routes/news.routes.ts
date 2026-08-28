import { Router } from 'express';
import { NewsController } from '../features/news/controllers/news.controller';
import { GenkitAIAnalyzer } from '../features/news/data/services/genkit-ai.analyzer';
import { AnalyzeNewsUseCase } from '../features/news/domain/usecases/analyze-news.usecase';
import { FirestoreUsersRepository } from '../features/users/data/repositories/firestore-users.repository';
import { firestore } from '../infrastructure/firebase/firebase';
import { authMiddleware } from '../middleware/auth.middleware';

export const initNewsRoutes = (): Router => {
	const router = Router();

	const usersRepository = new FirestoreUsersRepository(firestore());
	const aiAnalyzer = new GenkitAIAnalyzer();
	const analyzeNewsUseCase = new AnalyzeNewsUseCase(usersRepository, aiAnalyzer);
	const newsController = new NewsController(analyzeNewsUseCase);

	router.post('/analyze', authMiddleware, newsController.analyze);

	return router;
};
