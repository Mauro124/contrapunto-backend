import { Article } from './types';
export interface IContentExtractor {
	extract(url: string): Promise<Pick<Article, 'title' | 'snippet' | 'keywords' | 'url'>>;
}
