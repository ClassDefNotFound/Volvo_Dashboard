import { Box, Typography } from "@mui/material";

const TyresPanel = () => {
  return (
    <>
      <Typography variant="body1">Tyres</Typography>
      <Box sx={{ height: "auto", border: "1px solid yellow" }}>
        <Typography variant="body2">Panel content</Typography>
      </Box>
    </>
  );
};

export default TyresPanel;
