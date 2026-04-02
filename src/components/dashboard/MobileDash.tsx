import { Stack } from "@mui/material";
import VehicleInfoPanel from "./panels/VehicleInfoPanel";
import StatusPanel from "./StatusPanel";
import MobileCommandBar from "./panels/commands/MobileCommandBar";

const MobileDash = () => {
  return (
    <Stack
      id="mobile-dash-stack"
      spacing={2}
      sx={{ flex: 1, justifyContent: "space-between" }}
    >
      <VehicleInfoPanel />
      <StatusPanel />
      <MobileCommandBar />
    </Stack>
  );
};

export default MobileDash;
