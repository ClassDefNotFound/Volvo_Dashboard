import { useMemo, useState } from "react";
import { VinContext, type VinContextProps } from "./VinContext";

type ProviderProps = {
  children: React.ReactNode;
};
export function VinProvider({ children }: ProviderProps) {
  const [vin, setVin] = useState<string>("");

  const contextValues = useMemo<VinContextProps>(
    () => ({ vin, setVin }),
    [vin, setVin],
  );

  return (
    <VinContext.Provider value={contextValues}>{children}</VinContext.Provider>
  );
}
