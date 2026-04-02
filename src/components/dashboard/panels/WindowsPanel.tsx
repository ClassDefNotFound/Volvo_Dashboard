import { getWindowStatus } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const WindowsPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getWindowStatus);

  return (
    <VehicleDataTable
      tableName={"Windows"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default WindowsPanel;
