import { UsersRepository } from '../repositories/users.repository';

export class GetCreditsUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute(userId: string, email?: string): Promise<{ credits: number }> {
		const user = await this.usersRepository.getById(userId);
		if (!user) {
			// Si no existe, crear con 5 créditos de bienvenida
			const newUser = {
				id: userId,
				email,
				credits: 5,
				createdAt: Date.now(),
			};
			await this.usersRepository.save(newUser);
			return { credits: 5 };
		}
		return { credits: user.credits };
	}
}
