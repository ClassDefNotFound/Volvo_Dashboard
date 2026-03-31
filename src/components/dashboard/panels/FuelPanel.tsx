import { Box, Typography } from "@mui/material";
import TabPanelWrapper from "./TabPanelWrapper";

const FuelPanel = () => {
  return (
    <TabPanelWrapper>
      <Typography variant="body1">Fuel</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </TabPanelWrapper>
  );
};

export default FuelPanel;
