import { Router, Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const response = await axios.get('https://swimmeetresults.tech/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const links: { url: string; text: string }[] = [];

        // Find all <a> tags
        $('a').each((_, element) => {
            const href = $(element).attr('href');
            const text = $(element).text().trim();

            // Only include links that have both href and text
            if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
                links.push({
                    url: href.startsWith('http') ? href : `https://swimmeetresults.tech${href.startsWith('/') ? '' : '/'}${href}`,
                    text
                });
            }
        });

        res.json({ links });
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});

export default router; 