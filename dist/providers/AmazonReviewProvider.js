"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonReviewProvider = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class AmazonReviewProvider {
    async getReviews(url) {
        const browser = await puppeteer_1.default.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const reviews = await page.$$eval('.review-text-content span', (els) => els.map((e) => e.textContent?.trim() || ''));
        await browser.close();
        return reviews.filter(Boolean);
    }
}
exports.AmazonReviewProvider = AmazonReviewProvider;
