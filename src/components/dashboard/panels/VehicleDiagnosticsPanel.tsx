import { Box, Typography } from "@mui/material";

const VehicleDiagnosticsPanel = () => {
  return (
    <>
      <Typography variant="body1">Vehicle Diag.</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default VehicleDiagnosticsPanel;
