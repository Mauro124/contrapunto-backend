import Parser from 'rss-parser';
import { IContentExtractor } from '../interfaces/IContentExtractor';
import { Article } from '../interfaces/types';
import { rssProviders } from '../providers/rssProviders';
import { extractKeywordsGenkit } from '../utils/genkitExtractKeywords';
import { normalizeUrl } from '../utils/normalizeUrl';
import { getFeedWithCache } from '../utils/normalizeUrl';

// Elimina la definición local de getFeedWithCache y el bloque de cache en memoria

export class RssContentExtractor implements IContentExtractor {
	async extract(url: string): Promise<Pick<Article, 'title' | 'snippet' | 'keywords' | 'url'>> {
		const parser = new Parser();
		console.log(`[RssContentExtractor] Buscando artículo en feeds para URL: ${url}`);
		const normalizedTarget = normalizeUrl(url);
		console.log(`[RssContentExtractor] URL normalizada: ${normalizedTarget}`);

		if (!url) {
			console.warn('[RssContentExtractor] URL vacía proporcionada, devolviendo objeto vacío');
			return {
				title: '',
				snippet: '',
				keywords: [],
				url: '',
			};
		}

		// Recolectar todas las promesas de feeds de todos los proveedores
		const feedTasks: Array<Promise<{ item: any; providerSource: string } | null>> = [];
		for (const rssProvider of rssProviders) {
			if (typeof (rssProvider as any).getFeedUrls !== 'function') continue;
			const feedUrls = (rssProvider as any).getFeedUrls();
			const providerSource = (rssProvider as any).source || '';
			for (const feedUrl of feedUrls) {
				if (!feedUrl) continue;
				feedTasks.push(
					(async () => {
						try {
							const items = await getFeedWithCache(parser, feedUrl);
							// Solo match exacto normalizado
							const item = items.find(
								(i) => normalizeUrl(i.link || '') === normalizedTarget
							);
							if (item) {
								return { item, providerSource };
							}
						} catch (e) {
							console.error(
								`[RssContentExtractor] Error consultando feed ${feedUrl}:`,
								e
							);
						}
						return null;
					})()
				);
			}
		}
		const results = await Promise.all(feedTasks);
		const found = results.find((r) => r && r.item);
		if (found) {
			const { item, providerSource } = found;
			const title = item.title || '';
			const snippet = item.contentSnippet || item.summary || '';
			const result: any = {
				title,
				snippet,
				keywords: [],
				url: item.link || url,
				// @ts-ignore
				source: providerSource,
			};
			if (url === item.link) {
				result.keywords = await extractKeywordsGenkit(`${title} ${snippet}`);
			}
			return result;
		}
		// Si no se encontró, intentar inferir el nombre de la fuente a partir de la URL
		let inferredSource = '';
		try {
			const urlObj = new URL(url);
			const host = urlObj.hostname.replace('www.', '');
			// Buscar coincidencia en los providers
			const match = rssProviders.find((p: any) => {
				if (!(p as any).source) return false;
				return (
					urlObj.hostname.includes((p as any).source.toLowerCase().replace(/\W/g, '')) ||
					(p as any).source
						.toLowerCase()
						.replace(/\W/g, '')
						.includes(urlObj.hostname.replace(/\W/g, ''))
				);
			});
			if (match && (match as any).source) {
				inferredSource = (match as any).source;
			} else {
				// fallback: usar dominio capitalizado
				inferredSource =
					host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
			}
		} catch {
			// fallback robusto: extraer dominio manualmente y capitalizar
			const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
			if (domainMatch && domainMatch[1]) {
				const domain = domainMatch[1].split('.')[0];
				inferredSource = domain.charAt(0).toUpperCase() + domain.slice(1);
			} else {
				inferredSource = 'Desconocido';
			}
		}
		return {
			title: '',
			snippet: '',
			keywords: [],
			url: url,
			// @ts-ignore
			source: inferredSource || 'Desconocido',
		};
	}
}
