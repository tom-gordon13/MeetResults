import React, { useState, useRef, useEffect } from 'react';
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
    const [expandedPanel, setExpandedPanel] = useState<number | false>(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isScrolled, setIsScrolled] = useState(false);
    const accordionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Handle scroll events to determine if we need to make the header sticky
    useEffect(() => {
        const handleScroll = () => {
            if (expandedPanel !== false) {
                const scrollPosition = window.scrollY;
                const accordionTop = accordionRefs.current[expandedPanel]?.getBoundingClientRect().top || 0;
                setIsScrolled(accordionTop < 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [expandedPanel]);

    const handleScrape = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post('/api/scrape', { url });
            setResult(response.data);
            setEventList(response.data.eventResults);
            console.log(response.data.eventResults);
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

    const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedPanel(isExpanded ? panel : false);
        setIsScrolled(false); // Reset scroll state when changing panels
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
                        Events Scraper
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

                            <>
                                <Typography variant="h6" gutterBottom>
                                    Events
                                </Typography>
                                {eventList && eventList.map((currEvent, index) => {
                                    // Only show if we have a corresponding event
                                    if (!currEvent) return null;

                                    return (
                                        <Accordion
                                            key={index}
                                            expanded={expandedPanel === index}
                                            onChange={handleAccordionChange(index)}
                                            ref={el => accordionRefs.current[index] = el}
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
                                                    },
                                                    ...(expandedPanel === index && isScrolled && {
                                                        position: 'sticky',
                                                        top: 0,
                                                        zIndex: 10,
                                                        backgroundColor: 'background.paper',
                                                        boxShadow: 1
                                                    })
                                                }}
                                            >
                                                <Typography>{currEvent.eventInfo.eventName}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails
                                                sx={{
                                                    p: isMobile ? 0 : 2
                                                }}
                                            >
                                                <Box>
                                                    <ResultsTable results={currEvent.eventResults} isMobile={isMobile} />
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                            </>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};
