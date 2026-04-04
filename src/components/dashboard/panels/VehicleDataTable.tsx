import { Alert, Box, CircularProgress } from "@mui/material";
import { useCallback } from "react";
import StatusTable from "./StatusTable";
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
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {renderContent()}
    </Box>
  );
};

export default VehicleDataTable;
