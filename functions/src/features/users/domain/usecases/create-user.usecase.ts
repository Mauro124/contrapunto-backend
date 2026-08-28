import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

export class CreateUserUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute(params: { id: string; email?: string; initialCredits?: number }): Promise<User> {
		const existingUser = await this.usersRepository.getById(params.id);
		if (existingUser) {
			return existingUser;
		}

		const newUser: User = {
			id: params.id,
			email: params.email,
			credits: params.initialCredits ?? 5,
			createdAt: Date.now(),
		};

		await this.usersRepository.save(newUser);
		return newUser;
	}
}
