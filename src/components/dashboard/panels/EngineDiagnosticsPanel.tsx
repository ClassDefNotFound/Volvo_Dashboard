import { getEngineDiagnostics } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const EngineDiagnosticsPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getEngineDiagnostics);

  return (
    <VehicleDataTable
      tableName={"Engine Diagnostics"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default EngineDiagnosticsPanel;
