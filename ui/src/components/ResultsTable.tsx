import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@mui/material";
import ResultsTableRow from "./ResultsTableRow";

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

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isMobile = false }) => {
    // console.log({ results })
    return (
        <Box sx={{
            width: '100%',
            overflow: 'hidden',
            ...(isMobile && {
                mx: -2,
                width: 'calc(100% + 16px)'
            })
        }}>
            <TableContainer
                component={Paper}
                sx={{
                    maxWidth: '100%',
                    margin: "auto",
                    mt: 4,
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result, index) => (
                            // {testData.map((result, index) => (
                            <TableRow key={index}>
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ResultsTable;
