import React, { useState } from 'react';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

interface ScrapingResult {
    title: string;
    description?: string;
    links: {
        url: string;
        text: string;
    }[];
    text: string;
    nestedResults?: {
        url: string;
        preText: string[];
    }[];
}

export const App = () => {
    const [url, setUrl] = useState<string>('');
    const [result, setResult] = useState<ScrapingResult | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleScrape = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/scrape', { url });
            setResult(response.data);
        } catch (err: unknown) {
            const error = axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'An unknown error occurred';
            setError(error);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h1" gutterBottom align="center" color="primary">
                        Web Scraper
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter URL to scrape"
                            disabled={loading}
                        />
                        <Button
                            variant="contained"
                            onClick={handleScrape}
                            disabled={loading || !url}
                            sx={{ minWidth: 100 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Scrape'}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {result && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h2" color="primary" gutterBottom>
                                Results
                            </Typography>

                            <Typography variant="h6" gutterBottom>
                                Title:
                            </Typography>
                            <Typography paragraph color="text.secondary">
                                {result.title}
                            </Typography>

                            {result.description && (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Description:
                                    </Typography>
                                    <Typography paragraph color="text.secondary">
                                        {result.description}
                                    </Typography>
                                </>
                            )}

                            <Typography variant="h6" gutterBottom>
                                Links found: {result.links.length}
                            </Typography>

                            <List sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 4 }}>
                                {result.links.slice(0, 5).map((link, index) => (
                                    <ListItem key={index} divider={index !== 4}>
                                        <ListItemText
                                            primary={link.text}
                                            secondary={link.url}
                                            sx={{
                                                '& .MuiListItemText-primary': { fontWeight: 500 },
                                                '& .MuiListItemText-secondary': { wordBreak: 'break-all' }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            {result.nestedResults && result.nestedResults.length > 0 && (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Pre Tag Content
                                    </Typography>
                                    {result.nestedResults.map((nested, index) => (
                                        <Accordion key={index} sx={{ mb: 1 }}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                sx={{
                                                    '& .MuiAccordionSummary-content': {
                                                        flexDirection: 'column'
                                                    }
                                                }}
                                            >
                                                <Typography fontWeight={500}>
                                                    {result.links[index]?.text || 'Link Content'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                                    {nested.url}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                {nested.preText.map((text, preIndex) => (
                                                    <Box key={preIndex}>
                                                        {preIndex > 0 && <Divider sx={{ my: 2 }} />}
                                                        <Typography
                                                            component="pre"
                                                            sx={{
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word',
                                                                bgcolor: 'grey.100',
                                                                p: 2,
                                                                borderRadius: 1,
                                                                fontFamily: 'monospace'
                                                            }}
                                                        >
                                                            {text}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};
