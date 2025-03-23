import { Router, Request, Response } from 'express';
import { scrapeWebsite } from '../services/scraper';

const router = Router();

router.post('/scrape', async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        console.log('Scraping URL:', url);

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        const result = await scrapeWebsite(url);

        // Log nested results
        if (result.nestedResults) {
            console.log('Nested scraping results:');
            result.nestedResults.forEach(nested => {
                console.log(`\nFrom ${nested.url}:`);
                nested.preText.forEach(text => console.log('Pre tag content:', text));
            });
        }

        res.json(result);
    } catch (error: unknown) {
        console.error('Scraping error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ error: message });
    }
});

export default router; 