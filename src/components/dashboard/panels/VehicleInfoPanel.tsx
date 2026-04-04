import { getVehicleDetails } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useCallback } from "react";
import SectionTitle from "../SectionTitle";
import { useBreakpoint } from "@hooks/useBreakpoint";

const VehicleInfoPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getVehicleDetails);
  const { isMobile } = useBreakpoint();

  const renderContent = useCallback(() => {
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (loading || !data) {
      return <CircularProgress />;
    }
    const vehicleInfo = data.data;
    const {
      fuelType,
      gearbox,
      modelYear,
      descriptions,
      externalColour,
      batteryCapacityKWH,
    } = vehicleInfo;
    const fuelTypeText =
      fuelType === "ELECTRIC" || fuelType === "PETROL/ELECTRIC"
        ? `${fuelType} ${batteryCapacityKWH}`
        : fuelType;

    if (isMobile)
      return (
        <Box>
          <Typography variant="body1">{`VOLVO ${descriptions.model} ${modelYear}`}</Typography>
          <Typography variant="body1">{`${externalColour} | ${gearbox} | ${fuelTypeText}`}</Typography>
          <Divider variant="middle" sx={{ mt: 1 }} />
        </Box>
      );

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body1">{`VOLVO ${descriptions.model} ${modelYear}`}</Typography>
        <Typography variant="body1">{`${externalColour} | ${gearbox}`}</Typography>
        <Typography variant="body1">{fuelTypeText}</Typography>
      </Box>
    );
  }, [data, error, loading, isMobile]);

  return (
    <Box
      sx={{
        minHeight: { xs: 100, sm: 200 },
        mx: 2,
      }}
    >
      {!isMobile && <SectionTitle title="Vehicle Info" />}
      {renderContent()}
    </Box>
  );
};

export default VehicleInfoPanel;
