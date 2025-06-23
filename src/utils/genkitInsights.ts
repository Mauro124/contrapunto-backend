import googleAI, { gemini20Flash } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';
import {
	GenerateNewsInsightsSchema,
	normalizeConfidence,
} from '../schemas/generateInsightsSchemas';
import { Article } from '../interfaces/types';

const ai = genkit({
	plugins: [googleAI()],
	model: gemini20Flash,
});

export const generateNewsInsightsFlow = ai.defineFlow(
	{
		name: 'generateNewsInsightsFlow',
		inputSchema: z.array(z.string()).min(1, 'Debe proporcionar al menos un texto de noticia.'),
		outputSchema: GenerateNewsInsightsSchema,
	},
	async (newsTexts) => {
		const prompt = `Dadas estas versiones de una noticia, cada una comienza con la URL entre corchetes. Usa SIEMPRE esa URL exactamente en el campo url de biasAnalysis y actorAnalysis. Analiza cada artículo de forma INDEPENDIENTE y específica, aunque los hechos sean similares. Si los enfoques, el tono, el lenguaje, el orden de los hechos, los actores destacados o el contexto difieren, EXPLÍCALO y resáltalo en el análisis. Evita respuestas genéricas o repetidas: busca matices, diferencias de enfoque, detalles únicos, omisiones o énfasis particulares de cada medio. Luego, genera un resumen neutral, un análisis de sesgo ideológico por medio (source, url, bias, biasScore, confidence, explanation), y un análisis de a qué actor político/social favorece cada medio (source, url, favoredActor, confidence, explanation). El campo biasScore debe ser un número entre -1 (muy de izquierda), 0 (centro) y 1 (muy de derecha), y debe estar presente en cada objeto de biasAnalysis. Explica brevemente el razonamiento detrás de cada análisis y cómo asignaste los valores de biasScore y confidence en el campo explanation. El campo confidence debe ser SIEMPRE un número entre 0 (sin confianza) y 1 (confianza total), nunca "none" ni texto. Además, indica en el campo politicalTendency si el tono global de la noticia es más de izquierdas, de derechas, de centro, o indefinido, y explica brevemente por qué en el campo politicalTendencyExplanation. Además, agrega un campo opcional extraInfo con contexto histórico, datos relevantes o cualquier información que ayude al lector a entender mejor la noticia y su tratamiento mediático. Devuelve SOLO un JSON válido con las claves: neutralSummary, politicalTendency, politicalTendencyExplanation, biasAnalysis (array de objetos con source, url, bias, biasScore, confidence, explanation), actorAnalysis (array de objetos con source, url, favoredActor, confidence, explanation), extraInfo (string, opcional).\n\nTextos:\n${newsTexts
			.map((t, i) => `Medio ${i + 1}: ${t}`)
			.join('\n')}`;

		console.log('Generando insights de noticia...');

		const { text } = await ai.generate({
			prompt: prompt,
		});

		console.log('Respuesta cruda de Gemini:', text);
		if (!text || text.trim().length === 0) {
			throw new Error('La IA devolvió una respuesta vacía.');
		}
		const jsonStart = text.indexOf('{');
		const jsonEnd = text.lastIndexOf('}');
		let cleanText = text;
		if (jsonStart !== -1 && jsonEnd !== -1) {
			cleanText = text.substring(jsonStart, jsonEnd + 1);
		} else {
			throw new Error('La IA no devolvió un JSON válido. Respuesta: ' + text);
		}
		function isValidUrl(url: string): boolean {
			try {
				new URL(url);
				return true;
			} catch {
				return false;
			}
		}

		try {
			const raw = JSON.parse(cleanText);
			// Filtrar solo los objetos con URL válida
			if (raw.biasAnalysis) {
				raw.biasAnalysis = raw.biasAnalysis.filter(
					(item: any) => typeof item.url === 'string' && isValidUrl(item.url)
				);
			}
			if (raw.actorAnalysis) {
				raw.actorAnalysis = raw.actorAnalysis.filter(
					(item: any) => typeof item.url === 'string' && isValidUrl(item.url)
				);
			}
			const parsed = GenerateNewsInsightsSchema.parse(raw);
			// Normalizar confidence a number en biasAnalysis y actorAnalysis
			parsed.biasAnalysis = parsed.biasAnalysis.map((item) => ({
				...item,
				confidence: normalizeConfidence(item.confidence),
			}));
			parsed.actorAnalysis = parsed.actorAnalysis.map((item) => ({
				...item,
				confidence: normalizeConfidence(item.confidence),
			}));
			return parsed;
		} catch (e) {
			console.error('Error al parsear JSON de la IA:', cleanText);
			throw e;
		}
	}
);

// Devuelve también una lista de noticias relacionadas (relatedNewsSuggestions) aparte
export async function generateNewsInsights(
	newsTexts: string[],
	relatedNewsSuggestions?: Article[]
) {
	if (!newsTexts || newsTexts.length === 0) {
		throw new Error('Debe proporcionar al menos un texto de noticia para generar insights.');
	}

	const result = await generateNewsInsightsFlow(newsTexts);
	return relatedNewsSuggestions && relatedNewsSuggestions.length > 0
		? { ...result, relatedNewsSuggestions }
		: result;
}
