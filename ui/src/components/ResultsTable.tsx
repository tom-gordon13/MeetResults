import React, { useState, createContext, useContext } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Collapse, IconButton, Typography, Switch, FormControlLabel } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

interface Result {
    place?: number;
    swimmerName?: string;
    team?: string;
    year?: string;
    entryTime?: string;
    finalTime?: string;
    reactionTime?: number;
    splits?: string[];
}

interface ResultsTableProps {
    results: Result[];
    isMobile?: boolean;
}

// Create a context to manage the global open/close state
interface SplitsContextType {
    globalOpen: boolean;
    toggleGlobalOpen: () => void;
    registerRow: (id: number, hasSplits: boolean) => void;
}

const SplitsContext = createContext<SplitsContextType>({
    globalOpen: false,
    toggleGlobalOpen: () => { },
    registerRow: () => { }
});

const testData = [
    {
        place: 30,
        swimmerName: "Jett, Gabriel",
        year: "SR",
        team: "California",
        entryTime: "",
        finalTime: "4:15.65",
        reactionTime: 0.67,
        splits: [],
    },
    {
        place: 12,
        swimmerName: "Smith, John",
        year: "JR",
        team: "Texas",
        entryTime: "4:20.00",
        finalTime: "4:17.45",
        reactionTime: 0.72,
        splits: [],
    },
    {
        place: 12,
        swimmerName: "Smith, John",
        year: "JR",
        team: "Texas",
        entryTime: "4:20.00",
        finalTime: "4:17.45",
        reactionTime: 0.72,
        splits: [],
    },
    {
        place: 12,
        swimmerName: "Smith, John",
        year: "JR",
        team: "Texas",
        entryTime: "4:20.00",
        finalTime: "4:17.45",
        reactionTime: 0.72,
        splits: [],
    },
    {
        place: 12,
        swimmerName: "Smith, John",
        year: "JR",
        team: "Texas",
        entryTime: "4:20.00",
        finalTime: "4:17.45",
        reactionTime: 0.72,
        splits: [],
    },
    {
        place: 12,
        swimmerName: "Smith, John",
        year: "JR",
        team: "Texas",
        entryTime: "4:20.00",
        finalTime: "4:17.45",
        reactionTime: 0.72,
        splits: [],
    }
];

// Row component to handle the expansion logic
const Row = ({ result, isMobile, index }: { result: Result, isMobile: boolean, index: number }) => {
    const { globalOpen, registerRow } = useContext(SplitsContext);
    const [localOpen, setLocalOpen] = useState(false);
    const hasSplits = result.splits && result.splits.length > 0;

    // Register this row with the context when mounted
    React.useEffect(() => {
        if (hasSplits) {
            registerRow(index, true);
        }
    }, [hasSplits, index, registerRow]);

    // Determine if the row should be open based on local state or global state
    const isOpen = localOpen || globalOpen;

    return (
        <>
            <TableRow>
                <TableCell
                    sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        backgroundColor: 'background.paper'
                    }}
                >
                    {result.place}
                </TableCell>
                <TableCell
                    sx={{
                        position: 'sticky',
                        left: '60px',
                        zIndex: 2,
                        backgroundColor: 'background.paper'
                    }}
                >
                    {result.swimmerName}
                </TableCell>
                <TableCell>{result.team}</TableCell>
                <TableCell>{result.year}</TableCell>
                <TableCell>{result.entryTime}</TableCell>
                <TableCell>{result.finalTime}</TableCell>
                <TableCell>
                    {hasSplits && (
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setLocalOpen(!localOpen)}
                        >
                            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            {hasSplits && (
                <TableRow>
                    <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={7}
                    >
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Splits
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {result.splits?.map((split, i) => (
                                        <Box key={i} sx={{
                                            p: 1,
                                            border: '1px solid #ddd',
                                            borderRadius: 1,
                                            minWidth: '60px',
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {i * 50 + 50}m
                                            </Typography>
                                            <Typography>
                                                {split}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isMobile = false }) => {
    const [globalOpen, setGlobalOpen] = useState(false);
    const [rowsWithSplits, setRowsWithSplits] = useState<number[]>([]);

    // Toggle all splits open/closed
    const toggleGlobalOpen = () => {
        setGlobalOpen(!globalOpen);
    };

    // Register rows that have splits
    const registerRow = (id: number, hasSplits: boolean) => {
        if (hasSplits && !rowsWithSplits.includes(id)) {
            setRowsWithSplits(prev => [...prev, id]);
        }
    };

    // Only show the toggle switch if there are rows with splits
    const showToggleSwitch = rowsWithSplits.length > 0;

    return (
        <SplitsContext.Provider value={{ globalOpen, toggleGlobalOpen, registerRow }}>
            <Box sx={{
                width: '100%',
                overflow: 'hidden',
                ...(isMobile && {
                    mx: -2,
                    width: 'calc(100% + 16px)'
                })
            }}>
                {showToggleSwitch && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mb: 1,
                        pr: 2
                    }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={globalOpen}
                                    onChange={toggleGlobalOpen}
                                    color="primary"
                                />
                            }
                            label={globalOpen ? "Hide All Splits" : "Show All Splits"}
                            labelPlacement="start"
                        />
                    </Box>
                )}

                <TableContainer
                    component={Paper}
                    sx={{
                        maxWidth: '100%',
                        margin: "auto",
                        mt: 1,
                        overflowX: 'auto',
                        ...(isMobile && {
                            borderRadius: 0,
                            boxShadow: 'none'
                        })
                    }}
                >
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 3,
                                        backgroundColor: 'background.paper',
                                        minWidth: '60px'
                                    }}
                                >
                                    <b>#</b>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        position: 'sticky',
                                        left: '60px',
                                        zIndex: 3,
                                        backgroundColor: 'background.paper',
                                        minWidth: '150px'
                                    }}
                                >
                                    <b>Swimmer</b>
                                </TableCell>
                                <TableCell sx={{ minWidth: '100px' }}><b>Team</b></TableCell>
                                <TableCell sx={{ minWidth: '60px' }}><b>Yr.</b></TableCell>
                                <TableCell sx={{ minWidth: '100px' }}><b>Entry Time</b></TableCell>
                                <TableCell sx={{ minWidth: '100px' }}><b>Final Time</b></TableCell>
                                <TableCell sx={{ minWidth: '50px' }}><b>Splits</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.map((result, index) => (
                                <Row key={index} result={result} isMobile={isMobile} index={index} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </SplitsContext.Provider>
    );
};

export default ResultsTable;
