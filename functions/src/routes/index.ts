import { Express, Request, Response, NextFunction } from 'express';
import { initNewsRoutes } from './news.routes';
import { initUsersRoutes } from './users.routes';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { FirestoreUsersRepository } from '../features/users/data/repositories/firestore-users.repository';
import { firestore } from '../infrastructure/firebase/firebase';
import { GetCreditsUseCase } from '../features/users/domain/usecases/get-credits.usecase';
import { RechargeCreditsUseCase } from '../features/users/domain/usecases/recharge-credits.usecase';
import { GenkitAIAnalyzer } from '../features/news/data/services/genkit-ai.analyzer';
import { AnalyzeNewsUseCase } from '../features/news/domain/usecases/analyze-news.usecase';
import { UsersController } from '../features/users/controllers/users.controller';
import { NewsController } from '../features/news/controllers/news.controller';

export const initRoutes = (app: Express): void => {
	// Rutas modulares REST
	app.use('/api/users', initUsersRoutes());
	app.use('/api/news', initNewsRoutes());

	// Controladores instanciados para retrocompatibilidad de endpoints raíz
	const usersRepository = new FirestoreUsersRepository(firestore());
	const getCreditsUseCase = new GetCreditsUseCase(usersRepository);
	const rechargeCreditsUseCase = new RechargeCreditsUseCase(usersRepository);
	const usersController = new UsersController(getCreditsUseCase, rechargeCreditsUseCase);

	const aiAnalyzer = new GenkitAIAnalyzer();
	const analyzeNewsUseCase = new AnalyzeNewsUseCase(usersRepository, aiAnalyzer);
	const newsController = new NewsController(analyzeNewsUseCase);

	// Retrocompatibilidad con cliente anterior (GET / y POST / con action o url)
	app.get('/', authMiddleware, usersController.getCredits);
	app.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		const { action } = req.body;
		if (action === 'recharge') {
			return usersController.rechargeCredits(req, res, next);
		}
		return newsController.analyze(req, res, next);
	});
};
