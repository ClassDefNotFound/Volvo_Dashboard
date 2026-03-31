import { Box, Typography } from "@mui/material";
import TabPanelWrapper from "./TabPanelWrapper";

const VehicleDiagnosticsPanel = () => {
  return (
    <TabPanelWrapper>
      <Typography variant="body1">Vehicle Diag.</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </TabPanelWrapper>
  );
};

export default VehicleDiagnosticsPanel;
