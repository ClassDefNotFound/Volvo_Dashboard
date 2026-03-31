import { Box, Typography } from "@mui/material";
import TabPanelWrapper from "./TabPanelWrapper";

const TyresPanel = () => {
  return (
    <TabPanelWrapper>
      <Typography variant="body1">Tyres</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </TabPanelWrapper>
  );
};

export default TyresPanel;
