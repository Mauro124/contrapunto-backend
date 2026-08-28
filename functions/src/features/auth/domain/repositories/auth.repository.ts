import { AuthTokens } from '../entities/auth-tokens.entity';

export interface AuthRepository {
	register(email: string, password: string): Promise<AuthTokens>;
	login(email: string, password: string): Promise<AuthTokens>;
	refreshToken(refreshToken: string): Promise<AuthTokens>;
}
