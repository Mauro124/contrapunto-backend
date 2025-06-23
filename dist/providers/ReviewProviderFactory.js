"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewProviderFactory = void 0;
const AmazonReviewProvider_1 = require("./AmazonReviewProvider");
const MercadoLibreReviewProvider_1 = require("./MercadoLibreReviewProvider");
class ReviewProviderFactory {
    static getProvider(url) {
        if (url.includes('amazon.'))
            return new AmazonReviewProvider_1.AmazonReviewProvider();
        if (url.includes('mercadolibre.'))
            return new MercadoLibreReviewProvider_1.MercadoLibreReviewProvider();
        throw new Error('No hay proveedor de reviews para esta URL');
    }
}
exports.ReviewProviderFactory = ReviewProviderFactory;
