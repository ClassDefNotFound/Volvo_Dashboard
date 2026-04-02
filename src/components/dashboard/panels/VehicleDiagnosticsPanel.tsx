import { getVehicleDiagnostics } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const VehicleDiagnosticsPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getVehicleDiagnostics);

  return (
    <VehicleDataTable
      tableName={"Vehicle Diagnostics"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default VehicleDiagnosticsPanel;
