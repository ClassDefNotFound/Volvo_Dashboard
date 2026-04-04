import { Box, Drawer, IconButton } from "@mui/material";
import VehicleInfoPanel from "@components/dashboard/panels/VehicleInfoPanel";
import CommandPanel from "@components/dashboard/panels/commands/CommandPanel";
import VehicleDataPanel from "@components/dashboard/panels/VehicleDataPanel";
import { useRef, useState } from "react";

import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

const WebDash = () => {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef(null);
  return (
    <Box
      id="web-dash-container"
      ref={containerRef}
      sx={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        id="web-dash-sidebar"
        sx={[
          { display: "flex", flexDirection: "column" },
          !open && { width: 50, alignContent: "flex-end" },
        ]}
      >
        <IconButton
          onClick={() => setOpen(true)}
          sx={[{ mx: 2, my: 1, padding: 0 }, open && { display: "none" }]}
        >
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
        <Drawer
          container={() => containerRef.current}
          variant="persistent"
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            maxWidth: 300,
            flex: 1,
            "& .MuiDrawer-paper": {
              position: { xs: "absolute", md: "relative" },
              flex: 1,
            },
          }}
        >
          <Box
            id="web-dash-drawer-content"
            sx={{
              width: 260,
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 1,
            }}
          >
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                maxWidth: "fit-content",
                mx: 2,
                my: 1,
                padding: 0,
                justifyContent: "flex-end",
              }}
            >
              <KeyboardDoubleArrowLeftIcon />
            </IconButton>
            <VehicleInfoPanel />
            <CommandPanel />
          </Box>
        </Drawer>
      </Box>
      <Box
        id="web-dash-main-panel"
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          justifyContent: "center",
          margin: 2,
        }}
      >
        <VehicleDataPanel />
      </Box>
    </Box>
  );
};

export default WebDash;
