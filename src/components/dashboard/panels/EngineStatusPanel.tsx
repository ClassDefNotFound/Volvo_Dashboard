import { Box, Typography } from "@mui/material";

const EngineStatusPanel = () => {
  return (
    <>
      <Typography variant="body1">Engine Status</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default EngineStatusPanel;
