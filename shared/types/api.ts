// Volvo API response types

/**
 * Response from /vehicles endpoint
 * @returns an array of VINs associated with the account
 */
export type VehiclesResponse = {
  data: string[];
};

/**
 * Response from /vin endpoint
 */
export type VehicleDetailsResponse = {
  vin: string;
  modelYear: number;
  gearBox: "AUTOMATIC" | "MANUAL";
  fuelType:
    | "DIESEL"
    | "PETROL"
    | "PETROL/ELECTRIC"
    | "DIESEL/ELECTRIC"
    | "ELECTRIC"
    | "NONE";
  externalColour: string;
  batteryCapacityKWH: number;
  images: {
    exteriorImageUrl: string;
    interiorImageUrl: string;
  };
  descriptions: {
    model: string;
    steering: string;
    upholstery?: string;
  };
};

/**
 * Response from /engine endpoint
 */
export type EngineDiagnosticsResponse = {
  engineCoolantLevelWarning: {
    timestamp: string; // ISO-8601 format
    value: "UNSPECIFIED" | "NO_WARNING" | "TOO_LOW";
  };
  oilLevelWarning: {
    timestamp: string;
    value:
      | "UNSPECIFIED"
      | "NO_WARNING"
      | "SERVICE_REQUIRED"
      | "TOO_LOW"
      | "TOO_HIGH";
  };
  [key: string]: unknown; // Allow for additional fields
};

/**
 * Response from /diagnostics endpoint
 */
export type DiagnosticsResponse = {
  serviceWarning: {
    timestamp: string;
    value:
      | "UNSPECIFIED"
      | "NO_WARNING"
      | "UNKNOWN_WARNING"
      | "REGULAR_MAINTENANCE_ALMOST_TIME_FOR_SERVICE"
      | "ENGINE_HOURS_ALMOST_TIME_FOR_SERVICE"
      | "DISTANCE_DRIVEN_ALMOST_TIME_FOR_SERVICE"
      | "REGULAR_MAINTENANCE_TIME_FOR_SERVICE"
      | "ENGINE_HOURS_TIME_FOR_SERVIC"
      | "DISTANCE_DRIVEN_TIME_FOR_SERVICE"
      | "REGULAR_MAINTENANCE_OVERDUE_FOR_SERVICE"
      | "ENGINE_HOURS_OVERDUE_FOR_SERVICE"
      | "DISTANCE_DRIVEN_OVERDUE_FOR_SERVICE";
  };
  serviceTrigger: {
    timestamp: string;
    value:
      | "CALENDAR_TIME"
      | "DISTANCE"
      | "ENGINE_HOURS"
      | "UNSPECIFIED"
      | "UNKNOWN";
  };
  engineHoursToService: {
    timestamp: string;
    value: number; // Hours until next service
  };
  distanceToServiceKm: {
    timestamp: string;
    value: number;
  };
  timeToService: {
    timestamp: string;
    value: number; // Remaining time in days or month -- see unit -- till next scheduled maintenance
    unit: "days" | "months";
  };
};

/**
 * Response from /brakes endpoint
 */
export type BrakeStatusResponse = {
  brakeFluidLevelWarning: {
    timestamp: string;
    value: "UNSPECIFIED" | "NO_WARNING" | "TOO_LOW";
  };
};

type WindowAndLockStatusValues = "UNSPECIFIED" | "LOCKED" | "UNLOCKED" | "AJAR";

/**
 * Response from /windows endpoint
 */
export type WindowStatusResponse = {
  frontLeftWindow: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  frontRightWindow: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  rearLeftWindow: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  rearRightWindow: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  sunroof: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
};

/**
 * Response from /doors endpoint
 */
export type DoorAndLockStatusResponse = {
  centralLock: {
    timestamp: string;
    value: "UNSPECIFIED" | "LOCKED" | "UNLOCKED";
  };
  frontLeftDoor: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  frontRightDoor: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  rearLeftDoor: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  rearRightDoor: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  tailGate: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  hood: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
  tankLid: {
    timestamp: string;
    value: WindowAndLockStatusValues;
  };
};

/**
 * Response from /fuel endpoint
 */
export type FuelStatusResponse = {
  fuelAmount: {
    timestamp: string;
    value: number;
    unit: "l";
  };
  batteryChargeLevel: {
    timestamp: string;
    value: number;
    unit: "%";
  };
};
/**
 * Response from /engine_status endpoint
 */
export type EngineStatusResponse = {
  timestamp: string;
  engineStatus: "STOPPED" | "RUNNING";
};

/**
 * Response from /odometer endpoint
 */
export type OdometerStatusResponse = {
  timestamp: string;
  value: number; // Odometer reading in kilometers
  unit: "km";
};

/**
 * Response from /statistics endpoint
 */
export type StatisticsResponse = {
  averageFuelConsumption: {
    timestamp: string;
    value: number;
    unit: "l/100km";
  };
  averageEnergyConsumption: {
    timestamp: string;
    value: number;
    unit: "kWh/100km";
  };
  averageFuelConsumptionAutomatic: {
    timestamp: string;
    value: number;
    unit: "l/100km";
  };
  averageEnergyConsumptionAutomatic: {
    timestamp: string;
    value: number;
    unit: "kWh/100km";
  };
  averageEnergyConsumptionSinceCharge: {
    timestamp: string;
    value: number;
    unit: "kWh/100km";
  };
  distanceToEmptyTank: {
    timestamp: string;
    value: number;
    unit: "km";
  };
  distanceToEmptyBattery: {
    timestamp: string;
    value: number;
    unit: "km";
  };
  averageSpeed: {
    timestamp: string;
    value: number;
    unit: "km/h";
  };
  averageSpeedAutomatic: {
    timestamp: string;
    value: number;
    unit: "km/h";
  };
  tripMeterManual: {
    timestamp: string;
    value: number;
    unit: "km";
  };
  trimMeterAutomatic: {
    timestamp: string;
    value: number;
    unit: "km";
  };
};

type TyreValues =
  | "UNSPECIFIED"
  | "NO_WARNING"
  | "VERY_LOW_PRESSURE"
  | "LOW_PRESSURE"
  | "HIGH_PRESSURE";

/**
 * Response from /tyres endpoint
 */
export type TyresStatusResponse = {
  frontLeft: {
    timestamp: string;
    value: TyreValues;
  };
  frontRight: {
    timestamp: string;
    value: TyreValues;
  };
  rearLeft: {
    timestamp: string;
    value: TyreValues;
  };
  rearRight: {
    timestamp: string;
    value: TyreValues;
  };
};

export type WarningValues = "UNSPECIFIED" | "NO_WARNING" | "FAILURE";

/**
 * Response for /warnings endpoint
 */
export type WarningsResponse = {
  brakeLightLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  brakeLightCenterWarning: {
    timestamp: string;
    value: WarningValues;
  };
  brakeLightRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  fogLightFrontWarning: {
    timestamp: string;
    value: WarningValues;
  };
  fogLightRearWarning: {
    timestamp: string;
    value: WarningValues;
  };
  positionLightFrontLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  positionLightFrontRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  positionLightRearLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  positionLightRearRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  highBeamLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  highBeamRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  lowBeamLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  lowBeamRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  daytimeRuningLightLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  daytimeRuningLightRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  turnIndicationFrontLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  turnIndicationFrontRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  turnIndicationRearLeftWarning: {
    timestamp: string;
    value: WarningValues;
  };
  turnIndicationRearRightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  registrationPlateLightWarning: {
    timestamp: string;
    value: WarningValues;
  };
  sideMarkLightsWarning: {
    timestamp: string;
    value: WarningValues;
  };
  hazardLightsWarning: {
    timestamp: string;
    value: WarningValues;
  };
  reverseLightsWarning: {
    timestamp: string;
    value: WarningValues;
  };
};

//
// ************* COMMANDS  ******************
//

/**
 * Response from commands/climitization_start/_stop endpoint
 */
export type ClimitizationResponse = {
  vin: string;
  invokeStatus:
    | "RUNNING"
    | "WAITING"
    | "COMPLETED"
    | "REJECTED"
    | "UNKNOWN"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "DELIVERED"
    | "CAR_ERROR"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE";
  message?: string;
};

/**
 * Response from /commands/lock endpoint
 */
export type LockCommandResponse = {
  vin: string;
  invokeStatus:
    | "COMPLETED"
    | "DELIVERED"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "UNABLE_TO_LOCK_DOOR_OPEN"
    | "REJECTED"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE"
    | "UNKNOWN";
};

/**
 * Response from /commands/unlock endpoint
 */
export type UnlockCommandResponse = {
  vin: string;
  statusCode: number;
  invokeStatus:
    | "COMPLETED"
    | "DELIVERED"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "UNLOCK_TIME_FRAME_PASSED"
    | "REJECTED"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE"
    | "UNKNOWN";
  message?: string;
  readyToUnlock: boolean;
  readyToUnlockUntil: number; // Number of seconds left to unlock
};

/**
 * Request body for /commands/engine-start endpoint
 * Maximum is 15 minutes
 */
export type EngineStartRequestBody = {
  runTimeMinutes: number;
};

/**
 * Response from /commands/engine-start endpoint
 */
export type EngineStartResponse = {
  vin: string;
  statusCode: number;
  invokeStatus:
    | "RUNNING"
    | "WAITING"
    | "COMPLETED"
    | "REJECTED"
    | "UNKNOWN"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "DELIVERED"
    | "CAR_ERROR"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE";
  message?: string;
};

/**
 * Response from /commands/engine-stop endpoint
 */
export type EngineStopResponse = {
  vin: string;
  statusCode: number;
  invokeStatus:
    | "RUNNING"
    | "WAITING"
    | "COMPLETED"
    | "REJECTED"
    | "UNKNOWN"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "UNLOCK_TIME_FRAME_PASSED"
    | "UNABLE_TO_LOCK_DOOR_OPEN"
    | "DELIVERED"
    | "DELIVERED"
    | "CAR_ERROR"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE";
  message?: string;
};

/**
 * Response from /commands/flash
 */
export type FlashResponse = {
  vin: string;
  statusCode: number;
  invokeStatus:
    | "COMPLETED"
    | "REJECTED"
    | "UNKNOWN"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "DELIVERED"
    | "CAR_ERROR"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE";
  message?: string;
};

/**
 * Response from /commands/honk endpoint
 */
export type HonkResponse = {
  vin: string;
  statusCode: number;
  invokeStatus:
    | "COMPLETED"
    | "REJECTED"
    | "UNKNOWN"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "DELIVERED"
    | "CAR_ERROR"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE";
  message?: string;
};

/**
 * Response from /commands/honk-flash endpoint
 */
export type HonkAndFlashResponse = {
  vin: string;
  statusCode: number;
  invokeStatus:
    | "COMPLETED"
    | "REJECTED"
    | "UNKNOWN"
    | "TIMEOUT"
    | "CONNECTION_FAILURE"
    | "VEHICLE_IN_SLEEP"
    | "DELIVERED"
    | "CAR_ERROR"
    | "NOT_ALLOWED_PRIVACY_ENABLED"
    | "NOT_ALLOWED_WRONG_USAGE_MODE";
  message?: string;
};
