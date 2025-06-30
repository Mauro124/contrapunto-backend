import { BiasResult, ActorResult, SingleNewsAnalysisResult } from './types';
export interface IAIAnalyzer {
	analyzeSingle(html: String): Promise<SingleNewsAnalysisResult>;
}
