import axios from "axios";
import * as cheerio from "cheerio";

export const parseRaceResults = async (url: string) => {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const results: any[] = [];

    // Get all text content
    const text = $("pre").text();

    // Split by '===========' to find the right section
    const sections = text.split(/={10,}/); // Matches 10+ '=' characters

    if (sections.length < 3) {
        console.error("Could not find the expected section.");
        return;
    }

    const relevantSection = sections[2]; // Extract only the portion after the second '==========='

    // Process relevantSection with regex
    const swimmerPattern = /(\d+)\s+(.+?)\s+([A-Z]+)\s+([A-Za-z]+)\s+(\d{1}:\d{2}\.\d{2})/g;
    const splitPattern = /\((\d+\.\d{2})\)/g; // Captures numbers in parentheses

    let match: RegExpExecArray | null;
    let splitMatches: RegExpExecArray | null;

    while ((match = swimmerPattern.exec(relevantSection)) !== null) {
        const [, place, name, year, school, time] = match;

        // Find all split times below the swimmer's entry
        const remainingText = relevantSection.substring(match.index + match[0].length);
        const splits: string[] = [];

        while ((splitMatches = splitPattern.exec(remainingText)) !== null) {
            splits.push(splitMatches[1]);
        }

        results.push({ place, name, year, school, time, splits });
    }

    // console.log(results);
    return results;
};
