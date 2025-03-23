import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export interface ScrapingResult {
    title: string;
    description?: string;
    links: LinkInfo[];
    text: string;
    nestedResults?: NestedResult[];
}

interface LinkInfo {
    url: string;
    text: string;
}

interface NestedResult {
    url: string;
    preText: string[];
}

const resolveUrl = (baseUrl: string, path: string): string => {
    try {
        return new URL(path, baseUrl).href;
    } catch {
        return '';
    }
};

const scrapePreTags = async (url: string): Promise<string[]> => {
    try {
        const response = await axios.get(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 5000 // 5 second timeout
        });

        const $ = cheerio.load(response.data);
        const preTags: string[] = [];

        $('pre').each((_, element) => {
            const text = $(element).text().trim();
            if (text) {
                preTags.push(text);
                console.log(`Found <pre> content at ${url}:`, text);
            }
        });

        return preTags;
    } catch (error) {
        console.error(`Failed to scrape pre tags from ${url}:`, error);
        return [];
    }
};

export const scrapeWebsite = async (url: string, depth = 0): Promise<ScrapingResult> => {
    try {
        const response = await axios.get(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const links: LinkInfo[] = [];
        const nestedResults: NestedResult[] = [];

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            const text = $(element).text().trim();
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                const absoluteUrl = resolveUrl(url, href);
                if (absoluteUrl) {
                    links.push({
                        url: absoluteUrl,
                        text: text || absoluteUrl
                    });
                }
            }
        });

        if (depth === 0) {
            const firstFiveLinks = links.slice(0, 5);
            for (const link of firstFiveLinks) {
                const preTexts = await scrapePreTags(link.url);
                if (preTexts.length > 0) {
                    nestedResults.push({
                        url: link.url,
                        preText: preTexts
                    });
                }
            }
        }

        return {
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content'),
            links,
            text: $('body').text().trim(),
            ...(depth === 0 && nestedResults.length > 0 ? { nestedResults } : {})
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to scrape website';
        throw new Error(message);
    }
}; 