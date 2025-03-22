import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapingResult {
    title: string;
    description?: string;
    links: string[];
    text: string;
}

export const scrapeWebsite = async (url: string): Promise<ScrapingResult> => {
    try {
        const response = await axios.get(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        const result: ScrapingResult = {
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content'),
            links: [],
            text: $('body').text().trim()
        };

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                result.links.push(href);
            }
        });

        return result;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to scrape website';
        throw new Error(message);
    }
}; 