import { getBrakesStatus } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const BrakesPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getBrakesStatus);

  return (
    <VehicleDataTable
      tableName={"Brakes"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default BrakesPanel;
