import {
  MenuItem,
  Select,
  useTheme,
  type SelectChangeEvent,
} from "@mui/material";
import { useVin } from "@hooks/useVin";

type VinSelectorProps = {
  vins: string[];
};

const VinSelector = ({ vins }: VinSelectorProps) => {
  const theme = useTheme();
  const { vin, setVin } = useVin();

  return (
    <>
      <Select
        labelId="vin-selector-label"
        label="Vin"
        id="vin-selector"
        value={vin}
        onChange={(e: SelectChangeEvent) => setVin(e.target.value)}
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
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default VinSelector;
