import { Box, Typography } from "@mui/material";

const VehicleInfoPanel = () => {
  return (
    <Box sx={{ minHeight: { xs: 100, sm: 200 }, border: "1px solid red" }}>
      <Typography variant="body1">Vehicle Info</Typography>
    </Box>
  );
};

export default VehicleInfoPanel;
