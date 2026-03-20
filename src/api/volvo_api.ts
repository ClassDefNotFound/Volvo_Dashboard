import axios from "axios";
import type {
  VehicleDetailsResponse,
  VehiclesResponse,
} from "@shared/types/index.js";

const base_url = "http://localhost:3000";

// export async function loginToVolvo(): Promise<void> {
//   try {
//     const response = await axios.get(`${base_url}/auth/login`, {

//     )
//   }
// }

export async function loginVolvo() {
  try {
    console.log(`ui: trying to log in to volvo`);
    await axios.get(`${base_url}/auth/login`);
  } catch (err) {
    alert(err);
  }
}

export async function getVehicles(): Promise<VehiclesResponse> {
  const vehicles = await axios.get<VehiclesResponse>(`${base_url}/api/vehicles`);
  return vehicles.data;
}

export async function getVehicleDetails(
  vin: string,
): Promise<VehicleDetailsResponse> {
  const url = `${base_url}/api/vehicles/${vin}`;
  console.log(`Requesting vehicle details for VIN: ${vin} at URL: ${url}`);
  const vehicleDetails = await axios.get<VehicleDetailsResponse>(url);
  return vehicleDetails.data;
}
