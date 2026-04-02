import { Alert, Box, CircularProgress } from "@mui/material";
import { useCallback } from "react";
import StatusTable from "./StatusTable";
import SectionTitle from "../SectionTitle";
import type { StatusEntry } from "./PanelProps";

type VehicleDataTableProps<T extends Record<string, StatusEntry>> = {
  tableName: string;
  data: T | undefined;
  loading: boolean;
  error?: string;
};

const VehicleDataTable = <T extends Record<string, StatusEntry>>({
  tableName,
  data,
  loading,
  error,
}: VehicleDataTableProps<T>) => {
  const renderContent = useCallback(() => {
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (loading || !data) {
      return <CircularProgress />;
    }

    return <StatusTable tableName={tableName} data={data} />;
  }, [tableName, data, error, loading]);

  return (
    <Box
      id={`${tableName.toLowerCase()}-panel`}
      sx={{ flex: 1, maxHeight: "100%" }}
    >
      <SectionTitle title={tableName} />
      <Box
        id="vehicle-data-table-container"
        sx={{
          my: 1,
          height: "auto",
          border: "1px solid yellow",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default VehicleDataTable;
