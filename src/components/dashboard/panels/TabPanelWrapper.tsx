import { Box } from "@mui/material";
import type { TabPanelProps } from "./PanelProps";

const TabPanelWrapper = ({ children }: TabPanelProps) => {
  return (
    <Box
      id="tab-panel-wrapper"
      role="tabpanel"
      aria-labelledby="status-panel-tabs"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        border: "1px solid red",
      }}
    >
      {children}
    </Box>
  );
};

export default TabPanelWrapper;
