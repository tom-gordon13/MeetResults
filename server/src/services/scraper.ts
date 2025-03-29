import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { parseSwimmerResults } from './parseResults';
import { parseRaceResults } from './parseRaceResults';
import { parseHTMRequest } from './parseHTMrequest';

export interface ScrapingResult {
    title: string;
    description?: string;
    links: LinkInfo[];
    text: string;
    nestedResults?: NestedResult[];
    eventResults: object[]
}

interface LinkInfo {
    url: string;
    text: string;
}

interface NestedResult {
    url: string;
    preText: PreTagContent[];
    swimmerResults?: SwimmerResult[];
}

interface PreTagContent {
    fullText: string;
    summary: string;
    line2: string;
    line3: string;
}

interface SwimmerResult {
    name: string;
    time: string;
    splits: number[];
}

const resolveUrl = (baseUrl: string, path: string): string => {
    try {
        return new URL(path, baseUrl).href;
    } catch {
        return '';
    }
};

const scrapePreTags = async (url: string): Promise<PreTagContent[]> => {
    try {
        const response = await axios.get(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 5000
        });

        const $ = cheerio.load(response.data);
        const preTags: PreTagContent[] = [];

        $('pre').each((_, element) => {
            const $pre = $(element);
            const fullText = $pre.text().trim();

            let summary = '';
            let line2 = '';
            let line3 = '';
            const lines = fullText.split('\n');
            let equalSignCount = 0;
            let startIndex = -1;

            // Find the second row of equals signs
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().match(/={10,}/)) {
                    equalSignCount++;
                    if (equalSignCount === 2) {
                        startIndex = i + 1;
                        break;
                    }
                }
            }

            // Find lines starting with 1, 2 , and 3  after the second equals row
            if (startIndex !== -1) {
                for (let i = startIndex; i < lines.length; i++) {
                    const trimmedLine = lines[i].trim();
                    if (!summary && trimmedLine.startsWith('1')) {
                        summary = trimmedLine;
                    }
                    if (!line2 && trimmedLine.startsWith('2 ')) {
                        line2 = trimmedLine;
                    }
                    if (!line3 && trimmedLine.startsWith('3 ')) {
                        line3 = trimmedLine;
                    }
                    if (summary && line2 && line3) break;
                }
            }

            if (fullText) {
                preTags.push({
                    fullText,
                    summary: summary || fullText.slice(0, 100) + '...',
                    line2: line2 || '',
                    line3: line3 || ''
                });
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
        let eventResults: object[] = []
        let linkCount = 0;

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            const text = $(element).text().trim();
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                const absoluteUrl = resolveUrl(url, href);
                if (absoluteUrl) {
                    linkCount++;
                    if (linkCount > 2) {
                        links.push({
                            url: absoluteUrl,
                            text: text || absoluteUrl
                        });
                    }
                }
            }
        });

        if (depth === 0) {
            const firstFiveLinks = links.slice(0, 5);
            for (const link of firstFiveLinks) {
                console.log({ link })
                // parseHTMRequest(link.url)
                const singleEventResults = await parseHTMRequest(link.url)
                eventResults.push(singleEventResults)
                const preTexts = await scrapePreTags(link.url);
                const swimmerResults = parseSwimmerResults(preTexts.map(pt => pt.fullText).join('\n'));
                // const eventResults = parseRaceResults(link.url)
                if (preTexts.length > 0) {
                    nestedResults.push({
                        url: link.url,
                        preText: preTexts,
                        swimmerResults
                    });
                }
            }
        }

        return {
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content'),
            links,
            text: $('body').text().trim(),
            ...(depth === 0 && nestedResults.length > 0 ? { nestedResults } : {}),
            eventResults
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to scrape website';
        throw new Error(message);
    }
}; 