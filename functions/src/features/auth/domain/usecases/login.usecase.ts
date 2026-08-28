import { UsersRepository } from '../../../users/domain/repositories/users.repository';
import { AuthTokens } from '../entities/auth-tokens.entity';
import { AuthRepository } from '../repositories/auth.repository';

export interface LoginOutput {
	user: {
		id: string;
		email?: string;
		credits: number;
	};
	tokens: AuthTokens;
}

export class LoginUseCase {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly usersRepository: UsersRepository
	) {}

	async execute(email: string, password: string): Promise<LoginOutput> {
		if (!email || !password) {
			throw new Error('Email y contraseña son requeridos.');
		}

		// Iniciar sesión y obtener tokens
		const tokens = await this.authRepository.login(email, password);

		// Obtener o inicializar datos del usuario en Firestore
		let user = await this.usersRepository.getById(tokens.localId);
		if (!user) {
			user = {
				id: tokens.localId,
				email: tokens.email || email,
				credits: 5,
				createdAt: Date.now(),
			};
			await this.usersRepository.save(user);
		}

		return {
			user: {
				id: user.id,
				email: user.email,
				credits: user.credits,
			},
			tokens,
		};
	}
}
