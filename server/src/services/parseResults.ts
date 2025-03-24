import * as cheerio from 'cheerio';

interface SwimmerResult {
    name: string;
    time: string;
    splits: number[];
}

export const parseSwimmerResults = (html: string): SwimmerResult[] => {
    const $ = cheerio.load(html);
    const results: SwimmerResult[] = [];

    $('pre').each((_, element) => {
        const lines = $(element).text().split('\n');
        let currentSwimmer: Partial<SwimmerResult> = {};
        let splits: number[] = [];

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            // Check for name and time
            if (trimmedLine.match(/<span><\/span>(.*?)<span><\/span>(.*?)\d{1,2}:\d{2}\.\d{2}/)) {
                const match = trimmedLine.match(/<span><\/span>(.*?)<span><\/span>(\d{1,2}:\d{2}\.\d{2})/);
                if (match) {
                    currentSwimmer.name = match[1].trim();
                    currentSwimmer.time = match[2].trim();
                }
            }

            // Check for splits
            if (trimmedLine.match(/^\d{1,2}:\d{2}\.\d{2}/)) {
                const splitTimes = trimmedLine.match(/\d{1,2}:\d{2}\.\d{2}/g);
                if (splitTimes) {
                    splits.push(...splitTimes.map(time => parseFloat(time.replace(':', '.'))));
                }
            }
        });

        if (currentSwimmer.name && currentSwimmer.time) {
            currentSwimmer.splits = splits;
            results.push(currentSwimmer as SwimmerResult);
        }
    });


    return results;
}; 