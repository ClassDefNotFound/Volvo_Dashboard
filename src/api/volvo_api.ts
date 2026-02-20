import axios from "axios";
import type { VehiclesResponse } from "@shared/types/index.js";

const base_url = "http://localhost:3000";

export async function getVehicles(): Promise<VehiclesResponse> {
  const vehicles = await axios.get<VehiclesResponse>(`${base_url}/vehicles`);
  return vehicles.data;
}

export async function getVehicleDetails(vin: string) {
  const url = `${base_url}/vehicles/${vin}`;
  console.log(`Requesting vehicle details for VIN: ${vin} at URL: ${url}`);
  const vehicleDetails = await axios.get(`${base_url}/vehicles/${vin}`);
  return vehicleDetails.data;
}
