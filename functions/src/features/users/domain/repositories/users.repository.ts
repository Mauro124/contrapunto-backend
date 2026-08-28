import { User } from '../entities/user.entity';

export interface UsersRepository {
	getById(userId: string): Promise<User | null>;
	save(user: User): Promise<void>;
	updateCredits(userId: string, credits: number): Promise<void>;
	rechargeCredits(userId: string, amount: number): Promise<number>;
	deductCredit(userId: string): Promise<number>;
	refundCredit(userId: string): Promise<void>;
}
