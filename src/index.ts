import express from 'express';
import cors from 'cors';
import { applyMiddleware } from './middleware';
import newsAnalysisRouter from './routes/newsAnalysis';

const app = express();
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);

app.use(express.json());

const PORT = process.env.PORT || 3001;

applyMiddleware(app);

app.use(newsAnalysisRouter);

app.get('/', (_req, res) => {
	res.send('ContraPunto backend is running');
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
