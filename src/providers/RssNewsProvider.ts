import Parser from 'rss-parser';
import { INewsProvider } from '../interfaces/INewsProvider';
import { Article } from '../interfaces/types';

export class RssNewsProvider implements INewsProvider {
	constructor(private source: string, private feedUrls: string[]) {}

	getFeedUrls(): string[] {
		return this.feedUrls;
	}

	async getRecentArticles(): Promise<Article[]> {
		const parser = new Parser();
		const seenUrls = new Set<string>();
		let allArticles: Article[] = [];
		for (const feedUrl of this.feedUrls) {
			console.log(`[RssNewsProvider] Fetching feed for ${this.source}: ${feedUrl}`);
			try {
				const feed = await parser.parseURL(feedUrl);
				console.log(
					`[RssNewsProvider] Fetched ${feed.items?.length || 0} items for ${
						this.source
					} (${feedUrl})`
				);
				for (const item of feed.items || []) {
					const url = item.link || '';
					if (!url || seenUrls.has(url)) continue;
					seenUrls.add(url);
					allArticles.push({
						title: item.title || '',
						snippet: item.contentSnippet || item.summary || '',
						url,
						source: this.source,
						publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
						keywords: [],
					});
				}
			} catch (err) {
				console.error(
					`[RssNewsProvider] Error fetching/parsing feed for ${this.source} (${feedUrl}):`,
					err
				);
			}
		}
		return allArticles;
	}
}
