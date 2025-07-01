import { IAIAnalyzer } from '../interfaces/IAIAnalyzer';
import { SingleNewsAnalysisResult } from '../interfaces/types';
import { generateNewsInsights } from '../utils/genkitInsights';

export class GenkitAIAnalyzer implements IAIAnalyzer {
	async analyzeSingle(url: string): Promise<SingleNewsAnalysisResult> {
		return await generateNewsInsights(url);
	}
}
