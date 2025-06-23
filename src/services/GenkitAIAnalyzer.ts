import { IAIAnalyzer } from '../interfaces/IAIAnalyzer';
import { Article, BiasResult, ActorResult } from '../interfaces/types';
import { generateNewsInsights } from '../utils/genkitInsights';

export class GenkitAIAnalyzer implements IAIAnalyzer {
	async analyze(articles: Article[]): Promise<{
		neutralSummary: string;
		biasAnalysis: BiasResult[];
		actorAnalysis: ActorResult[];
		relatedArticles?: { title: string; url: string; source: string }[];
	}> {
		// Usar el texto de cada artículo para el análisis, incluyendo la URL explícitamente
		const newsTexts = articles.map((a) => `[${a.url}] ${a.source}: ${a.title}. ${a.snippet}`);
		const insights = await generateNewsInsights(newsTexts);
		// Cast explícito para asegurar el tipado correcto
		return insights as {
			neutralSummary: string;
			biasAnalysis: BiasResult[];
			actorAnalysis: ActorResult[];
			relatedArticles?: { title: string; url: string; source: string }[];
		};
	}
}
