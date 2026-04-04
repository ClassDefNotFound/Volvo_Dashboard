import { Box } from "@mui/material";
import CommandButtonGroups from "./CommandButtonGroups";
import SectionTitle from "@components/dashboard/SectionTitle";

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
    groupStyling: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },
];

const CommandPanel = () => {
  return (
    <Box
      id="web-dash-command-panel"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mx: 2,
      }}
    >
      {<SectionTitle title="Commands" />}
      {commandGroups.map((cg) => (
        <CommandButtonGroups {...cg} key={cg.id} />
      ))}
    </Box>
  );
};

export default CommandPanel;
