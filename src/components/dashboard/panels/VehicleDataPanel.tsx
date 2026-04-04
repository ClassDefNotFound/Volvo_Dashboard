import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import OdometerPanel from "@components/dashboard/panels/OdometerPanel";
import EngineDiagnosticsPanel from "@components/dashboard/panels/EngineDiagnosticsPanel";
import VehicleDiagnosticsPanel from "@components/dashboard/panels/VehicleDiagnosticsPanel";
import BrakesPanel from "@components/dashboard/panels/BrakesPanel";
import WindowsPanel from "@components/dashboard/panels/WindowsPanel";
import DoorsPanel from "@components/dashboard/panels/DoorsPanel";
import FuelPanel from "@components/dashboard/panels/FuelPanel";
import StatisticsPanel from "@components/dashboard/panels/StatisticsPanel";
import TyresPanel from "@components/dashboard/panels/TyresPanel";
import WarningsPanel from "@components/dashboard/panels/WarningsPanel";
import EngineStatusPanel from "@components/dashboard/panels/EngineStatusPanel";
import TabPanelWrapper from "@components/dashboard/panels/TabPanelWrapper";

const statusPanels = [
  { label: "Engine Diagnostics", panel: EngineDiagnosticsPanel },
  { label: "Engine Status", panel: EngineStatusPanel },
  { label: "Vehicle Diagnostics", panel: VehicleDiagnosticsPanel },
  { label: "Brakes", panel: BrakesPanel },
  { label: "Windows", panel: WindowsPanel },
  { label: "Doors", panel: DoorsPanel },
  { label: "Fuel", panel: FuelPanel },
  { label: "Odometer", panel: OdometerPanel },
  { label: "Stats", panel: StatisticsPanel },
  { label: "Tyres", panel: TyresPanel },
  { label: "Warnings", panel: WarningsPanel },
];

const VehicleDataPanel = () => {
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
      id="vehicle-data-panel"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <Tabs
        value={activeTabIndex}
        onChange={(_, value) => setActiveTabIndex(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minWidth: 0,
          "& .MuiTab-root": { textTransform: "none", fontSize: "1rem" },
        }}
      >
        {renderTabs()}
      </Tabs>
      {renderTabContent()}
    </Box>
  );
};

export default VehicleDataPanel;
