import {
  Box,
  Card,
  CardContent,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import type { StatusEntry } from "./PanelProps";
import { useBreakpoint } from "@hooks/useBreakpoint";

type StatusTableProps<T extends Record<string, StatusEntry>> = {
  tableName: string;
  data: T;
};

const StatusTable = <T extends Record<string, StatusEntry>>({
  tableName,
  data,
}: StatusTableProps<T>) => {
  const theme = useTheme();

  const { isMobile } = useBreakpoint();

  function formatCamelCaseText(camelText: string) {
    const titleCase = camelText.charAt(0).toUpperCase() + camelText.slice(1);
    const splitText = titleCase.split(/(?=[A-Z])/);
    return splitText.join(" ");
  }

  function formatValueWithUnit(value: unknown, unit: string | undefined) {
    return String(value) + (unit ? ` ${unit}` : "");
  }

  function formatTimestamp(timestamp: string) {
    return timestamp.split("T")[0];
  }

  function renderTableHeaders() {
    return (
      <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
        <TableCell sx={{ backgroundColor: "inherit" }}>Metric</TableCell>
        <TableCell sx={{ backgroundColor: "inherit" }}>Value</TableCell>
        <TableCell sx={{ backgroundColor: "inherit" }}>Timestamp</TableCell>
      </TableRow>
    );
  }

  function renderTableData() {
    return Object.entries<StatusEntry>(data).map(
      ([key, { value, unit, timestamp }]) => {
        return (
          <TableRow key={key}>
            <TableCell>{formatCamelCaseText(key)}</TableCell>
            <TableCell>{formatValueWithUnit(value, unit)}</TableCell>
            <TableCell>{formatTimestamp(timestamp)}</TableCell>
          </TableRow>
        );
      },
    );
  }

  function renderTable() {
    return (
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          flex: 1,
          overflow: "auto",
          backgroundColor: theme.palette.info.light,
        }}
      >
        <Table
          stickyHeader={true}
          aria-label={`${tableName.toLowerCase()}-table`}
        >
          <TableHead>{renderTableHeaders()}</TableHead>
          <TableBody>{renderTableData()}</TableBody>
        </Table>
      </TableContainer>
    );
  }

  function renderCards() {
    return Object.entries<StatusEntry>(data).map(
      ([key, { value, unit, timestamp }]) => {
        return (
          <Box key={key} border={`1px solid ${theme.palette.divider}`}>
            <Card
              sx={{
                backgroundColor: theme.palette.info.light,
                textAlign: "left",
              }}
            >
              <CardContent>
                <Typography variant="body1">
                  {formatCamelCaseText(key)}
                </Typography>
                <Typography variant="body1">
                  {formatValueWithUnit(value, unit)}
                </Typography>
                <Typography variant="body1">
                  {formatTimestamp(timestamp)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      },
    );
  }

  function renderMobileTable() {
    return (
      <Container
        maxWidth="md"
        sx={{
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {renderCards()}
      </Container>
    );
  }

  return isMobile ? renderMobileTable() : renderTable();
};

export default StatusTable;
