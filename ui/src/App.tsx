import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface ScrapingResult {
    title: string;
    description?: string;
    links: string[];
    text: string;
}

export const App = () => {
    const [url, setUrl] = useState<string>('');
    const [result, setResult] = useState<ScrapingResult | null>(null);
    const [error, setError] = useState<string>('');

    const handleScrape = async () => {
        try {
            const response = await axios.post('/api/scrape', { url });
            setResult(response.data);
            setError('');
        } catch (err: unknown) {
            const error = axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'An unknown error occurred';
            setError(error);
            setResult(null);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Web Scraper</h1>
                <div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL to scrape"
                        style={{ width: '300px', padding: '8px' }}
                    />
                    <button onClick={handleScrape} style={{ marginLeft: '10px', padding: '8px' }}>
                        Scrape
                    </button>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {result && (
                    <div style={{ textAlign: 'left', maxWidth: '800px', margin: '20px' }}>
                        <h2>Results:</h2>
                        <p><strong>Title:</strong> {result.title}</p>
                        {result.description && (
                            <p><strong>Description:</strong> {result.description}</p>
                        )}
                        <p><strong>Links found:</strong> {result.links.length}</p>
                        <div>
                            <strong>First 5 links:</strong>
                            <ul>
                                {result.links.slice(0, 5).map((link, index) => (
                                    <li key={index}>{link}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
};
