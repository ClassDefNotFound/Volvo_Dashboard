import { MenuItem, Select, useTheme } from "@mui/material";
import type { VinSelectorProps } from ".";

const VinSelector = ({
  vins,
  selectedVin,
  onSelectedVinChange,
}: VinSelectorProps) => {
  const theme = useTheme();
  return (
    <>
      <Select
        labelId="vin-selector-label"
        label="Vin"
        id="vin-selector"
        value={selectedVin}
        onChange={onSelectedVinChange}
        size="small"
        sx={{
          minWidth: 200,
          [theme.breakpoints.between("xs", "lg")]: {
            minWidth: 150,
          },
          border: `1px solid ${theme.palette.secondary.dark}`,
          "& .MuiSvgIcon-root": {
            color: theme.palette.secondary.dark,
          },
        }}
      >
        {vins.map((v) => (
          <MenuItem value={v}>{v}</MenuItem>
        ))}
      </Select>
    </>
  );
};

export default VinSelector;
