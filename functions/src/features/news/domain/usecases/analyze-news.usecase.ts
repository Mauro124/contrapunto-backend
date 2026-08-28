import { SingleNewsAnalysisResult } from '../../../../interfaces/types';
import { UsersRepository } from '../../../users/domain/repositories/users.repository';
import { IAIAnalyzerService } from '../services/ai-analyzer.service';

export interface AnalyzeNewsOutput {
	analysis: SingleNewsAnalysisResult;
	creditsLeft: number;
}

export class AnalyzeNewsUseCase {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly aiAnalyzer: IAIAnalyzerService
	) {}

	async execute(userId: string, url: string): Promise<AnalyzeNewsOutput> {
		if (!url || typeof url !== 'string') {
			throw new Error('Debe proporcionar un parámetro url válido.');
		}

		// Descontar crédito de forma atómica (lanza InsufficientCreditsError si no alcanza)
		const creditsLeft = await this.usersRepository.deductCredit(userId);

		try {
			// Ejecutar el análisis con IA
			const analysis = await this.aiAnalyzer.analyze(url);

			return {
				analysis,
				creditsLeft,
			};
		} catch (error) {
			// Si falla el análisis con IA, reembolsar el crédito descontado
			try {
				await this.usersRepository.refundCredit(userId);
			} catch (refundError) {
				console.error('[AnalyzeNewsUseCase] Error al reembolsar crédito:', refundError);
			}
			throw error;
		}
	}
}
