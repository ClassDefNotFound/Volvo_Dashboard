import { useMediaQuery, useTheme } from "@mui/material";

export function useBreakpoint() {
  const theme = useTheme();
  return {
    isMobile: useMediaQuery(theme.breakpoints.down("sm")),
    isTablet: useMediaQuery(theme.breakpoints.between("sm", "lg")),
    isDesktop: useMediaQuery(theme.breakpoints.up("lg")),
  };
}
