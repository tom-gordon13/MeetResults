import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

interface Result {
    place: number,
    swimmerName: string,
    year: string,
    team: string,
    entryTime?: string,
    finalTime: string,
    reactionTime: number,
    splits: number[],
}


const ResultsTableRow = (result: Result) => {
    return (
        <TableRow>
            <TableCell>{result.place}</TableCell>
            <TableCell>{result.swimmerName}</TableCell>
            <TableCell>{result.team}</TableCell>
            <TableCell>{result.year}</TableCell>
            <TableCell>{result.finalTime}</TableCell>
        </TableRow>

    );
};

export default ResultsTableRow;
