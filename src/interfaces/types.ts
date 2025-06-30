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

export interface GlossaryEntry {
	term: string;
	definition: string;
}

export type DataUnit = 'porcentaje' | 'numero' | 'moneda' | 'cantidad' | 'nivel' | 'otro';

export interface DataAnalysis {
	explanation: string;
	values: { label: string; value: number; unit: DataUnit }[];
	rawData?: any;
}

export interface SingleNewsAnalysisResult {
	title: string;
	snippet: string;
	url: string;
	source: string;
	publishedAt: string;
	neutralSummary: string;
	biasAnalysis: BiasResult;
	actorAnalysis: ActorResult;
	contextInfo: string;
	keywords?: string[];
	entities?: string[];
	writingStyle?: string;
	factCheck?: string;
	glossary?: GlossaryEntry[];
	dataAnalysis?: DataAnalysis;
	politicalBiasScore: number; // 0 (izquierda) a 1 (derecha)
	factualityScore: number; // 0 a 1
	sensationalismScore: number; // 0 a 1
}
