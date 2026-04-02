import { getOdometer } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";

import VehicleDataTable from "./VehicleDataTable";

const OdometerPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getOdometer);

  return (
    <VehicleDataTable
      tableName={"Odometer"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default OdometerPanel;
