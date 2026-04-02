import { getEngineStatus } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const EngineStatusPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getEngineStatus);

  return (
    <VehicleDataTable
      tableName={"Engine Status"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default EngineStatusPanel;
