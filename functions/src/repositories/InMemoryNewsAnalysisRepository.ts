import { IRepository } from '../interfaces/IRepository';

export class InMemoryNewsAnalysisRepository<T> implements IRepository<T> {
	private store = new Map<string, T>();
	async save(item: any): Promise<void> {
		this.store.set(Date.now().toString(), item);
	}
	async findById(id: string): Promise<T | null> {
		return this.store.get(id) ?? null;
	}
}
