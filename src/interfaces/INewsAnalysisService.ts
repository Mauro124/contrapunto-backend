import { SingleNewsAnalysisResult } from './types';
export interface INewsAnalysisService {
	analyzeSingleNews(url: string, html?: string): Promise<SingleNewsAnalysisResult>;
}
