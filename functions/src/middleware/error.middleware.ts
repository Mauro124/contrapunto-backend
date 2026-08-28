import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	console.error('[Error Middleware]:', err);

	if (err.name === 'InsufficientCreditsError') {
		res.status(402).json({
			error: 'insufficient_credits',
			message: err.message,
		});
		return;
	}

	if (err.name === 'UserNotFoundError') {
		res.status(404).json({
			error: 'user_not_found',
			message: err.message,
		});
		return;
	}

	if (err.name === 'InvalidCredentialsError') {
		res.status(401).json({
			error: 'invalid_credentials',
			message: err.message,
		});
		return;
	}

	if (err.name === 'EmailAlreadyInUseError') {
		res.status(409).json({
			error: 'email_already_in_use',
			message: err.message,
		});
		return;
	}

	if (err.name === 'InvalidTokenError') {
		res.status(401).json({
			error: 'invalid_token',
			message: err.message,
		});
		return;
	}

	res.status(err.status || 500).json({
		error: err.code || 'internal_server_error',
		message: err.message || 'Error interno del servidor.',
	});
};
