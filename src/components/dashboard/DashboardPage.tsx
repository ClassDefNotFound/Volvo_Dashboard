import { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  //   Typography,
  useTheme,
} from "@mui/material";

import { getVehicles } from "@api/volvo_api";
import VinSelector from "./appbar/VinSelector";

import SettingsIcon from "@mui/icons-material/Settings";
import { useBreakpoint } from "@components/hooks/useBreakpoint";

const DashboardPage = () => {
  const [vins, setVins] = useState<string[]>([]);
  const [selectedVin, setSelectedVin] = useState<string>("");

  const theme = useTheme();

  useEffect(() => {
    async function fetchVehicles() {
      const vehicles = await getVehicles();
      setVins(vehicles.data.data.map((v) => v.vin));
      setSelectedVin(vehicles.data.data[0].vin);
    }
    fetchVehicles();
  }, []);

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
    <>
      <AppBar
        position="static"
        sx={{
          maxHeight: "max-content",
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
            <VinSelector
              vins={vins}
              selectedVin={selectedVin}
              onSelectedVinChange={(e) => setSelectedVin(e.target.value)}
            />
            {renderLogoutOrSettings()}
          </Box>
        </Box>
      </AppBar>
    </>
  );
};

export default DashboardPage;
