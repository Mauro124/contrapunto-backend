import { SingleNewsAnalysisResult } from '../../../../interfaces/types';

export interface IAIAnalyzerService {
	analyze(url: string): Promise<SingleNewsAnalysisResult>;
}
