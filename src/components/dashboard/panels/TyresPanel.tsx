import { getTyreStatus } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const TyresPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getTyreStatus);

  return (
    <VehicleDataTable
      tableName={"Tyres"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default TyresPanel;
