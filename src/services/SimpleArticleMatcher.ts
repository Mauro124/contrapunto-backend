import { IArticleMatcher } from '../interfaces/IArticleMatcher';
import { Article } from '../interfaces/types';
import natural from 'natural';

const STOPWORDS = new Set([
	'de',
	'la',
	'que',
	'el',
	'en',
	'y',
	'a',
	'los',
	'del',
	'se',
	'las',
	'por',
	'un',
	'para',
	'con',
	'no',
	'una',
	'su',
	'al',
	'lo',
	'como',
	'más',
	'pero',
	'sus',
	'le',
	'ya',
	'o',
	'este',
	'sí',
	'porque',
	'esta',
	'entre',
	'cuando',
	'muy',
	'sin',
	'sobre',
	'también',
	'me',
	'hasta',
	'hay',
	'donde',
	'quien',
	'desde',
	'todo',
	'nos',
	'durante',
	'todos',
	'uno',
	'les',
	'ni',
	'contra',
	'otros',
	'ese',
	'eso',
	'ante',
	'ellos',
	'e',
	'esto',
	'mí',
	'antes',
	'algunos',
	'qué',
	'unos',
	'yo',
	'otro',
	'otras',
	'otra',
	'él',
	'tanto',
	'esa',
	'estos',
	'mucho',
	'quienes',
	'nada',
	'muchos',
	'cual',
	'poco',
	'ella',
	'estar',
	'estas',
	'algunas',
	'algo',
	'nosotros',
	'mi',
	'mis',
	'tú',
	'te',
	'ti',
	'tu',
	'tus',
	'ellas',
	'nosotras',
	'vosotros',
	'vosotras',
	'os',
	'mío',
	'mía',
	'míos',
	'mías',
	'tuyo',
	'tuya',
	'tuyos',
	'tuyas',
	'suyo',
	'suya',
	'suyos',
	'suyas',
	'nuestro',
	'nuestra',
	'nuestros',
	'nuestras',
	'vuestro',
	'vuestra',
	'vuestros',
	'vuestras',
	'esos',
	'esas',
	'estoy',
	'estás',
	'está',
	'estamos',
	'estáis',
	'están',
	'esté',
	'estés',
	'estemos',
	'estéis',
	'estén',
	'estaré',
	'estarás',
	'estará',
	'estaremos',
	'estaréis',
	'estarán',
	'estaría',
	'estarías',
	'estaríamos',
	'estaríais',
	'estarían',
	'estaba',
	'estabas',
	'estábamos',
	'estabais',
	'estaban',
	'estuve',
	'estuviste',
	'estuvo',
	'estuvimos',
	'estuvisteis',
	'estuvieron',
	'estuviera',
	'estuvieras',
	'estuviéramos',
	'estuvierais',
	'estuvieran',
	'estuviese',
	'estuvieses',
	'estuviésemos',
	'estuvieseis',
	'estuviesen',
	'estando',
	'estado',
	'estada',
	'estados',
	'estadas',
	'estad',
]);

function normalize(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // quitar tildes
		.replace(/[^\w\s]/g, ''); // quitar signos
}

export function extractKeywords(text: string, maxKeywords = 8): string[] {
	const TfIdf = natural.TfIdf;
	const tfidf = new TfIdf();
	tfidf.addDocument(text);
	const terms = tfidf
		.listTerms(0)
		.filter((t) => t.term.length > 2)
		.slice(0, maxKeywords)
		.map((t) => t.term);
	return terms;
}

function tokenize(text: string): Set<string> {
	return new Set(normalize(text).split(/\s+/).filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
	const intersection = new Set([...a].filter((x) => b.has(x)));
	const union = new Set([...a, ...b]);
	return union.size === 0 ? 0 : intersection.size / union.size;
}

export class SimpleArticleMatcher implements IArticleMatcher {
	constructor(private threshold: number = 0.2) {}

	async findRelatedArticles(
		original: Pick<Article, 'title' | 'snippet' | 'keywords'>,
		candidates: Article[]
	): Promise<Article[]> {
		const originalKeywords =
			original.keywords && original.keywords.length > 0
				? original.keywords
				: extractKeywords(original.title + ' ' + original.snippet);
		const originalTokens = tokenize(
			original.title + ' ' + original.snippet + ' ' + originalKeywords.join(' ')
		);
		return candidates.filter((article) => {
			const candidateKeywords =
				article.keywords && article.keywords.length > 0
					? article.keywords
					: extractKeywords(article.title + ' ' + article.snippet);
			const candidateTokens = tokenize(
				article.title + ' ' + article.snippet + ' ' + candidateKeywords.join(' ')
			);
			const score = jaccard(originalTokens, candidateTokens);

			console.log(
				`[SimpleArticleMatcher] Evaluando "${article.title}" con score: ${score.toFixed(
					2
				)} | keywords: [${candidateKeywords.join(', ')}]`
			);

			// Substring matching
			const origTitle = normalize(original.title || '');
			const candTitle = normalize(article.title || '');
			const substringMatch =
				origTitle &&
				candTitle &&
				(origTitle.includes(candTitle) || candTitle.includes(origTitle));

			if (score > 0 || substringMatch) {
				console.log(
					`[SimpleArticleMatcher] Similitud con "${article.title}": ${score.toFixed(2)}${
						substringMatch ? ' (substring match)' : ''
					}`
				);
			}
			return score >= this.threshold || substringMatch;
		});
	}
}
