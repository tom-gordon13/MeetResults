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
    splits?: string[];
    reactionTime?: number;
}

interface EventDetails {
    eventInfo: EventHeader,
    eventResults: IndividualResult[]
}

const fallbackHeader = {
    eventNumber: 1,
    eventName: 'fakeEvent',
    eventDistance: 500,
    isRelay: false
}

export const parseHTMRequest = async (url: string): Promise<any> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let eventResults: any[] = []

    try {
        await page.setRequestInterception(true);

        page.on('request', (request: any) => {
            if (request.url().includes('.htm')) {
                console.log(`Request URL: ${request.url()}`);
                request.continue();
            } else {
                request.continue();
            }
        });

        const responsePromise = new Promise<EventDetails>((resolve) => {
            page.on('response', async (response: any) => {
                if (response.url().includes('.htm')) {
                    const responseBody = await response.text();
                    const eventInfo: EventHeader | null = extractHeader(responseBody);
                    const eventResults: IndividualResult[] = extractResults(responseBody, eventInfo || fallbackHeader);
                    const eventDetails: EventDetails = {
                        eventInfo: eventInfo || fallbackHeader,
                        eventResults: eventResults
                    }
                    resolve(eventDetails);
                }
            });
        });

        await page.goto(url, { waitUntil: 'networkidle2' });
        const eventDetails = await responsePromise;


        await browser.close();
        return eventDetails;
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
                    // console.log(result);
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
            // console.log(result);
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

        const splits: string[] = [];
        const splitPattern = /(\d+\.\d{2})|\((\d+\.\d{2})\)/g; // Matches first normal split + numbers in parentheses
        let foundFirstSplit = false; // Track when the first split is encountered

        let splitMatch: RegExpExecArray | null;
        while ((splitMatch = splitPattern.exec(chunk)) !== null) {
            if (!foundFirstSplit) {
                // First number after reaction time (either inside or outside ())
                splits.push(splitMatch[1] || splitMatch[2]);
                foundFirstSplit = true;
            } else if (splitMatch[2]) {
                // Only capture numbers inside parentheses after the first split
                splits.push(splitMatch[2]);
            }

            // Stop if we encounter a number that looks like a new swimmer place value
            if (match.index && splitMatch.index > match.index && chunk.substring(splitMatch.index).match(/^\d+\s/)) {
                break;
            }
        }

        return {
            place: number,
            swimmerName,
            year,
            team,
            entryTime,
            finalTime,
            reactionTime,
            splits
        };
    }
    return {};
};