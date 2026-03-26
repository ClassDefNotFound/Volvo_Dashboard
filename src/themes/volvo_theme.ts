import { createTheme, responsiveFontSizes } from "@mui/material";

// 2026 Volvo XC40 exterior color palette
export const volvoColors = {
  sandDune: "#EFE9DD",
  cloudBlue: "#C8D4E1",
  crystalWhite: "#F2F2F2",
  onyxBlack: "#2D2926",
  denimBlue: "#4F5A78",
  vapourGrey: "#7B8082",
  auroraSilver: "#ACAAAE",
  forestLake: "#5A6363",
} as const;

let volvo_theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: volvoColors.cloudBlue,
      contrastText: volvoColors.vapourGrey,
    },
    secondary: {
      main: volvoColors.sandDune,
      contrastText: volvoColors.vapourGrey,
    },
    background: {
      default: volvoColors.forestLake,
      paper: volvoColors.vapourGrey,
    },
    text: {
      primary: volvoColors.crystalWhite,
      secondary: volvoColors.auroraSilver,
    },
    error: {
      main: "#CF6679",
    },
    warning: {
      main: volvoColors.sandDune,
    },
    info: {
      main: volvoColors.denimBlue,
    },
    success: {
      main: "#6B8F71",
    },
    divider: volvoColors.vapourGrey,
  },
  typography: {
    fontFamily: '"Jost", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 2,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

volvo_theme = responsiveFontSizes(volvo_theme);

export default volvo_theme;
