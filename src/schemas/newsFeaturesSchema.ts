import { z } from 'genkit';

export const NewsFeaturesSchema = z.object({
	keywords: z.array(z.string()),
	entities: z.array(z.string()),
	summary: z.string(),
	topics: z.array(z.string()),
});
