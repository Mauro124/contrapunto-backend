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

	res.status(err.status || 500).json({
		error: err.code || 'internal_server_error',
		message: err.message || 'Error interno del servidor.',
	});
};
