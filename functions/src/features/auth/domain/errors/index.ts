export class InvalidCredentialsError extends Error {
	constructor(message = 'Email o contraseña incorrectos.') {
		super(message);
		this.name = 'InvalidCredentialsError';
	}
}

export class EmailAlreadyInUseError extends Error {
	constructor(message = 'El correo electrónico ya se encuentra registrado.') {
		super(message);
		this.name = 'EmailAlreadyInUseError';
	}
}

export class InvalidTokenError extends Error {
	constructor(message = 'El token proporcionado es inválido o ha expirado.') {
		super(message);
		this.name = 'InvalidTokenError';
	}
}
