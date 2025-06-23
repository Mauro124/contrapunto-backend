"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoLibreReviewProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class MercadoLibreReviewProvider {
    extractItemId(url) {
        const match = url.match(/ML[A-Z]{2}-(\d+)/i) ||
            url.match(/\/ML[A-Z]{2}-(\d+)/i) ||
            url.match(/\/ML[A-Z]{2}(\d+)/i);
        if (match && match[1])
            return match[1];
        const alt = url.match(/ML[A-Z]{2}\d{9,}/i);
        return alt ? alt[0] : null;
    }
    async getReviews(url) {
        const itemId = this.extractItemId(url);
        if (!itemId)
            throw new Error('No se pudo extraer el item_id de la URL de MercadoLibre');
        const apiUrl = `https://api.mercadolibre.com/reviews/item/${itemId}`;
        const response = await axios_1.default.get(apiUrl);
        const data = response.data;
        const reviews = data.reviews?.map((r) => r.content) || [];
        return reviews;
    }
}
exports.MercadoLibreReviewProvider = MercadoLibreReviewProvider;
