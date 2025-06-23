"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("./middleware");
const analyze_1 = __importDefault(require("./routes/analyze"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
(0, middleware_1.applyMiddleware)(app);
app.use(analyze_1.default);
app.get('/', (_req, res) => {
    res.send('ReviewAI backend is running');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
