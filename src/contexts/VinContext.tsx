import { createContext } from "react";

export type VinContextProps = {
  vin: string;
  setVin: (newVin: string) => void;
};

export const VinContext = createContext<VinContextProps | undefined>(undefined);
