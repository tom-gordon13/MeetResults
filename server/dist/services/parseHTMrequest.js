"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHTMRequest = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const fallbackHeader = {
    eventNumber: 1,
    eventName: 'fakeEvent',
    eventDistance: 500,
    isRelay: false
};
const parseHTMRequest = (url) => __awaiter(void 0, void 0, void 0, function* () {
    let browser;
    browser = yield puppeteer_core_1.default.launch({
        args: chrome_aws_lambda_1.default.args,
        defaultViewport: chrome_aws_lambda_1.default.defaultViewport,
        executablePath: yield chrome_aws_lambda_1.default.executablePath,
        headless: chrome_aws_lambda_1.default.headless,
    });
    const page = yield browser.newPage();
    let eventResults = [];
    try {
        yield page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.url().includes('.htm')) {
                console.log(`Request URL: ${request.url()}`);
                request.continue();
            }
            else {
                request.continue();
            }
        });
        const responsePromise = new Promise((resolve) => {
            page.on('response', (response) => __awaiter(void 0, void 0, void 0, function* () {
                if (response.url().includes('.htm')) {
                    const responseBody = yield response.text();
                    const eventInfo = extractHeader(responseBody);
                    const eventResults = extractResults(responseBody, eventInfo || fallbackHeader);
                    const eventDetails = {
                        eventInfo: eventInfo || fallbackHeader,
                        eventResults: eventResults
                    };
                    resolve(eventDetails);
                }
            }));
        });
        yield page.goto(url, { waitUntil: 'networkidle2' });
        const eventDetails = yield responsePromise;
        yield browser.close();
        return eventDetails;
    }
    catch (error) {
        console.error(`Failed to capture .htm request for ${url}:`, error);
        yield browser.close();
    }
});
exports.parseHTMRequest = parseHTMRequest;
const extractHeader = (content) => {
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
const extractResults = (content, eventHeader) => {
    const lines = content.split('\n');
    let equalSignCount = 0;
    let startIndex = -1;
    const results = [];
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
        let currentChunk = [];
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
            }
            else {
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
const parseIndividualResult = (chunk) => {
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
        const splits = [];
        const splitPattern = /(\d+\.\d{2})|\((\d+\.\d{2})\)/g; // Matches first normal split + numbers in parentheses
        let foundFirstSplit = false; // Track when the first split is encountered
        let splitMatch;
        while ((splitMatch = splitPattern.exec(chunk)) !== null) {
            if (!foundFirstSplit) {
                // First number after reaction time (either inside or outside ())
                splits.push(splitMatch[1] || splitMatch[2]);
                foundFirstSplit = true;
            }
            else if (splitMatch[2]) {
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
