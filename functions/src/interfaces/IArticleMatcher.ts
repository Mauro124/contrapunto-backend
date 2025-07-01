import { Article } from './types';
export interface IArticleMatcher {
	findRelatedArticles(
		original: Pick<Article, 'title' | 'snippet' | 'keywords'>,
		candidates: Article[]
	): Promise<Article[]>;
}
