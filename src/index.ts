import express from 'express';
import cors from 'cors';
import { applyMiddleware } from './middleware';
import newsAnalysisRouter from './routes/newsAnalysis';
import { providers } from './interfaces/INewsProvider';

const app = express();
app.use(
	cors({
		origin: [...providers],
		credentials: true,
	})
);

app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3001;

applyMiddleware(app);

app.use(newsAnalysisRouter);

app.get('/', (_req, res) => {
	res.send('ContraPunto backend is running');
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
