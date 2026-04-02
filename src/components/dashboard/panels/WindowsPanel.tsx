import { Box, Typography } from "@mui/material";

const WindowsPanel = () => {
  return (
    <>
      <Typography variant="body1">Windows</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default WindowsPanel;
