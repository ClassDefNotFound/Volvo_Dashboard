import { Divider, Typography, useTheme } from "@mui/material";

type SectionTitleProps = {
  title: string;
};
const SectionTitle = ({ title }: SectionTitleProps) => {
  const theme = useTheme();
  return (
    <>
      <Typography variant="h5">{title}</Typography>
      <Divider
        variant="middle"
        component="div"
        sx={{ borderColor: theme.palette.divider }}
      />
    </>
  );
};

export default SectionTitle;
