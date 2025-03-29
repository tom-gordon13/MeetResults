import React, { useState } from 'react';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Chip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import axios from 'axios';
import ResultsTable from './components/ResultsTable';

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
        preText: {
            fullText: string;
            summary: string;
            line2: string;
            line3: string;
        }[];
    }[];
}

export const App = () => {
    const [url, setUrl] = useState<string>('');
    const [result, setResult] = useState<ScrapingResult | null>(null);
    const [eventList, setEventList] = useState<any[] | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleScrape = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/scrape', { url });
            setResult(response.data);
            setEventList(response.data.eventResults)
            console.log(response.data.eventResults)
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
            <Container
                maxWidth="md"
                sx={{
                    px: isMobile ? 0 : 2
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: isMobile ? 2 : 4,
                        borderRadius: isMobile ? 0 : 1
                    }}
                >
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

                            {result.nestedResults && result.nestedResults.length > 0 && (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Events
                                    </Typography>
                                    {result.nestedResults.map((nested, index) => {
                                        const isPreliminaries = nested.preText.some(content => content.fullText.includes('=== Preliminaries ==='));
                                        const isChampionshipFinal = nested.preText.some(content => content.fullText.includes('=== Championship Final ==='));
                                        const isSwimOff = nested.preText.some(content => content.fullText.includes('=== - Swim-off ==='));

                                        // Only show if we have a corresponding event
                                        const currEvent = eventList && eventList[index];
                                        if (!currEvent) return null;

                                        return (
                                            <Accordion
                                                key={index}
                                                sx={{
                                                    mb: 1,
                                                    borderRadius: isMobile ? 0 : 1,
                                                    ...(isMobile && {
                                                        mx: -2, // Negative margin to extend to screen edges
                                                        width: 'calc(100% + 16px)' // Adjust width to account for negative margins
                                                    })
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        '& .MuiAccordionSummary-content': {
                                                            flexDirection: 'column'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography fontWeight={500} sx={{ mr: 1 }}>
                                                            {result.links[index]?.text || 'Link Content'}
                                                        </Typography>
                                                        {isPreliminaries && (
                                                            <Chip label="Preliminaries" color="primary" size="small" />
                                                        )}
                                                        {isChampionshipFinal && (
                                                            <Chip label="Championship Final" color="secondary" size="small" />
                                                        )}
                                                        {isSwimOff && (
                                                            <Chip label="Swim Off" color="warning" size="small" />
                                                        )}
                                                        {!isPreliminaries && !isChampionshipFinal && !isSwimOff && (
                                                            <Chip label="Event Not Started" color="default" size="small" />
                                                        )}
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                                        {nested.url}
                                                    </Typography>
                                                    {(isChampionshipFinal || isSwimOff) && nested.preText.length > 0 && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 1,
                                                                color: 'text.primary',
                                                                fontStyle: 'italic'
                                                            }}
                                                        >
                                                            <div>
                                                                <EmojiEventsIcon sx={{ color: 'gold', verticalAlign: 'middle', mr: 1 }} />
                                                                {nested.preText[0].summary}
                                                            </div>
                                                            {nested.preText[0].line2 && (
                                                                <div>
                                                                    <EmojiEventsIcon sx={{ color: 'silver', verticalAlign: 'middle', mr: 1 }} />
                                                                    {nested.preText[0].line2}
                                                                </div>
                                                            )}
                                                            {nested.preText[0].line3 && (
                                                                <div>
                                                                    <EmojiEventsIcon sx={{ color: '#cd7f32', verticalAlign: 'middle', mr: 1 }} />
                                                                    {nested.preText[0].line3}
                                                                </div>
                                                            )}
                                                        </Typography>
                                                    )}
                                                </AccordionSummary>
                                                <AccordionDetails
                                                    sx={{
                                                        p: isMobile ? 0 : 2
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            component="pre"
                                                            sx={{
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word',
                                                                bgcolor: 'grey.100',
                                                                p: isMobile ? 0 : 2,
                                                                borderRadius: isMobile ? 0 : 1,
                                                                fontFamily: 'monospace'
                                                            }}
                                                        >
                                                            {currEvent.eventInfo.eventName}
                                                            <ResultsTable results={currEvent.eventResults} isMobile={isMobile} />
                                                        </Typography>
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                                </>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};
