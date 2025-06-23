import { z } from 'genkit';

// Normaliza el valor de confidence: si es 'none' u otro string, retorna 0; si es número, lo retorna tal cual
export function normalizeConfidence(conf: unknown): number {
	if (typeof conf === 'number') return conf;
	if (typeof conf === 'string') {
		const num = Number(conf);
		if (!isNaN(num)) return num;
		return 0;
	}
	return 0;
}

export const GenerateNewsInsightsSchema = z.object({
	neutralSummary: z.string(),
	politicalTendency: z.string().optional(),
	politicalTendencyExplanation: z.string().optional(),
	biasAnalysis: z.array(
		z.object({
			source: z.string(),
			url: z.string().url(),
			bias: z.string(),
			biasScore: z.number().min(-1).max(1).optional(), // -1: derecha, 0: centro, 1: izquierda
			confidence: z.union([z.number().min(0).max(1), z.string()]),
			explanation: z.string().optional(),
		})
	),
	actorAnalysis: z.array(
		z.object({
			source: z.string(),
			url: z.string().url(),
			favoredActor: z.string(),
			confidence: z.union([z.number().min(0).max(1), z.string()]),
			explanation: z.string().optional(),
		})
	),
	relatedArticles: z
		.array(
			z.object({
				title: z.string(),
				url: z.string().url(),
				source: z.string(),
			})
		)
		.optional(),
	extraInfo: z.string().optional(),
});
