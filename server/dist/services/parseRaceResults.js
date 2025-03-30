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
exports.parseRaceResults = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const parseRaceResults = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield axios_1.default.get(url);
    const $ = cheerio.load(data);
    const results = [];
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
    let match;
    let splitMatches;
    while ((match = swimmerPattern.exec(relevantSection)) !== null) {
        const [, place, name, year, school, time] = match;
        // Find all split times below the swimmer's entry
        const remainingText = relevantSection.substring(match.index + match[0].length);
        const splits = [];
        while ((splitMatches = splitPattern.exec(remainingText)) !== null) {
            splits.push(splitMatches[1]);
        }
        results.push({ place, name, year, school, time, splits });
    }
    // console.log(results);
    return results;
});
exports.parseRaceResults = parseRaceResults;
