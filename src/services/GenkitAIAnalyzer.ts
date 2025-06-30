import { IAIAnalyzer } from '../interfaces/IAIAnalyzer';
import { SingleNewsAnalysisResult } from '../interfaces/types';
import { generateNewsInsights } from '../utils/genkitInsights';

export class GenkitAIAnalyzer implements IAIAnalyzer {
	async analyzeSingle(html: String): Promise<SingleNewsAnalysisResult> {
		const insights = await generateNewsInsights(html);
		return insights as any;
	}
}
