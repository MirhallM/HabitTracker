import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

// Next.js font optimization — self-hosts Inter and exposes it as a CSS variable.
// Apply `inter.variable` to the <html> or <body> className in app/layout.tsx.
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

// Colores fuera de la paleta MUI, usados en gráficas de Estadísticas/Dashboard
// (Recharts o MUI X Charts), para que las series respeten el sistema de diseño
// en vez de usar los colores por defecto de la librería.
export const chartColors = ['#5EC269', '#4E80EE', '#E9A23B', '#438E8F', '#DD524C'];

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5EC269',
      dark: '#438E8F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4E80EE',
      contrastText: '#FFFFFF',
    },
    success: { main: '#4CA154' },
    warning: { main: '#E9A23B' },
    error: { main: '#DD524C' },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111729',
      secondary: '#677389',
    },
    divider: 'rgba(17, 23, 41, 0.08)',
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: 'var(--font-inter), "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '3rem', lineHeight: 1.17, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2.25rem', lineHeight: 1.22, fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', lineHeight: 1.28, fontWeight: 600 },
    h4: { fontSize: '1.5rem', lineHeight: 1.33, fontWeight: 600 },
    h5: { fontSize: '1.25rem', lineHeight: 1.4, fontWeight: 600 },
    h6: { fontSize: '1.125rem', lineHeight: 1.44, fontWeight: 600 },
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 400 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 400 },
    caption: { fontSize: '0.75rem', lineHeight: 1.33, fontWeight: 400, color: '#677389' },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'none', // evita el ALL CAPS por defecto de MUI
    },
    button: { fontSize: '0.9375rem', fontWeight: 600, textTransform: 'none' },
  },

  spacing: 8, // 1 unidad = 8px, usar theme.spacing(n) en vez de valores fijos

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F8FAFC' },
      },
    },

    // Botones sin sombra, sin mayúsculas forzadas, radio propio del producto
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 20,
          paddingBlock: 9,
        },
        containedPrimary: {
          '&:hover': { backgroundColor: '#4FAE5A' },
        },
      },
    },

    // Cards planas con borde sutil en vez de la sombra gris genérica de MUI
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(17, 23, 41, 0.08)',
          boxShadow: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { boxShadow: '0 1px 2px rgba(17, 23, 41, 0.06)' },
      },
    },

    // Chips para categorías/prioridad de hábitos
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },

    // Inputs de formularios (login, registro, crear hábito)
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& fieldset': { borderColor: 'rgba(17, 23, 41, 0.14)' },
          '&:hover fieldset': { borderColor: '#5EC269' },
        },
      },
    },

    // Navbar superior
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#111729',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(17, 23, 41, 0.08)',
        },
      },
    },

    // Sidebar
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid rgba(17, 23, 41, 0.08)' },
      },
    },

    // Confirmaciones (eliminar hábito, etc.)
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },

    // Mensajes de éxito/error
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },

    // Barra de progreso de racha/cumplimiento
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 6, height: 8 },
      },
    },
  },
});

export default theme;
