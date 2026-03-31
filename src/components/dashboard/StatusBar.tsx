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

const StatusBar = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  function renderTabs() {
    return statusPanels.map(({ label }) => (
      <Tab key={label} label={`${label}`} />
    ));
  }

  function renderTabContent() {
    const ActivePanel = statusPanels[selectedTabIndex].panel;
    return <ActivePanel />;
  }

  return (
    <Box id="StatusBar" sx={{ border: "1px dashed white" }}>
      <Tabs
        value={selectedTabIndex}
        onChange={(_, value) => setSelectedTabIndex(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {renderTabs()}
      </Tabs>
      {renderTabContent()}
    </Box>
  );
};

export default StatusBar;
