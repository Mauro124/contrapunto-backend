import { Article } from './types';
export interface INewsProvider {
	getRecentArticles(): Promise<Article[]>;
}
