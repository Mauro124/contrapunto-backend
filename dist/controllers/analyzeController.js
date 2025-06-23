"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProduct = void 0;
const analyzeService_1 = require("../services/analyzeService");
const analyzeProduct = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ error: 'Missing product URL' });
            return;
        }
        const insights = await (0, analyzeService_1.getProductInsights)(url);
        res.json(insights);
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.analyzeProduct = analyzeProduct;
