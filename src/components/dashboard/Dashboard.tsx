import { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";

import { getVehicles } from "@api/volvo_api";
import VinSelector from "./appbar/VinSelector";

import SettingsIcon from "@mui/icons-material/Settings";
import WebDash from "./WebDash";
import MobileDash from "./MobileDash";

import { useBreakpoint } from "@hooks/useBreakpoint";
import { useVin } from "@hooks/useVin";

const Dashboard = () => {
  const [availableVins, setAvailableVins] = useState<string[]>([]);

  const { setVin } = useVin();

  const theme = useTheme();

  useEffect(() => {
    async function fetchVehicles() {
      const vehicles = await getVehicles();
      setAvailableVins(vehicles.data.data.map((v) => v.vin));
      setVin(vehicles.data.data[0].vin);
    }
    fetchVehicles();
  }, [setVin]);

  const { isMobile } = useBreakpoint();

  function renderTitle() {
    return (
      <Box
        component="img"
        src="/src/assets/volvo_logo.svg"
        alt="Volvo"
        sx={{ maxWidth: { xs: 100, sm: 200, md: 300 } }}
      />
    );
  }

  function renderLogoutOrSettings() {
    if (isMobile)
      return (
        <IconButton aria-label="settings" size="small" color="primary">
          <SettingsIcon />
        </IconButton>
      );
    return (
      <Button
        variant="contained"
        sx={{
          color: theme.palette.secondary.contrastText,
          ":hover": { color: theme.palette.text.primary },
        }}
      >
        Logout
      </Button>
    );
  }

  return (
    <Stack spacing={1} width="100%" height="100dvh" overflow="hidden">
      <AppBar
        position="static"
        sx={{
          maxHeight: "max-content",
          width: "auto",
          padding: 1,
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
          }}
        >
          {renderTitle()}
          <Box
            sx={{
              display: "flex",
              width: {
                xs: "60%",
                sm: "50%",
              },
              justifyContent: {
                xs: "flex-end",
                sm: "space-between",
              },
              gap: 1,
            }}
          >
            <VinSelector vins={availableVins} />
            {renderLogoutOrSettings()}
          </Box>
        </Box>
      </AppBar>
      {isMobile ? <MobileDash /> : <WebDash />}
    </Stack>
  );
};

export default Dashboard;
