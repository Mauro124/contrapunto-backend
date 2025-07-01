// Tipos principales para el análisis de noticias generado por IA

/**
 * Representa una noticia individual.
 */
export interface Article {
	title: string;
	snippet: string;
	url: string;
	source: string;
	publishedAt: string;
	keywords?: string[]; // Palabras clave relevantes
	[key: string]: any; // Para campos adicionales
}

/**
 * Resultado del análisis de sesgo político.
 */
export interface BiasResult {
	source: string;
	url: string;
	bias: string; // "Izquierda", "Derecha", "Centro", etc.
	biasScore?: number; // -1 (izquierda), 0 (centro), 1 (derecha)
	confidence: number; // 0-1
	explanation?: string; // Explicación detallada
}

/**
 * Resultado del análisis de actores favorecidos.
 */
export interface ActorResult {
	source: string;
	url: string;
	favoredActor: string;
	confidence: number; // 0-1
	explanation?: string;
}

/**
 * Noticia relacionada sugerida.
 */
export interface RelatedArticle {
	title: string;
	url: string;
	source: string;
}

/**
 * Entrada de glosario para términos complejos.
 */
export interface GlossaryEntry {
	term: string;
	definition: string;
}

export type DataUnit = 'porcentaje' | 'numero' | 'moneda' | 'cantidad' | 'nivel' | 'otro';

/**
 * Análisis de datos presentes en la noticia.
 */
export interface DataAnalysis {
	explanation: string;
	values: { label: string; value: number; unit: DataUnit }[];
	rawData?: any;
}

/**
 * Entidad persona mencionada en la noticia, con descripción contextual.
 */
export interface PersonEntity {
	name: string;
	description: string; // Breve descripción contextual si hay información fidedigna
}

/**
 * Resultado completo del análisis de una noticia individual.
 * Todos los campos que puede devolver la IA.
 */
export interface SingleNewsAnalysisResult {
	title: string;
	snippet: string;
	url: string;
	source: string;
	publishedAt: string;
	neutralSummary: string;
	biasAnalysis: BiasResult;
	actorAnalysis: ActorResult;
	contextInfo?: string; // Contexto histórico o relevante
	keywords?: string[];
	entities?: string[]; // Personas, organizaciones, lugares
	writingStyle?: string; // Ej: informativo, editorializado
	factCheck?: string; // Verificación de hechos
	glossary?: GlossaryEntry[];
	dataAnalysis?: DataAnalysis | null;
	politicalBiasScore?: number; // 0 (izquierda) a 1 (derecha)
	factualityScore?: number; // 0 a 1
	sensationalismScore?: number; // 0 a 1
	personEntities?: PersonEntity[]; // Personas mencionadas con descripción contextual
}

/**
 * Resultado de análisis de varias noticias (opcional, para análisis cruzado).
 */
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
