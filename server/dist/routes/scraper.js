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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scraper_1 = require("../services/scraper");
const router = (0, express_1.Router)();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        console.log('Scraping URL:', url);
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Validate URL format
        try {
            new URL(url);
        }
        catch (error) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        const result = yield (0, scraper_1.scrapeWebsite)(url);
        console.log(result);
        res.json(Object.assign({}, result));
    }
    catch (error) {
        console.error('Scraping error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ error: message });
    }
}));
exports.default = router;
