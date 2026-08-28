import express, { Express } from 'express';
import cors from 'cors';

export const setMiddlewares = (app: Express): void => {
	app.use(cors({ origin: true }));
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
};
