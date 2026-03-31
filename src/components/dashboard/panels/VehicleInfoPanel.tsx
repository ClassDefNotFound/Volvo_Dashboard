import { Box, Typography } from "@mui/material";

const VehicleInfoPanel = () => {
  return (
    <Box sx={{ height: { xs: 100, md: 300 }, border: "1px solid red" }}>
      <Typography variant="body1">Vehicle Info</Typography>
    </Box>
  );
};

export default VehicleInfoPanel;
