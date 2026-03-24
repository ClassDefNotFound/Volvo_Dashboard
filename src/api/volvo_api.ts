import axios from "axios";
import {
  type AuthStatus,
  type ErrorResponse,
  type VehicleDetailsResponse,
  type VehiclesResponse,
} from "@shared/types/index.js";

const base_url = import.meta.env.VITE_BASE_URL;
console.log(`base url is ${base_url}`);

export async function getAuthStatus() {
  return await axios.get<AuthStatus | ErrorResponse>(`${base_url}/auth/status`);
}

export async function login() {
  await axios.get(`${base_url}/auth/login`);
}

export async function getVehicles(): Promise<VehiclesResponse> {
  const { data } = await axios.get<VehiclesResponse>(
    `${base_url}/api/vehicles`,
  );
  return data;
}

export async function getVehicleDetails(
  vin: string,
): Promise<VehicleDetailsResponse> {
  const { data } = await axios.get<VehicleDetailsResponse>(
    `${base_url}/api/vehicles/${vin}`,
  );
  return data;
}
