import { Stack } from "@mui/material";
import VehicleInfoPanel from "./panels/VehicleInfoPanel";
import CommandPanel from "./panels/CommandPanel";
import StatusBar from "./StatusBar";

const MobileDash = () => {
  return (
    <Stack id="MobileDash-Stack" spacing={2}>
      <VehicleInfoPanel />
      <StatusBar />
      <CommandPanel />
    </Stack>
  );
};

export default MobileDash;
