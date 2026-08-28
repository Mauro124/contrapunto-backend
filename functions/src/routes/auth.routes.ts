import { Router } from 'express';
import { AuthController } from '../features/auth/controllers/auth.controller';
import { FirebaseAuthRepository } from '../features/auth/data/repositories/firebase-auth.repository';
import { LoginUseCase } from '../features/auth/domain/usecases/login.usecase';
import { RefreshTokenUseCase } from '../features/auth/domain/usecases/refresh-token.usecase';
import { RegisterUseCase } from '../features/auth/domain/usecases/register.usecase';
import { FirestoreUsersRepository } from '../features/users/data/repositories/firestore-users.repository';
import { firestore } from '../infrastructure/firebase/firebase';

export const initAuthRoutes = (): Router => {
	const router = Router();

	const authRepository = new FirebaseAuthRepository();
	const usersRepository = new FirestoreUsersRepository(firestore());

	const registerUseCase = new RegisterUseCase(authRepository, usersRepository);
	const loginUseCase = new LoginUseCase(authRepository, usersRepository);
	const refreshTokenUseCase = new RefreshTokenUseCase(authRepository);

	const authController = new AuthController(registerUseCase, loginUseCase, refreshTokenUseCase);

	router.post('/register', authController.register);
	router.post('/login', authController.login);
	router.post('/refresh-token', authController.refreshToken);

	return router;
};
