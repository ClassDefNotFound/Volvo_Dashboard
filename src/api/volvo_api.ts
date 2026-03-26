import axios from "axios";
import {
  type AuthStatus,
  type Error,
  type VehicleDetails,
  type Vehicles,
} from "@shared/types/index.js";

const base_url = import.meta.env.VITE_BASE_URL;
console.log(`base url is ${base_url}`);

export async function getAuthStatus() {
  return await axios.get<AuthStatus | Error>(`${base_url}/auth/status`);
}

export async function login() {
  return await axios.get(`${base_url}/auth/login`);
}

export async function getVehicles() {
  return await axios.get<Vehicles>(`${base_url}/api/vehicles`);
}

export async function getVehicleDetails(vin: string) {
  return await axios.get<VehicleDetails>(`${base_url}/api/vehicles/${vin}`);
}
