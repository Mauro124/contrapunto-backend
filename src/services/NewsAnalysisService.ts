import { INewsAnalysisService } from '../interfaces/INewsAnalysisService';
import { IContentExtractor } from '../interfaces/IContentExtractor';
import { INewsProvider } from '../interfaces/INewsProvider';
import { IArticleMatcher } from '../interfaces/IArticleMatcher';
import { IAIAnalyzer } from '../interfaces/IAIAnalyzer';
import { IRepository } from '../interfaces/IRepository';
import { NewsAnalysisResult, Article } from '../interfaces/types';

export class NewsAnalysisService implements INewsAnalysisService {
	constructor(
		private contentExtractor: IContentExtractor,
		private newsProviders: INewsProvider[],
		private articleMatcher: IArticleMatcher,
		private aiAnalyzer: IAIAnalyzer,
		private repository: IRepository<NewsAnalysisResult>
	) {}

	async analyzeNews(url: string): Promise<NewsAnalysisResult> {
		console.log(`[NewsAnalysisService] Iniciando análisis para URL: ${url}`);
		const originalExtracted = await this.contentExtractor.extract(url);

		if (!originalExtracted.title || !originalExtracted.snippet || !originalExtracted.url) {
			return {
				original: {
					title: 'Error al extraer contenido',
					snippet: 'No se pudo extraer el contenido del artículo.',
					url,
					source: 'original',
					publishedAt: new Date().toISOString(),
					keywords: [],
				},
				relatedArticles: [],
				neutralSummary: 'No se pudo extraer el contenido del artículo.',
				biasAnalysis: [],
				actorAnalysis: [],
			};
		}

		const original: Article = {
			...originalExtracted,
			url,
			source: 'original',
			publishedAt: new Date().toISOString(),
		};
		console.log(`[NewsAnalysisService] Artículo original extraído:`, original);
		const allArticles = (
			await Promise.all(this.newsProviders.map((p) => p.getRecentArticles()))
		).flat();
		console.log(
			`[NewsAnalysisService] Artículos obtenidos de proveedores: ${allArticles.length}`
		);
		// Filtrar duplicados por URL normalizada y quitar la noticia original de los candidatos
		const normalizeUrl = require('../utils/normalizeUrl').normalizeUrl;
		const originalNorm = normalizeUrl(original.url);
		const seen = new Set<string>([originalNorm]);
		const uniqueArticles = allArticles.filter((a) => {
			const norm = normalizeUrl(a.url);
			if (seen.has(norm)) return false;
			seen.add(norm);
			return true;
		});
		const related = await this.articleMatcher.findRelatedArticles(original, uniqueArticles);
		console.log(`[NewsAnalysisService] Artículos relacionados encontrados: ${related.length}`);
		// Sugerencias de noticias relacionadas (de varias fuentes, mezcladas, iteración única)
		function shuffleArray<T>(array: T[]): T[] {
			const arr = array.slice();
			for (let i = arr.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[arr[i], arr[j]] = [arr[j], arr[i]];
			}
			return arr;
		}
		const shuffledArticles = shuffleArray(uniqueArticles);
		const suggestions: Article[] = (() => {
			const otherSources: Article[] = [];
			const sameSource: Article[] = [];
			for (const a of shuffledArticles) {
				if (!a.title || !a.snippet || !a.url || !a.source || a.title.length <= 10) continue;
				if (a.source === original.source) {
					if (sameSource.length < 5) sameSource.push(a);
				} else {
					if (otherSources.length < 10) otherSources.push(a);
				}
				if (otherSources.length >= 10 && sameSource.length >= 5) break;
			}
			return shuffleArray([...otherSources, ...sameSource]);
		})();

		const aiResult = await this.aiAnalyzer.analyze([original, ...related]);
		console.log(`[NewsAnalysisService] Resultado de IA:`, aiResult);
		const result: NewsAnalysisResult = {
			original,
			relatedArticles: related,
			...aiResult,
		};
		// relatedArticlesList: solo una vez por fuente y noticia
		const relatedArticlesList = related.map((a) => ({
			title: a.title,
			url: a.url,
			source: a.source,
		}));
		(result as any).relatedArticlesList = relatedArticlesList;
		(result as any).relatedNewsSuggestions = suggestions;
		// Si la IA devuelve relatedArticles, ignóralos (usamos los del matcher, que son únicos y exactos)
		if ((result as any).relatedArticles) {
			delete (result as any).relatedArticles;
		}
		await this.repository.save(result);
		console.log(`[NewsAnalysisService] Resultado guardado en repositorio.`);
		return result;
	}
}
