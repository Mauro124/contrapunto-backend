import { UsersRepository } from '../repositories/users.repository';

export class RechargeCreditsUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute(userId: string, amount = 5): Promise<{ credits: number }> {
		const newCredits = await this.usersRepository.rechargeCredits(userId, amount);
		return { credits: newCredits };
	}
}
