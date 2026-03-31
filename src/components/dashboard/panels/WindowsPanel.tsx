import { Box, Typography } from "@mui/material";
import TabPanelWrapper from "./TabPanelWrapper";

const WindowsPanel = () => {
  return (
    <TabPanelWrapper>
      <Typography variant="body1">Windows</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </TabPanelWrapper>
  );
};

export default WindowsPanel;
