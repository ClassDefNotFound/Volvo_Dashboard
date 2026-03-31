import { Box } from "@mui/material";
import VehicleInfoPanel from "./panels/VehicleInfoPanel";
import CommandPanel from "./panels/CommandPanel";
import StatusBar from "./StatusBar";

const WebDash = () => {
  return (
    <Box
      id="WebDash-Container"
      display="flex"
      flex={1}
      overflow="hidden"
      border="1px dashed red"
    >
      <Box
        id="WebDash-Sidebar"
        width={260}
        display="flex"
        flexDirection="column"
        overflow="auto"
        border="1px dashed white"
      >
        <VehicleInfoPanel />
        <CommandPanel />
      </Box>
      <Box
        id="WebDash-MainPanel"
        flex={1}
        overflow="auto"
        border="1px dashed white"
      >
        <StatusBar />
      </Box>
    </Box>
  );
};

export default WebDash;
