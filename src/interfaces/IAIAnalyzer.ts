import { Article, BiasResult, ActorResult } from './types';
export interface IAIAnalyzer {
	analyze(articles: Article[]): Promise<{
		neutralSummary: string;
		biasAnalysis: BiasResult[];
		actorAnalysis: ActorResult[];
	}>;
}
