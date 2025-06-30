import googleAI, { gemini20Flash } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { SingleNewsAnalysisResult } from '../interfaces/types';
import { normalizeConfidence } from '../schemas/generateInsightsSchemas';

const ai = genkit({
	plugins: [googleAI()],
	model: gemini20Flash,
});

// Devuelve también una lista de noticias relacionadas (relatedNewsSuggestions) aparte
export async function generateNewsInsights(html: String) {
	if (!html || html.length === 0) {
		throw new Error('Debe proporcionar al menos un texto de noticia para generar insights.');
	}

	// Prompt especial para análisis individual profundo
	const prompt = `Analiza en profundidad el html de la siguiente noticia. Devuelve SOLO un JSON válido con los siguientes campos:
- neutralSummary: resumen neutral y objetivo de la noticia.
- biasAnalysis: un solo objeto { source, url, bias (Izquierda, Derecha, Centro, Centro-Izquierda, Centro-derecha), biasScore (-1 izquierda, 0 centro, 1 derecha), confidence (0-1), explanation detallada del sesgo, tono, lenguaje, omisiones, énfasis, etc.}
- actorAnalysis: un solo objeto { source, url, favoredActor, confidence (0-1), explanation detallada de a quién favorece la nota y por qué}
- keywords: array de palabras clave relevantes.
- entities: array de personas, organizaciones, lugares mencionados.
- writingStyle: descripción del estilo periodístico (ej: informativo, editorializado, sensacionalista, etc.)
- factCheck: breve verificación de hechos, posibles errores o afirmaciones dudosas.
- contextInfo: contexto histórico, antecedentes, datos relevantes para entender la noticia.
- glossary: array de objetos { term, definition } con palabras o expresiones de difícil comprensión para el público general encontradas en la noticia, y su definición clara y sencilla.
- dataAnalysis: si la noticia contiene datos analíticos, incluye un objeto { explanation: explicación del análisis de los datos, values: array de { label, value, unit } para graficar (unit debe ser 'porcentaje' | 'numero' | 'moneda' | 'cantidad' | 'nivel' | 'otro'), rawData: datos originales si aplica }. Si no hay datos, este campo puede omitirse o ser null.
- politicalBiasScore: número entre 0 (izquierda) y 1 (derecha) que indique el sesgo político general de la noticia.
- factualityScore: número entre 0 y 1 que indique el nivel de factualidad (1 = totalmente factual, 0 = nada factual).
- sensationalismScore: número entre 0 y 1 que indique el nivel de sensacionalismo (1 = muy sensacionalista, 0 = nada sensacionalista).

Sé exhaustivo, preciso y evita respuestas genéricas. Usa SIEMPRE la URL exacta. Ejemplo de entrada:
[URL] Fuente: Título. Snippet.`;

	console.log('Generando insights individuales de noticia...');
	const { text } = await ai.generate({
		prompt: `${prompt}\n\nTexto:\n${html}`,
	});

	console.log('Respuesta cruda de Gemini (single):', text);
	if (!text || text.trim().length === 0) {
		throw new Error('La IA devolvió una respuesta vacía.');
	}
	const jsonStart = text.indexOf('{');
	const jsonEnd = text.lastIndexOf('}');
	let cleanText = text;
	if (jsonStart !== -1 && jsonEnd !== -1) {
		cleanText = text.substring(jsonStart, jsonEnd + 1);
	} else {
		console.error('La IA no devolvió un JSON válido. Respuesta:', text);
		throw new Error('La IA no devolvió un JSON válido. Respuesta: ' + text);
	}

	try {
		const raw = JSON.parse(cleanText);
		if (
			!raw ||
			typeof raw !== 'object' ||
			!raw.neutralSummary ||
			!raw.biasAnalysis ||
			!raw.actorAnalysis ||
			!Array.isArray(raw.keywords) ||
			!Array.isArray(raw.entities) ||
			!raw.writingStyle ||
			!raw.factCheck ||
			!raw.contextInfo
		) {
			throw new Error('El JSON no tiene la estructura esperada.');
		}
		// Validación opcional de los nuevos campos
		if (raw.glossary && !Array.isArray(raw.glossary)) {
			throw new Error('El campo glossary debe ser un array.');
		}
		if (raw.dataAnalysis && typeof raw.dataAnalysis !== 'object') {
			throw new Error('El campo dataAnalysis debe ser un objeto.');
		}
		if (
			typeof raw.politicalBiasScore !== 'number' ||
			raw.politicalBiasScore < 0 ||
			raw.politicalBiasScore > 1
		) {
			throw new Error('El campo politicalBiasScore debe ser un número entre 0 y 1.');
		}
		if (
			typeof raw.factualityScore !== 'number' ||
			raw.factualityScore < 0 ||
			raw.factualityScore > 1
		) {
			throw new Error('El campo factualityScore debe ser un número entre 0 y 1.');
		}
		if (
			typeof raw.sensationalismScore !== 'number' ||
			raw.sensationalismScore < 0 ||
			raw.sensationalismScore > 1
		) {
			throw new Error('El campo sensationalismScore debe ser un número entre 0 y 1.');
		}

		return raw as SingleNewsAnalysisResult;
	} catch (e) {
		console.error('Error al parsear JSON de la IA (single):', cleanText);
		throw e;
	}
}
