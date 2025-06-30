import googleAI, { gemini20Flash } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const ai = genkit({
	plugins: [googleAI()],
	model: gemini20Flash,
});

export const extractKeywordsWithGenkit = ai.defineFlow(
	{
		name: 'extractKeywordsWithGenkit',
		inputSchema: z.string().min(10, 'Debe proporcionar un texto de noticia.'),
		outputSchema: z.object({ keywords: z.array(z.string()) }),
	},
	async (text) => {
		const prompt = `Extrae las 8 palabras clave más relevantes del siguiente texto de noticia. Devuelve SOLO un JSON válido con la clave: keywords (array de strings, sin duplicados, en minúsculas, sin signos, sin stopwords, ordenadas por relevancia descendente). Texto:\n${text}`;
		const { text: aiText } = await ai.generate({
			prompt,
		});
		const jsonStart = aiText.indexOf('{');
		const jsonEnd = aiText.lastIndexOf('}');
		let cleanText = aiText;
		if (jsonStart !== -1 && jsonEnd !== -1) {
			cleanText = aiText.substring(jsonStart, jsonEnd + 1);
		}
		try {
			const parsed = JSON.parse(cleanText);
			if (Array.isArray(parsed.keywords)) {
				return { keywords: parsed.keywords };
			}
			throw new Error('No se encontraron keywords en la respuesta de la IA.');
		} catch (e) {
			throw new Error('Error al parsear keywords de la IA: ' + cleanText);
		}
	}
);

export async function extractKeywordsGenkit(text: string): Promise<string[]> {
	const result = await extractKeywordsWithGenkit(text);
	return result.keywords;
}
