import { getVehicleWarnings } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const WarningsPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getVehicleWarnings);

  return (
    <VehicleDataTable
      tableName={"Warnings"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default WarningsPanel;
