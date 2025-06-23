import { NewsAnalysisResult } from './types';
export interface INewsAnalysisService {
	analyzeNews(url: string): Promise<NewsAnalysisResult>;
}
