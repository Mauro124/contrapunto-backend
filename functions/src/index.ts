import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateNewsInsights } from './utils/genkitInsights';

// Inicializar admin SDK si no está inicializado
if (!admin.apps.length) {
	admin.initializeApp();
}
const db = admin.firestore();

export const generateNewsInsightsFunction = functions.https.onRequest(async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

	if (req.method === 'OPTIONS') {
		res.status(204).send('');
		return;
	}

	// Verificar autenticación
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ error: 'No autorizado. Token requerido.' });
		return;
	}
	const idToken = authHeader.split('Bearer ')[1];
	let uid: string;
	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		uid = decodedToken.uid;
	} catch (e: any) {
		res.status(401).json({ error: 'Token inválido o expirado.' });
		return;
	}

	const userRef = db.collection('users').doc(uid);

	// GET: Obtener balance de créditos
	if (req.method === 'GET') {
		try {
			const userDoc = await userRef.get();
			if (!userDoc.exists) {
				// Usuario nuevo, registrar con 5 créditos de regalo
				await userRef.set({ credits: 5 });
				res.status(200).json({ credits: 5 });
			} else {
				res.status(200).json({ credits: userDoc.data()?.credits ?? 0 });
			}
		} catch (error: any) {
			res.status(500).json({ error: 'Error al consultar créditos.' });
		}
		return;
	}

	// POST: Acciones (Análisis o Recarga)
	if (req.method === 'POST') {
		const { action, url, amount } = req.body;

		// Acción: Recarga
		if (action === 'recharge') {
			const creditsToRecharge = typeof amount === 'number' ? amount : 5;
			try {
				let newCredits = creditsToRecharge;
				await db.runTransaction(async (transaction) => {
					const sfDoc = await transaction.get(userRef);
					if (!sfDoc.exists) {
						transaction.set(userRef, { credits: creditsToRecharge });
					} else {
						const currentCredits = sfDoc.data()?.credits ?? 0;
						newCredits = currentCredits + creditsToRecharge;
						transaction.update(userRef, { credits: newCredits });
					}
				});
				res.status(200).json({ credits: newCredits });
			} catch (error: any) {
				res.status(500).json({ error: 'Error al recargar créditos.' });
			}
			return;
		}

		// Acción por defecto: Analizar noticia
		if (!url || typeof url !== 'string') {
			res.status(400).json({ error: 'Falta el parámetro url.' });
			return;
		}

		try {
			let currentCredits = 0;
			// Transacción para descontar 1 crédito de forma segura
			const transactionSuccess = await db.runTransaction(async (transaction) => {
				const sfDoc = await transaction.get(userRef);
				if (!sfDoc.exists) {
					// Crear usuario con 5 créditos, descontar 1 = quedan 4
					transaction.set(userRef, { credits: 4 });
					currentCredits = 4;
					return true;
				} else {
					const credits = sfDoc.data()?.credits ?? 0;
					if (credits <= 0) {
						return false; // Sin créditos
					}
					currentCredits = credits - 1;
					transaction.update(userRef, { credits: currentCredits });
					return true;
				}
			});

			if (!transactionSuccess) {
				res.status(402).json({ error: 'insufficient_credits', message: 'Créditos insuficientes.' });
				return;
			}

			// Ejecutar el análisis
			const result = await generateNewsInsights(url);
			res.status(200).json({
				analysis: result,
				creditsLeft: currentCredits
			});

		} catch (error: any) {
			// En caso de error catastrófico del análisis, intentar devolver el crédito
			try {
				await db.runTransaction(async (transaction) => {
					const sfDoc = await transaction.get(userRef);
					if (sfDoc.exists) {
						const credits = sfDoc.data()?.credits ?? 0;
						transaction.update(userRef, { credits: credits + 1 });
					}
				});
			} catch (revertError) {
				// Ignorar error de devolución
			}
			res.status(500).json({ error: error.message || 'Error interno durante el análisis.' });
		}
		return;
	}

	res.status(405).json({ error: 'Método no permitido.' });
});
