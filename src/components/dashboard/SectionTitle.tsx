import { Box, Typography, useTheme } from "@mui/material";

type SectionTitleProps = {
  title: string;
};
const SectionTitle = ({ title }: SectionTitleProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ my: 2 }}>
      <Typography
        variant="h5"
        sx={{
          justifySelf: "center",
          mx: 2,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default SectionTitle;
