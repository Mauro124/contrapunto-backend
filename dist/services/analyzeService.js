"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductInsights = void 0;
const ReviewProviderFactory_1 = require("../providers/ReviewProviderFactory");
const getProductInsights = async (url) => {
    let reviews = [];
    try {
        const provider = ReviewProviderFactory_1.ReviewProviderFactory.getProvider(url);
        reviews = await provider.getReviews(url);
    }
    catch (e) {
        // Si falla el scraping/API, usar mock
        reviews = [
            'Muy buen producto, me encantó!',
            'Funciona bien pero el empaque llegó dañado.',
            'No era lo que esperaba, pero cumple.',
            'Excelente calidad y precio.',
            'Hace mucho ruido.',
        ];
    }
    // Aquí iría el análisis real de IA, por ahora mock:
    return {
        summary: `Analizadas ${reviews.length} reseñas. La mayoría son positivas.`,
        pros: ['Fácil de usar', 'Buena relación calidad-precio', 'Entrega rápida'],
        cons: ['Puede ser ruidoso', 'El empaque podría mejorar'],
        emotionalTone: '😍',
        sentimentDistribution: {
            positive: 70,
            neutral: 20,
            negative: 10,
        },
    };
};
exports.getProductInsights = getProductInsights;
