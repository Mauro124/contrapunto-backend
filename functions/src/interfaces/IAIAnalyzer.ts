import { SingleNewsAnalysisResult } from './types';
export interface IAIAnalyzer {
	analyzeSingle(url: string): Promise<SingleNewsAnalysisResult>;
}
