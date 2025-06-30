import { IAIAnalyzer } from '../interfaces/IAIAnalyzer';
import { INewsAnalysisService } from '../interfaces/INewsAnalysisService';
import { SingleNewsAnalysisResult } from '../interfaces/types';

export class NewsAnalysisService implements INewsAnalysisService {
	constructor(private aiAnalyzer: IAIAnalyzer) {}

	async analyzeSingleNews(url: string, html: string): Promise<SingleNewsAnalysisResult> {
		const aiResult = await this.aiAnalyzer.analyzeSingle(html!);
		return aiResult as SingleNewsAnalysisResult;
	}
}
