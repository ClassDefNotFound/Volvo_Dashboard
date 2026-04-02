import { getDoorStatus } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const DoorsPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getDoorStatus);

  return (
    <VehicleDataTable
      tableName={"Doors"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default DoorsPanel;
