"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_serverless_express_1 = __importDefault(require("aws-serverless-express"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const scraper_1 = __importDefault(require("./routes/scraper"));
const links_1 = __importDefault(require("./routes/links"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// app.use(express.static(path.join(__dirname, '../../ui/build')));
// app.get('/meet-results-api', (_req: Request, res: Response) => {
//     console.log('API test route hit');
//     res.json({ message: 'Server is running!' });
// });
// app.get('/', (_req: Request, res: Response) => {
//     res.json({ message: 'Lambda function is running!' });
// });
// app.get('/fetch-links', (_req: Request, res: Response) => {
//     res.json({ message: 'Yurt!' });
// });
// Routes
app.use('/', links_1.default);
app.use('/scrape', scraper_1.default);
// Serve React app for all other routes
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../ui/build/index.html'));
// });
// Basic test route
const server = aws_serverless_express_1.default.createServer(app);
const handler = (event, context) => {
    console.log('Lambda handler invoked');
    return aws_serverless_express_1.default.proxy(server, event, context);
};
exports.handler = handler;
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// }); 
