import awsServerlessExpress from 'aws-serverless-express'
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scraperRoutes from './routes/scraper';
import linksRoutes from './routes/links';
import path from 'path';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
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
app.use('/', linksRoutes);
app.use('/scrape', scraperRoutes);

// Serve React app for all other routes
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../ui/build/index.html'));
// });

// Basic test route


const server = awsServerlessExpress.createServer(app);

export const handler = (event: any, context: any) => {
    console.log('Lambda handler invoked');
    return awsServerlessExpress.proxy(server, event, context);
};

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// }); 