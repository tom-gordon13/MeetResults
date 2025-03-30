"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.scrapeWebsite = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
const parseResults_1 = require("./parseResults");
const parseHTMrequest_1 = require("./parseHTMrequest");
const resolveUrl = (baseUrl, path) => {
    try {
        return new url_1.URL(path, baseUrl).href;
    }
    catch (_a) {
        return '';
    }
};
const scrapePreTags = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 5000
        });
        const $ = cheerio.load(response.data);
        const preTags = [];
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
                    if (summary && line2 && line3)
                        break;
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
    }
    catch (error) {
        console.error(`Failed to scrape pre tags from ${url}:`, error);
        return [];
    }
});
const scrapeWebsite = (url, depth = 0) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const links = [];
        const nestedResults = [];
        let eventResults = [];
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
                console.log({ link });
                // parseHTMRequest(link.url)
                const singleEventResults = yield (0, parseHTMrequest_1.parseHTMRequest)(link.url);
                eventResults.push(singleEventResults);
                const preTexts = yield scrapePreTags(link.url);
                const swimmerResults = (0, parseResults_1.parseSwimmerResults)(preTexts.map(pt => pt.fullText).join('\n'));
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
        return Object.assign(Object.assign({ title: $('title').text(), description: $('meta[name="description"]').attr('content'), links, text: $('body').text().trim() }, (depth === 0 && nestedResults.length > 0 ? { nestedResults } : {})), { eventResults });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to scrape website';
        throw new Error(message);
    }
});
exports.scrapeWebsite = scrapeWebsite;
