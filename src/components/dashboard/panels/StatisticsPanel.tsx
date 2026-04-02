import { getStatistics } from "@api/volvo_api";
import useVehicleData from "@hooks/useVehicleData";
import { useVin } from "@hooks/useVin";
import VehicleDataTable from "./VehicleDataTable";

const StatisticsPanel = () => {
  const { vin } = useVin();
  const { data, loading, error } = useVehicleData(vin, getStatistics);

  return (
    <VehicleDataTable
      tableName={"Statistics"}
      data={data?.data}
      loading={loading}
      error={error}
    />
  );
};

export default StatisticsPanel;
