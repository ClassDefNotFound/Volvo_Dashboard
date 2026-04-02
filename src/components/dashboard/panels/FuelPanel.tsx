import { Box, Typography } from "@mui/material";

const FuelPanel = () => {
  return (
    <>
      <Typography variant="body1">Fuel</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default FuelPanel;
