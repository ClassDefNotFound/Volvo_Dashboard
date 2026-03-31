import { Box, Typography } from "@mui/material";
import TabPanelWrapper from "./TabPanelWrapper";

const EngineStatusPanel = () => {
  return (
    <TabPanelWrapper>
      <Typography variant="body1">Engine Status</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </TabPanelWrapper>
  );
};

export default EngineStatusPanel;
