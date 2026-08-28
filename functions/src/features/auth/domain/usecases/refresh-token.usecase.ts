import { AuthTokens } from '../entities/auth-tokens.entity';
import { AuthRepository } from '../repositories/auth.repository';

export class RefreshTokenUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async execute(refreshToken: string): Promise<AuthTokens> {
		if (!refreshToken) {
			throw new Error('El parámetro refreshToken es requerido.');
		}
		return await this.authRepository.refreshToken(refreshToken);
	}
}
