import puppeteer from 'puppeteer';

interface EventHeader {
    eventNumber: number,
    eventName: string,
    eventDistance: number,
    isRelay: boolean
}

interface IndividualResult {
    place?: number;
    team?: string;
    swimmerName?: string;
    year?: string;
    entryTime?: string,
    finalTime?: string;
    splits?: number[];
    reactionTime?: number;
}

export const parseHTMRequest = async (url: string): Promise<void> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            if (request.url().includes('.htm')) {
                console.log(`Request URL: ${request.url()}`);
                request.continue();
            } else {
                request.continue();
            }
        });

        page.on('response', async (response) => {
            if (response.url().includes('.htm')) {
                const responseBody = await response.text();
                const eventHeader: EventHeader | null = extractHeader(responseBody);
                console.log(`Header from ${response.url()}:`, eventHeader);
                if (eventHeader) {
                    const results = extractResults(responseBody, eventHeader);
                    console.log(`Results from ${response.url()}:`, results);
                }
                await browser.close();
            }
        });

        await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (error) {
        console.error(`Failed to capture .htm request for ${url}:`, error);
        await browser.close();
    }
};

const extractHeader = (content: string): EventHeader | null => {
    const lines = content.split('\n');
    let header = '';
    let equalSignCount = 0;

    for (const line of lines) {
        header += line + '\n';
        if (line.trim().match(/={10,}/)) {
            equalSignCount++;
            if (equalSignCount === 2) {
                break;
            }
        }
    }

    const match = header.match(/<b>\s*Event\s+(\d+)\s+(.*?)<\/b>/i);
    if (match) {
        const eventNumber = parseInt(match[1], 10);
        const eventName = match[2].trim();
        const eventDistanceMatch = eventName.match(/(\d+)/);
        const eventDistance = eventDistanceMatch ? parseInt(eventDistanceMatch[1], 10) : 0;
        const isRelay = /relay/i.test(eventName);

        return {
            eventNumber,
            eventName,
            eventDistance,
            isRelay
        };
    }

    return null;
};

const extractResults = (content: string, eventHeader: EventHeader): IndividualResult[] => {
    const lines = content.split('\n');
    let equalSignCount = 0;
    let startIndex = -1;
    const results: IndividualResult[] = [];

    // Find the start index after the second set of 10 or more equals signs
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().match(/={10,}/)) {
            equalSignCount++;
            if (equalSignCount === 2) {
                startIndex = i + 1;
                break;
            }
        }
    }

    if (startIndex !== -1) {
        let currentChunk: string[] = [];
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            const match = line.match(/(\d+)\s*<span><\/span>(.*?)<span><\/span>/);

            if (match) {
                if (currentChunk.length > 0) {
                    // Process the current chunk
                    const result = parseIndividualResult(currentChunk.join('\n'));
                    results.push(result);
                    console.log(result);
                }
                currentChunk = [line]; // Start a new chunk
            } else {
                currentChunk.push(line);
            }
        }

        // Process the last chunk if it exists
        if (currentChunk.length > 0) {
            const result = parseIndividualResult(currentChunk.join('\n'));
            results.push(result);
            console.log(result);
        }
    }

    return results;
};

const parseIndividualResult = (chunk: string): IndividualResult => {
    const match = chunk.match(/(\d+)\s*<span><\/span>(.*?)<span><\/span>/);
    if (match) {
        const number = parseInt(match[1], 10);
        const fullString = match[2].trim();

        // Extract swimmerName
        const nameMatch = fullString.match(/^(.+?, .+?)(?=\s{2,})/);
        const swimmerName = nameMatch ? nameMatch[1] : '';

        // Extract year
        const yearMatch = fullString.match(/(\b[A-Z]{2}\b|\b5Y\b)/);
        const year = yearMatch ? yearMatch[1] : '';

        // Extract team
        const teamMatch = fullString.match(/(?:\b[A-Z]{2}\b|\b5Y\b)\s+(.+)/);
        const team = teamMatch ? teamMatch[1] : '';

        // Extract entryTime
        const entryTimeMatch = chunk.match(/<span><\/span>([\d:.]+)\s{2,}/);
        const entryTime = entryTimeMatch ? entryTimeMatch[1] : '';

        // Extract finalTime
        const finalTimeMatch = chunk.match(/[\d:.]+\s{2,}([\d:.]+)/);
        const finalTime = finalTimeMatch ? finalTimeMatch[1] : '';

        // Extract reactionTime
        const reactionTimeMatch = chunk.match(/r:\s*([+-][\d.]+)/);
        const reactionTime = reactionTimeMatch ? parseFloat(reactionTimeMatch[1]) : undefined;

        return {
            place: number,
            swimmerName,
            year,
            team,
            entryTime,
            finalTime,
            reactionTime
        };
    }
    return {};
};