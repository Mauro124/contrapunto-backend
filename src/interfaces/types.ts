export interface Article {
	title: string;
	snippet: string;
	url: string;
	source: string;
	publishedAt: string;
	keywords?: string[];
	[key: string]: any;
}

export interface BiasResult {
	source: string;
	url: string;
	bias: string; // e.g. "left", "right", "center", "unknown"
	biasScore?: number; // 1 (derecha), 0 (centro), -1 (izquierda)
	confidence: number;
	explanation?: string;
}

export interface ActorResult {
	source: string;
	url: string;
	favoredActor: string;
	confidence: number;
	explanation?: string;
}

export interface RelatedArticle {
	title: string;
	url: string;
	source: string;
}

export interface NewsAnalysisResult {
	original: Article;
	relatedArticles?: Article[];
	neutralSummary: string;
	politicalTendency?: string;
	politicalTendencyExplanation?: string;
	extraInfo?: string;
	biasAnalysis: BiasResult[];
	actorAnalysis: ActorResult[];
	relatedArticlesList?: RelatedArticle[];
}
