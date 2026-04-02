import { Stack } from "@mui/material";
import VehicleInfoPanel from "@components/dashboard//panels/VehicleInfoPanel";
import VehicleDataPanel from "@components/dashboard/panels/VehicleDataPanel";
import MobileCommandBar from "@components/dashboard//panels/commands/MobileCommandBar";

const MobileDash = () => {
  return (
    <Stack
      id="mobile-dash-stack"
      spacing={2}
      sx={{ flex: 1, justifyContent: "space-between" }}
    >
      <VehicleInfoPanel />
      <VehicleDataPanel />
      <MobileCommandBar />
    </Stack>
  );
};

export default MobileDash;
