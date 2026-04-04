import {
  Box,
  Button,
  Typography,
  useTheme,
  ButtonGroup,
  type SxProps,
  type Theme,
} from "@mui/material";

type CommandButtonGroupsProps = {
  id: string;
  groupLabel: string;
  actions: string[];
  groupStyling?: SxProps<Theme>;
};

const CommandButtonGroups = ({
  id,
  groupLabel,
  actions,
  groupStyling = {},
}: CommandButtonGroupsProps) => {
  const theme = useTheme();

  function getButtons() {
    return actions.map((action) => (
      <Button
        key={action}
        value={action.toLowerCase()}
        size="small"
        sx={{
          backgroundColor: theme.palette.primary.dark,
          width: "fit-content",
        }}
      >
        <Typography variant="button">{action.toUpperCase()}</Typography>
      </Button>
    ));
  }

  return (
    <Box id={id}>
      <Typography variant="h6" sx={{ fontSize: { xs: ".75rem", md: "1rem" } }}>
        {groupLabel.toUpperCase()}
      </Typography>
      <ButtonGroup color="primary" sx={{ gap: 1, ...groupStyling }}>
        {getButtons()}
      </ButtonGroup>
    </Box>
  );
};

export default CommandButtonGroups;
