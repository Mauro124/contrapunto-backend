import { Request, Response } from 'express';
import { NewsAnalysisResult } from '../interfaces/types';
import { rssProviders } from '../providers/rssProviders';
import { InMemoryNewsAnalysisRepository } from '../repositories/InMemoryNewsAnalysisRepository';
import { GenkitAIAnalyzer } from '../services/GenkitAIAnalyzer';
import { NewsAnalysisService } from '../services/NewsAnalysisService';
import { RssContentExtractor } from '../services/RssContentExtractor';
import { SimpleArticleMatcher } from '../services/SimpleArticleMatcher';

const newsAnalysisService = new NewsAnalysisService(
	new RssContentExtractor(),
	rssProviders,
	new SimpleArticleMatcher(0.3),
	new GenkitAIAnalyzer(),
	new InMemoryNewsAnalysisRepository<NewsAnalysisResult>()
);

export const analyzeNews = async (req: Request, res: Response) => {
	const { url } = req.body;
	console.log(`[Controller] POST /news-analysis body:`, req.body);
	if (!url) {
		console.warn(`[Controller] Falta el parámetro url en el body.`);
		return res.status(400).json({ error: 'Missing url' });
	}
	try {
		const result = await newsAnalysisService.analyzeNews(url);
		console.log(`[Controller] Análisis completado para URL: ${url}`);
		return res.json(result);
	} catch (err) {
		console.error(`[Controller] Error analizando noticia:`, err);
		return res.status(500).json({
			error: 'Error analyzing news',
			details: err instanceof Error ? err.message : err,
		});
	}
};
