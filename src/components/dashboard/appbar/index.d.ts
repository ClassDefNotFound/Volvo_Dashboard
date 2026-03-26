import type { SelectChangeEvent } from "@mui/material";

export type VinSelectorProps = {
  vins: string[];
  selectedVin: string;
  onSelectedVinChange: (e: SelectChangeEvent) => void;
};
