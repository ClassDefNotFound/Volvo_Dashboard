import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import OdometerPanel from "./panels/OdometerPanel";
import EngineDiagnosticsPanel from "./panels/EngineDiagnosticsPanel";
import VehicleDiagnosticsPanel from "./panels/VehicleDiagnosticsPanel";
import BrakesPanel from "./panels/BrakesPanel";
import WindowsPanel from "./panels/WindowsPanel";
import DoorsPanel from "./panels/DoorsPanel";
import FuelPanel from "./panels/FuelPanel";
import StatisticsPanel from "./panels/StatisticsPanel";
import TyresPanel from "./panels/TyresPanel";
import WarningsPanel from "./panels/WarningsPanel";
import EngineStatusPanel from "./panels/EngineStatusPanel";
import TabPanelWrapper from "./panels/TabPanelWrapper";

const statusPanels = [
  { label: "Engine Diag.", panel: EngineDiagnosticsPanel },
  { label: "Engine Status", panel: EngineStatusPanel },
  { label: "Vehicle Diag.", panel: VehicleDiagnosticsPanel },
  { label: "Brakes", panel: BrakesPanel },
  { label: "Windows", panel: WindowsPanel },
  { label: "Doors", panel: DoorsPanel },
  { label: "Fuel", panel: FuelPanel },
  { label: "Odometer", panel: OdometerPanel },
  { label: "Stats", panel: StatisticsPanel },
  { label: "Tyres", panel: TyresPanel },
  { label: "Warnings", panel: WarningsPanel },
];

const StatusPanel = () => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  function renderTabs() {
    return statusPanels.map(({ label }) => (
      <Tab key={label} label={`${label}`} />
    ));
  }

  function renderTabContent() {
    const ActivePanel = statusPanels[activeTabIndex].panel;
    return (
      <TabPanelWrapper>
        <ActivePanel />
      </TabPanelWrapper>
    );
  }

  return (
    <Box
      id="status-panel"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 50,
        border: "1px dashed white",
        my: {
          xs: 5,
          md: 10,
        },
      }}
    >
      <Tabs
        value={activeTabIndex}
        onChange={(_, value) => setActiveTabIndex(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minWidth: 0 }}
      >
        {renderTabs()}
      </Tabs>
      {renderTabContent()}
    </Box>
  );
};

export default StatusPanel;
