// Utilidad para normalizar URLs de noticias para comparación exacta robusta
// - Elimina slash final
// - Normaliza protocolo a https
// - Elimina parámetros de tracking comunes (utm_*, fbclid, etc)
// - Host en minúsculas
// - Ordena los parámetros

export function normalizeUrl(url: string): string {
	try {
		const u = new URL(url.trim());
		// Normaliza protocolo a https
		u.protocol = 'https:';
		// Host en minúsculas
		u.hostname = u.hostname.toLowerCase();
		// Elimina slash final del path
		if (u.pathname !== '/' && u.pathname.endsWith('/')) {
			u.pathname = u.pathname.slice(0, -1);
		}
		// Elimina parámetros de tracking comunes
		const params = Array.from(u.searchParams.entries()).filter(
			([k]) =>
				!/^utm_/.test(k) &&
				k !== 'fbclid' &&
				k !== 'gclid' &&
				k !== 'ref' &&
				k !== 'ref_src'
		);
		// Ordena los parámetros
		params.sort(([a], [b]) => a.localeCompare(b));
		u.search = params.length ? '?' + params.map(([k, v]) => `${k}=${v}`).join('&') : '';
		// Ignora hash
		u.hash = '';
		return u.toString();
	} catch {
		return url.trim();
	}
}

// --- CACHE RSS EN ARCHIVO LOCAL ---
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.resolve(__dirname, '../../.rss_feed_cache.json');
const FEED_CACHE_TTL = 15 * 60 * 1000; // 15 minutos en ms

function loadCacheFromFile(): Record<string, FeedCacheEntry> {
	try {
		if (fs.existsSync(CACHE_FILE)) {
			const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
			return JSON.parse(raw);
		}
	} catch (e) {
		console.warn('No se pudo leer el cache RSS local:', e);
	}
	return {};
}

function saveCacheToFile(cache: Record<string, FeedCacheEntry>) {
	try {
		fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8');
	} catch (e) {
		console.warn('No se pudo guardar el cache RSS local:', e);
	}
}

let FEED_CACHE: Record<string, FeedCacheEntry> = loadCacheFromFile();

export async function getFeedWithCache(
	parser: any,
	feedUrl: string,
	forceUpdate = false
): Promise<any[]> {
	const now = Date.now();
	const cache = FEED_CACHE[feedUrl];
	if (!forceUpdate && cache && now - cache.timestamp < FEED_CACHE_TTL) {
		return cache.items;
	}
	const feed = await parser.parseURL(feedUrl);
	const items = feed.items || [];
	FEED_CACHE[feedUrl] = { items, timestamp: now };
	saveCacheToFile(FEED_CACHE);
	return items;
}
// --- FIN CACHE ARCHIVO ---

// Tipo para la entrada de caché RSS
export type FeedCacheEntry = {
	items: any[];
	timestamp: number;
};
