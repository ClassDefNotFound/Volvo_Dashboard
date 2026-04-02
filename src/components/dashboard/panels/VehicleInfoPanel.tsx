import { getVehicleDetails } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useCallback } from "react";
import SectionTitle from "../SectionTitle";

const VehicleInfoPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getVehicleDetails);

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

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
        <Typography variant="body1">{`VOLVO ${descriptions.model} ${modelYear}`}</Typography>
        <Typography variant="body1">{`${externalColour} | ${gearbox}`}</Typography>
        <Typography variant="body1">{fuelTypeText}</Typography>
      </Box>
    );
  }, [data, error, loading]);

  return (
    <Box
      sx={{
        minHeight: { xs: 100, sm: 200 },
        mx: 2,
        my: 1,
      }}
      border="1px solid red"
    >
      <SectionTitle title="Vehicle Info" />
      {renderContent()}
    </Box>
  );
};

export default VehicleInfoPanel;
