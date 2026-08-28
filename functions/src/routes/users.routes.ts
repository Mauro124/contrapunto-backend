import { Router } from 'express';
import { UsersController } from '../features/users/controllers/users.controller';
import { FirestoreUsersRepository } from '../features/users/data/repositories/firestore-users.repository';
import { GetCreditsUseCase } from '../features/users/domain/usecases/get-credits.usecase';
import { RechargeCreditsUseCase } from '../features/users/domain/usecases/recharge-credits.usecase';
import { firestore } from '../infrastructure/firebase/firebase';
import { authMiddleware } from '../middleware/auth.middleware';

export const initUsersRoutes = (): Router => {
	const router = Router();

	const usersRepository = new FirestoreUsersRepository(firestore());
	const getCreditsUseCase = new GetCreditsUseCase(usersRepository);
	const rechargeCreditsUseCase = new RechargeCreditsUseCase(usersRepository);
	const usersController = new UsersController(getCreditsUseCase, rechargeCreditsUseCase);

	router.get('/credits', authMiddleware, usersController.getCredits);
	router.post('/recharge', authMiddleware, usersController.rechargeCredits);

	return router;
};
