import axios from "axios";
import {
  type EngineStatus,
  type AuthStatus,
  type BrakeStatus,
  type Diagnostics,
  type DoorAndLockStatus,
  type EngineDiagnostics,
  type Error,
  type FuelStatus,
  type OdometerStatus,
  type Statistics,
  type TyresStatus,
  type VehicleDetails,
  type Vehicles,
  type Warnings,
  type WindowStatus,
  type Climatization,
  type LockCommand,
  type UnlockCommand,
  type EngineStart,
  type EngineStop,
  type Flash,
  type Honk,
  type HonkAndFlash,
} from "@shared/types/index.js";

const baseUrl = import.meta.env.VITE_BASE_URL;
const serverEndpoint = `${baseUrl}/api/vehicles`;
const getStatusEndpoint = (vin: string, resource: string) =>
  `${serverEndpoint}/${vin}/${resource}`;
const getCommandEndpoint = (vin: string, command: string) =>
  `${serverEndpoint}/${vin}/commands/${command}`;

export async function getAuthStatus() {
  return await axios.get<AuthStatus | Error>(`${baseUrl}/auth/status`);
}

export async function login() {
  return await axios.get(`${baseUrl}/auth/login`);
}

export async function getVehicles() {
  return await axios.get<Vehicles>(`${serverEndpoint}`);
}

export async function getVehicleDetails(vin: string) {
  return await axios.get<VehicleDetails>(`${baseUrl}/api/vehicles/${vin}`);
}

/** Status endpoints */

export async function getEngineDiagnostics(vin: string) {
  return await axios.get<EngineDiagnostics>(getStatusEndpoint(vin, "engine"));
}

export async function getVehicleDiagnostics(vin: string) {
  return await axios.get<Diagnostics>(getStatusEndpoint(vin, "diagnostics"));
}

export async function getBrakesStatus(vin: string) {
  return await axios.get<BrakeStatus>(getStatusEndpoint(vin, "brakes"));
}

export async function getWindowStatus(vin: string) {
  return await axios.get<WindowStatus>(getStatusEndpoint(vin, "windows"));
}

export async function getDoorStatus(vin: string) {
  return await axios.get<DoorAndLockStatus>(getStatusEndpoint(vin, "doors"));
}

export async function getEngineStatus(vin: string) {
  return await axios.get<EngineStatus>(getStatusEndpoint(vin, "engine-status"));
}

export async function getFuelStatus(vin: string) {
  return await axios.get<FuelStatus>(getStatusEndpoint(vin, "fuel"));
}

export async function getOdometer(vin: string) {
  return await axios.get<OdometerStatus>(getStatusEndpoint(vin, "odometer"));
}

export async function getStatistics(vin: string) {
  return await axios.get<Statistics>(getStatusEndpoint(vin, "statistics"));
}

export async function getTyreStatus(vin: string) {
  return await axios.get<TyresStatus>(getStatusEndpoint(vin, "tyres"));
}

export async function getVehicleWarnings(vin: string) {
  return await axios.get<Warnings>(getStatusEndpoint(vin, "warnings"));
}

/** Command endpoints */

export async function startClimatization(vin: string) {
  return await axios.post<Climatization>(
    getCommandEndpoint(vin, "climatization-start"),
  );
}

export async function stopClimatization(vin: string) {
  return await axios.post<Climatization>(
    getCommandEndpoint(vin, "climatization-stop"),
  );
}

export async function lockVehicle(vin: string) {
  return await axios.post<LockCommand>(getCommandEndpoint(vin, "lock"));
}

export async function unlockVehicle(vin: string) {
  return await axios.post<UnlockCommand>(getCommandEndpoint(vin, "unlock"));
}

export async function startEngine(vin: string) {
  return await axios.post<EngineStart>(getCommandEndpoint(vin, "engine-start"));
}

export async function stopEngine(vin: string) {
  return await axios.post<EngineStop>(getCommandEndpoint(vin, "engine-stop"));
}

export async function flashVehicle(vin: string) {
  return await axios.post<Flash>(getCommandEndpoint(vin, "flash"));
}
export async function honkVehicle(vin: string) {
  return await axios.post<Honk>(getCommandEndpoint(vin, "honk"));
}

export async function honkAndFlashVehicle(vin: string) {
  return await axios.post<HonkAndFlash>(getCommandEndpoint(vin, "honk-flash"));
}
