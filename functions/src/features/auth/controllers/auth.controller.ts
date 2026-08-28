import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../domain/usecases/login.usecase';
import { RefreshTokenUseCase } from '../domain/usecases/refresh-token.usecase';
import { RegisterUseCase } from '../domain/usecases/register.usecase';

export class AuthController {
	constructor(
		private readonly registerUseCase: RegisterUseCase,
		private readonly loginUseCase: LoginUseCase,
		private readonly refreshTokenUseCase: RefreshTokenUseCase
	) {}

	register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { email, password } = req.body;
			const result = await this.registerUseCase.execute(email, password);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	};

	login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { email, password } = req.body;
			const result = await this.loginUseCase.execute(email, password);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};

	refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { refreshToken } = req.body;
			const result = await this.refreshTokenUseCase.execute(refreshToken);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};
}
