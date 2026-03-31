import { Box } from "@mui/material";
import type { TabPanelProps } from "./PanelProps";

const TabPanelWrapper = ({ children }: TabPanelProps) => {
  return (
    <Box role="tabpanel" sx={{ height: "50dvh", border: "1px solid red" }}>
      {children}
    </Box>
  );
};

export default TabPanelWrapper;
