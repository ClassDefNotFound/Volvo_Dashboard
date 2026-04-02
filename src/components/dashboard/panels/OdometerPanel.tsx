import { Box, Typography } from "@mui/material";

const OdometerPanel = () => {
  return (
    <>
      <Typography variant="body1">Odometer</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default OdometerPanel;
