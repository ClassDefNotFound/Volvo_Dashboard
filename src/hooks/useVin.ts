import { useContext } from "react";
import { VinContext } from "@contexts/VinContext";

export function useVin() {
  const context = useContext(VinContext);

  if (context === undefined) throw new Error("No context defined for Vin");

  return context;
}
