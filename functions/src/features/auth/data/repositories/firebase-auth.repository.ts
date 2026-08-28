import axios from 'axios';
import { AuthTokens } from '../../domain/entities/auth-tokens.entity';
import {
	EmailAlreadyInUseError,
	InvalidCredentialsError,
	InvalidTokenError,
} from '../../domain/errors';
import { AuthRepository } from '../../domain/repositories/auth.repository';

interface FirebaseAuthResponse {
	idToken: string;
	refreshToken: string;
	expiresIn: string;
	localId: string;
	email?: string;
}

interface FirebaseRefreshTokenResponse {
	id_token: string;
	refresh_token: string;
	expires_in: string;
	user_id: string;
}

export class FirebaseAuthRepository implements AuthRepository {
	private readonly apiKey: string;

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.FIREBASE_API_KEY || '';
	}

	async register(email: string, password: string): Promise<AuthTokens> {
		const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`;
		try {
			const response = await axios.post<FirebaseAuthResponse>(url, {
				email,
				password,
				returnSecureToken: true,
			});

			return {
				idToken: response.data.idToken,
				refreshToken: response.data.refreshToken,
				expiresIn: response.data.expiresIn,
				localId: response.data.localId,
				email: response.data.email,
			};
		} catch (error: any) {
			const errorMsg = error?.response?.data?.error?.message;
			if (errorMsg === 'EMAIL_EXISTS') {
				throw new EmailAlreadyInUseError();
			}
			throw new Error(errorMsg || 'Error al registrar usuario en Firebase Auth.');
		}
	}

	async login(email: string, password: string): Promise<AuthTokens> {
		const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
		try {
			const response = await axios.post<FirebaseAuthResponse>(url, {
				email,
				password,
				returnSecureToken: true,
			});

			return {
				idToken: response.data.idToken,
				refreshToken: response.data.refreshToken,
				expiresIn: response.data.expiresIn,
				localId: response.data.localId,
				email: response.data.email,
			};
		} catch (error: any) {
			const errorMsg = error?.response?.data?.error?.message;
			if (
				errorMsg === 'EMAIL_NOT_FOUND' ||
				errorMsg === 'INVALID_PASSWORD' ||
				errorMsg === 'INVALID_LOGIN_CREDENTIALS'
			) {
				throw new InvalidCredentialsError();
			}
			throw new Error(errorMsg || 'Error al autenticar credenciales.');
		}
	}

	async refreshToken(refreshToken: string): Promise<AuthTokens> {
		const url = `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`;
		try {
			const response = await axios.post<FirebaseRefreshTokenResponse>(
				url,
				new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
				}).toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			return {
				idToken: response.data.id_token,
				refreshToken: response.data.refresh_token,
				expiresIn: response.data.expires_in,
				localId: response.data.user_id,
			};
		} catch (error: any) {
			const errorMsg = error?.response?.data?.error?.message;
			if (
				errorMsg === 'INVALID_REFRESH_TOKEN' ||
				errorMsg === 'TOKEN_EXPIRED' ||
				errorMsg === 'USER_NOT_FOUND'
			) {
				throw new InvalidTokenError();
			}
			throw new Error(errorMsg || 'Error al renovar el token de autenticación.');
		}
	}
}
