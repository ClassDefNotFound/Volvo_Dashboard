import { Box, Typography } from "@mui/material";
import CommandButtonGroups from "./CommandButtonGroups";

const commandGroups = [
  {
    id: "commands-security",
    groupLabel: "Security",
    actions: ["lock", "unlock"],
  },
  {
    id: "commands-engine",
    groupLabel: "Engine",
    actions: ["start", "stop"],
  },
  {
    id: "commands-climate",
    groupLabel: "Climate",
    actions: ["start", "stop"],
  },
  {
    id: "commands-honk-flash",
    groupLabel: "Honk + Flash",
    actions: ["honk", "flash", "honk + flash"],
    groupStyling: { display: "flex", flexDirection: "column" },
  },
];

const CommandPanel = () => {
  return (
    <Box
      id="web-dash-command-panel"
      border="1px solid red"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        margin: 2,
      }}
    >
      <Typography variant="h5">Commands</Typography>
      {commandGroups.map((cg) => (
        <CommandButtonGroups {...cg} key={cg.id} />
      ))}
    </Box>
  );
};

export default CommandPanel;
