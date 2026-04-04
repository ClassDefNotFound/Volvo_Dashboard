import { Box } from "@mui/material";

type TabPanelProps = {
  children: React.ReactNode;
};

const TabPanelWrapper = ({ children }: TabPanelProps) => {
  return (
    <Box
      id="tab-panel-wrapper"
      role="tabpanel"
      aria-labelledby="vehicle-data-panel-tabs"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
};

export default TabPanelWrapper;
