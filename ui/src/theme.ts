import { createTheme } from '@mui/material';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0'
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2'
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff'
        }
    },
    typography: {
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500
        }
    }
}); 