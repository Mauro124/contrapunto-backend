import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { GetCreditsUseCase } from '../domain/usecases/get-credits.usecase';
import { RechargeCreditsUseCase } from '../domain/usecases/recharge-credits.usecase';

export class UsersController {
	constructor(
		private readonly getCreditsUseCase: GetCreditsUseCase,
		private readonly rechargeCreditsUseCase: RechargeCreditsUseCase
	) {}

	getCredits = async (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const userId = req.user!.uid;
			const email = req.user?.email;
			const result = await this.getCreditsUseCase.execute(userId, email);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};

	rechargeCredits = async (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const userId = req.user!.uid;
			const { amount } = req.body;
			const creditAmount = typeof amount === 'number' && amount > 0 ? amount : 5;
			const result = await this.rechargeCreditsUseCase.execute(userId, creditAmount);
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};
}
