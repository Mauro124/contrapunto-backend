import * as functions from 'firebase-functions';
import { generateNewsInsights } from './utils/genkitInsights';

// Función HTTPS de Firebase que recibe { url } por POST y responde con el JSON de insights
export const generateNewsInsightsFunction = functions.https.onRequest(async (req, res) => {
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Método no permitido. Usa POST.' });
		return;
	}
	const { url } = req.body;
	if (!url || typeof url !== 'string') {
		res.status(400).json({ error: 'Falta el parámetro url.' });
		return;
	}
	try {
		const result = await generateNewsInsights(url);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(500).json({ error: error.message || 'Error interno.' });
	}
});
