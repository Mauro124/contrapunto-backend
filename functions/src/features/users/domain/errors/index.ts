export class InsufficientCreditsError extends Error {
	constructor(message = 'Créditos insuficientes.') {
		super(message);
		this.name = 'InsufficientCreditsError';
	}
}

export class UserNotFoundError extends Error {
	constructor(userId: string) {
		super(`Usuario con ID ${userId} no encontrado.`);
		this.name = 'UserNotFoundError';
	}
}
