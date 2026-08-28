import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { AnalyzeNewsUseCase } from '../domain/usecases/analyze-news.usecase';

export class NewsController {
	constructor(private readonly analyzeNewsUseCase: AnalyzeNewsUseCase) {}

	analyze = async (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const userId = req.user!.uid;
			const { url } = req.body;

			if (!url) {
				res.status(400).json({ error: 'Falta el parámetro url.' });
				return;
			}

			const result = await this.analyzeNewsUseCase.execute(userId, url);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};
}
