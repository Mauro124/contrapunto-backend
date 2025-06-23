export interface IRepository<T> {
	save(item: T): Promise<void>;
	findById(id: string): Promise<T | null>;
}
