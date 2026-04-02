import { Box, Typography } from "@mui/material";

const EngineDiagnosticsPanel = () => {
  return (
    <>
      <Typography variant="body1">Engine Diag.</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default EngineDiagnosticsPanel;
