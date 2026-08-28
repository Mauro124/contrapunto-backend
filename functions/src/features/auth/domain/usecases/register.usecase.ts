import { UsersRepository } from '../../../users/domain/repositories/users.repository';
import { AuthTokens } from '../entities/auth-tokens.entity';
import { AuthRepository } from '../repositories/auth.repository';

export interface RegisterOutput {
	user: {
		id: string;
		email?: string;
		credits: number;
	};
	tokens: AuthTokens;
}

export class RegisterUseCase {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly usersRepository: UsersRepository
	) {}

	async execute(email: string, password: string): Promise<RegisterOutput> {
		if (!email || !password) {
			throw new Error('Email y contraseña son requeridos.');
		}
		if (password.length < 6) {
			throw new Error('La contraseña debe tener al menos 6 caracteres.');
		}

		// Registrar usuario en Firebase Auth
		const tokens = await this.authRepository.register(email, password);

		// Inicializar usuario en Firestore con 5 créditos
		const user = {
			id: tokens.localId,
			email: tokens.email || email,
			credits: 5,
			createdAt: Date.now(),
		};
		await this.usersRepository.save(user);

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
