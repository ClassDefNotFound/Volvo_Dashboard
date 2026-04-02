import { Box, Typography } from "@mui/material";

const DoorsPanel = () => {
  return (
    <>
      <Typography variant="body1">Doors</Typography>
      <Box sx={{ flex: 1, border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default DoorsPanel;
