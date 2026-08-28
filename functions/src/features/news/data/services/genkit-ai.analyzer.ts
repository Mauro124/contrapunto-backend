import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';
import { SingleNewsAnalysisResult } from '../../../../interfaces/types';
import { IAIAnalyzerService } from '../../domain/services/ai-analyzer.service';

const GEMINI_MODELS = [
	'googleai/gemini-3.6-flash',
	'googleai/gemini-3.5-flash',
];

export class GenkitAIAnalyzer implements IAIAnalyzerService {
	async analyze(url: string): Promise<SingleNewsAnalysisResult> {
		if (!url || url.length === 0) {
			throw new Error('Debe proporcionar al menos una URL de noticia para analizar.');
		}

		const prompt = `Eres un analista experto en medios. Analiza en profundidad la noticia ubicada en la siguiente URL (el modelo tiene acceso al contenido completo). Usa Google Search para buscar otras fuentes de información o medios que cubran la misma noticia y poder contrastarla. Responde SOLO con un JSON válido con los siguientes campos (usa los nombres exactos):
{
  "title": string, // Título de la noticia
  "snippet": string, // Fragmento o resumen breve
  "url": string, // URL exacta
  "source": string, // Medio
  "publishedAt": string, // Fecha de publicación
  "neutralSummary": string, // Resumen neutral y objetivo
  "biasAnalysis": { "source": string, "url": string, "bias": string, "biasScore": number, "confidence": number, "explanation": string },
  "actorAnalysis": { "source": string, "url": string, "favoredActor": string, "confidence": number, "explanation": string },
  "contextInfo": string, // Contexto histórico o relevante
  "keywords": string[], // Palabras clave relevantes
  "entities": string[], // Personas, organizaciones, lugares
  "writingStyle": string, // Ej: informativo, editorializado
  "factCheck": string, // Verificación de hechos: señala posibles errores, exageraciones, afirmaciones dudosas, datos incorrectos o puntos que requieran comprobación. Si todo parece correcto, indícalo, pero si hay dudas o afirmaciones que podrían requerir verificación, menciónalas. No pongas siempre lo mismo: analiza cada noticia y personaliza la respuesta.
  "glossary": [{ "term": string, "definition": string }], // Incluye SIEMPRE al menos 2-3 términos, aunque sean conceptos simples, tecnicismos, siglas, nombres de instituciones o palabras potencialmente desconocidas para el público general. Si no hay palabras difíciles, selecciona palabras clave, nombres propios o conceptos relevantes y defínelos de forma sencilla. No omitas este campo.
  "dataAnalysis": { "explanation": string, "values": [{ "label": string, "value": number, "unit": string }], "rawData": any } | null, // Extrae y agrupa TODO dato numérico, porcentaje, estadística, tendencia, comparación, cifra, tabla o gráfico mencionado. Si hay pocos datos, agrúpalos igual. Si hay tablas, listas o gráficos, conviértelos a objetos en values. Si hay datos en imágenes o gráficos, intenta inferirlos del texto. Si no hay datos, explica por qué en explanation y deja values como array vacío. IMPORTANTE: La unidad (unit) debe ser SOLO una de: 'porcentaje', 'numero', 'moneda', 'cantidad', 'nivel', 'otro'. Si la unidad no encaja, usa 'otro' y acláralo en el label.
  "politicalBiasScore": number, // 0 (izquierda) a 1 (derecha)
  "factualityScore": number, // 0 a 1
  "sensationalismScore": number, // 0 a 1
  "similarNewsCoverage": [{ "title": string, "url": string, "source": string, "bias": string, "difference": string }] // Usa Google Search para buscar esta misma noticia en otros medios. Si encuentras coberturas alternativas, añade al menos 2 o 3 fuentes con su título, URL, medio, sesgo estimado y cómo difiere su enfoque con respecto al artículo analizado. Si no hay coberturas alternativas, deja el array vacío.
}

- Si algún campo no aplica, déjalo vacío, null o como array vacío.
- Usa SIEMPRE la URL exacta.
- Sé breve pero preciso.
- En el campo personEntities, incluye una lista de personas mencionadas en la noticia, con nombre y apellido y una breve descripción contextual si hay información fidedigna (por ejemplo: "Presidente de Argentina", "Economista", etc). Si no hay información suficiente, omite la descripción o deja el array vacío. No omitas este campo si hay personas mencionadas en el texto.
- Incluye SIEMPRE el campo personEntities. Si no hay personas con información contextual, devuelve un array vacío.

Ejemplo de salida:
{
  "title": "Ejemplo de noticia",
  "snippet": "Resumen breve...",
  "url": "https://ejemplo.com/noticia",
  "source": "Ejemplo News",
  "publishedAt": "2026-08-28",
  "neutralSummary": "Esta noticia trata sobre...",
  "biasAnalysis": { "source": "Ejemplo News", "url": "https://ejemplo.com/noticia", "bias": "Centro", "biasScore": 0, "confidence": 0.8, "explanation": "El lenguaje es neutral..." },
  "actorAnalysis": { "source": "Ejemplo News", "url": "https://ejemplo.com/noticia", "favoredActor": "Gobierno", "confidence": 0.7, "explanation": "Se favorece al gobierno por..." },
  "contextInfo": "Antecedentes históricos...",
  "keywords": ["política", "economía"],
  "entities": ["Juan Pérez", "Argentina"],
  "personEntities": [
    { "nombre": "Juan Pérez", "descripcion": "Presidente de Argentina" }
  ],
  "writingStyle": "informativo",
  "factCheck": "No se detectaron errores fácticos.",
  "glossary": [{ "term": "inflación", "definition": "Aumento generalizado de precios." }],
  "dataAnalysis": null,
  "politicalBiasScore": 0.2,
  "factualityScore": 0.9,
  "sensationalismScore": 0.1,
  "similarNewsCoverage": [
    {
      "title": "Otra perspectiva sobre el anuncio económico",
      "url": "https://otromedio.com/noticia-alternativa",
      "source": "Mundo Diario",
      "bias": "Derecha",
      "difference": "Enfoca el impacto fiscal negativo mientras que el medio principal resalta el beneficio social."
    }
  ]
}`;

		const modelosDisponibles = [...GEMINI_MODELS];
		let ultimoError: any = null;

		while (modelosDisponibles.length > 0) {
			const model = modelosDisponibles.shift()!;
			const ai = genkit({
				plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
				model,
			});

			try {
				console.log('[GenkitAIAnalyzer] Intentando con modelo Gemini:', model);
				const response = await ai.generate({
					prompt: `Noticia a analizar (URL): ${url}\n\nInstrucciones:\n${prompt}`,
					config: {
						tools: [{ googleSearch: {} }],
					},
				});

				const aiText = response.text;
				if (!aiText || aiText.trim().length === 0) {
					throw new Error('La IA devolvió una respuesta vacía. Modelo: ' + model);
				}

				const jsonStart = aiText.indexOf('{');
				const jsonEnd = aiText.lastIndexOf('}');
				let cleanText = aiText;

				if (jsonStart !== -1 && jsonEnd !== -1) {
					cleanText = aiText.substring(jsonStart, jsonEnd + 1);
				} else {
					throw new Error(
						'La IA no devolvió un JSON válido. Modelo: ' +
							model +
							'. Respuesta: ' +
							aiText
					);
				}

				return JSON.parse(cleanText) as SingleNewsAnalysisResult;
			} catch (err: any) {
				ultimoError = err;
				const msg = err && err.message ? err.message : String(err);
				if (
					msg.includes('503') ||
					msg.includes('Service Unavailable') ||
					msg.includes('model is overloaded')
				) {
					console.warn('Modelo', model, 'sobrecargado. Probando siguiente modelo...');
					continue;
				}
				throw err;
			}
		}

		throw ultimoError || new Error('Todos los modelos Gemini fallaron.');
	}
}
