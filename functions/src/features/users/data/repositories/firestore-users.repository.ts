import { Firestore } from 'firebase-admin/firestore';
import { FirestoreCollections } from '../../../../infrastructure/firebase/firestore-collections';
import { User } from '../../domain/entities/user.entity';
import { InsufficientCreditsError, UserNotFoundError } from '../../domain/errors';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { UserDto } from '../dtos/user.dto';
import { UserMapper } from '../mappers/user.mapper';

export class FirestoreUsersRepository implements UsersRepository {
	private readonly mapper = new UserMapper();

	constructor(private readonly db: Firestore) {}

	async getById(userId: string): Promise<User | null> {
		const doc = await this.db.collection(FirestoreCollections.USERS).doc(userId).get();
		if (!doc.exists) {
			return null;
		}
		return this.mapper.toDomain(doc.data() as UserDto, doc.id);
	}

	async save(user: User): Promise<void> {
		const data = this.mapper.toPersistence(user);
		await this.db.collection(FirestoreCollections.USERS).doc(user.id).set(data, { merge: true });
	}

	async updateCredits(userId: string, credits: number): Promise<void> {
		await this.db.collection(FirestoreCollections.USERS).doc(userId).update({
			credits,
			updatedAt: Date.now(),
		});
	}

	async rechargeCredits(userId: string, amount: number): Promise<number> {
		const userRef = this.db.collection(FirestoreCollections.USERS).doc(userId);
		let finalCredits = amount;

		await this.db.runTransaction(async (transaction) => {
			const sfDoc = await transaction.get(userRef);
			if (!sfDoc.exists) {
				transaction.set(userRef, {
					credits: amount,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				finalCredits = amount;
			} else {
				const current = (sfDoc.data()?.credits as number) ?? 0;
				finalCredits = current + amount;
				transaction.update(userRef, {
					credits: finalCredits,
					updatedAt: Date.now(),
				});
			}
		});

		return finalCredits;
	}

	async deductCredit(userId: string): Promise<number> {
		const userRef = this.db.collection(FirestoreCollections.USERS).doc(userId);
		let remainingCredits = 0;

		await this.db.runTransaction(async (transaction) => {
			const sfDoc = await transaction.get(userRef);
			if (!sfDoc.exists) {
				// Usuario nuevo: 5 créditos - 1 = 4 restantes
				remainingCredits = 4;
				transaction.set(userRef, {
					credits: 4,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			} else {
				const current = (sfDoc.data()?.credits as number) ?? 0;
				if (current <= 0) {
					throw new InsufficientCreditsError();
				}
				remainingCredits = current - 1;
				transaction.update(userRef, {
					credits: remainingCredits,
					updatedAt: Date.now(),
				});
			}
		});

		return remainingCredits;
	}

	async refundCredit(userId: string): Promise<void> {
		const userRef = this.db.collection(FirestoreCollections.USERS).doc(userId);
		await this.db.runTransaction(async (transaction) => {
			const sfDoc = await transaction.get(userRef);
			if (sfDoc.exists) {
				const current = (sfDoc.data()?.credits as number) ?? 0;
				transaction.update(userRef, {
					credits: current + 1,
					updatedAt: Date.now(),
				});
			}
		});
	}
}
