import cors from 'cors';
import express from 'express';
import { errorHandler } from './errorHandler';

export const applyMiddleware = (app: express.Application) => {
	app.use(cors());
	app.use(express.json());
	// Otros middlewares aquí si es necesario
	app.use(errorHandler);
};
