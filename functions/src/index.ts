import * as functions from 'firebase-functions';
import * as functionsV1 from 'firebase-functions/v1';
import express from 'express';
import { setMiddlewares } from './middleware';
import { initRoutes } from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { firestore } from './infrastructure/firebase/firebase';
import { FirestoreUsersRepository } from './features/users/data/repositories/firestore-users.repository';
import { CreateUserUseCase } from './features/users/domain/usecases/create-user.usecase';

// Inicializar aplicación Express
const app = express();

setMiddlewares(app);
initRoutes(app);
app.use(errorMiddleware);

// Exportar endpoint HTTPS para Firebase Functions (2nd Gen)
export const generateNewsInsightsFunction = functions.https.onRequest(app);

// Exportar trigger automático de Firebase Auth para inicializar usuario en Firestore al registrarse
export const onUserCreated = functionsV1.auth.user().onCreate(async (user: functionsV1.auth.UserRecord) => {
	console.log(`[onUserCreated] Inicializando nuevo usuario en Firestore: ${user.uid} (${user.email})`);
	try {
		const usersRepository = new FirestoreUsersRepository(firestore());
		const createUserUseCase = new CreateUserUseCase(usersRepository);

		await createUserUseCase.execute({
			id: user.uid,
			email: user.email,
			initialCredits: 5,
		});

		console.log(`[onUserCreated] Usuario ${user.uid} creado exitosamente con 5 créditos iniciales.`);
	} catch (error) {
		console.error(`[onUserCreated] Error al inicializar usuario ${user.uid} en Firestore:`, error);
	}
});
