import { getFuelStatus } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const FuelPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getFuelStatus);

  return (
    <VehicleDataTable
      tableName={"Fuel"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default FuelPanel;
