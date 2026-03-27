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
          minWidth: 150,
          [theme.breakpoints.between("sm", "md")]: {
            minWidth: 200,
          },
          color: theme.palette.primary.dark,
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
