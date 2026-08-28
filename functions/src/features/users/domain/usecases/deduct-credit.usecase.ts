import { UsersRepository } from '../repositories/users.repository';

export class DeductCreditUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute(userId: string): Promise<number> {
		return await this.usersRepository.deductCredit(userId);
	}
}
