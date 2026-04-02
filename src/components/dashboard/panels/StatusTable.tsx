import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { StatusEntry } from "./PanelProps";

type StatusTableProps<T extends Record<string, StatusEntry>> = {
  tableName: string;
  data: T;
};

const StatusTable = <T extends Record<string, StatusEntry>>({
  tableName,
  data,
}: StatusTableProps<T>) => {
  const showUnit = Object.values<StatusEntry>(data).some((entry) => entry.unit);

  function renderHeaders() {
    return (
      <TableRow>
        <TableCell></TableCell>
        <TableCell>Value</TableCell>
        {showUnit && <TableCell>Unit</TableCell>}
        <TableCell>Timestamp</TableCell>
      </TableRow>
    );
  }

  function renderData() {
    return Object.entries<StatusEntry>(data).map(
      ([key, { value, unit, timestamp }]) => (
        <TableRow key={key}>
          <TableCell>{key}</TableCell>
          <TableCell>{String(value)}</TableCell>
          {showUnit && <TableCell>{unit ?? "-"}</TableCell>}
          <TableCell>{timestamp.split("T")[0]}</TableCell>
        </TableRow>
      ),
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        maxHeight: {
          xs: "50dvh",
          md: "60dvh",
        },
        flex: 1,
        overflow: "auto",
      }}
    >
      <Table stickyHeader aria-label={`${tableName.toLowerCase()}-table`}>
        <TableHead>{renderHeaders()}</TableHead>
        <TableBody>{renderData()}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default StatusTable;
