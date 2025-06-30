import { Request, Response } from 'express';
import { SingleNewsAnalysisResult } from '../interfaces/types';
import { GenkitAIAnalyzer } from '../services/GenkitAIAnalyzer';
import { NewsAnalysisService } from '../services/NewsAnalysisService';

const newsAnalysisService = new NewsAnalysisService(new GenkitAIAnalyzer());

export const analyzeSingleNews = async (req: Request, res: Response) => {
	const { url, html } = req.body;
	if (!url && !html) {
		console.warn(`[Controller] Falta el parámetro url en el body.`);
		return res.status(400).json({ error: 'Missing url' });
	}

	try {
		const result: SingleNewsAnalysisResult = await newsAnalysisService.analyzeSingleNews(
			url,
			html
		);
		console.log(`[Controller] Análisis individual completado para URL: ${url}`);
		return res.json(result);
	} catch (err) {
		console.error(`[Controller] Error en análisis individual:`, err);
		return res.status(500).json({
			error: 'Error analyzing single news',
			details: err instanceof Error ? err.message : err,
		});
	}
};
