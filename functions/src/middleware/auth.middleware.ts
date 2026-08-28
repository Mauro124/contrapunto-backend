import { Request, Response, NextFunction } from 'express';
import { auth } from '../infrastructure/firebase/firebase';

export interface AuthenticatedRequest extends Request {
	user?: {
		uid: string;
		email?: string;
	};
}

export const authMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ error: 'No autorizado. Token requerido.' });
		return;
	}

	const idToken = authHeader.split('Bearer ')[1];
	try {
		const decodedToken = await auth().verifyIdToken(idToken);
		req.user = {
			uid: decodedToken.uid,
			email: decodedToken.email,
		};
		next();
	} catch (error) {
		res.status(401).json({ error: 'Token inválido o expirado.' });
	}
};
