import { Router } from "express";
import { config } from "config.js";
import axios from "axios";
import type { Request } from "express-serve-static-core";
import type { Vehicles, VehicleDetails } from "../../shared/types/index.js";

const router = Router();

function getAccessToken(req: Request): string {
  return config.isLocalMode ? config.accessToken! : req.session.accessToken!;
}

router.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await axios.get<Vehicles>(
      `${config.volvoApiUrl}/vehicles`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getAccessToken(req)}`,
          "vcc-api-key": config.vccApiKey,
        },
      },
    );
    res.json(vehicles.data);
  } catch (err) {
    console.error("Failed to fetch vehicles", err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

router.get("/vehicles/:vin", async (req, res) => {
  try {
    const { vin } = req.params;
    const vehicleDetails = await axios.get<VehicleDetails>(
      `${config.volvoApiUrl}/vehicles/${vin}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getAccessToken(req)}`,
          "vcc-api-key": config.vccApiKey,
        },
      },
    );
    res.json(vehicleDetails.data);
  } catch (err) {
    console.error("Failed to fetch vehicle details", err);
    res.status(500).json({ error: "Failed to fetch vehicle details" });
  }
});

//** GET Endpoints */
const statusEndpoints = [
  "engine",
  "diagnostics",
  "brakes",
  "windows",
  "doors",
  "engine-status",
  "fuel",
  "odometer",
  "statistics",
  "tyres",
  "warnings",
];

function createStatusRoute<T>(resource: string, volvoResource?: string) {
  router.get(`/vehicles/:vin/${resource}`, async (req, res) => {
    const { vin } = req.params;
    try {
      const response = await axios.get(
        `${config.volvoApiUrl}/vehicles/${vin}/${volvoResource ?? resource}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${getAccessToken(req)}`,
            "vcc-api-key": config.vccApiKey,
          },
        },
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({
        error: `Failed to fetch ${volvoResource ?? resource}: ${err}`,
      });
    }
  });
}

statusEndpoints.forEach((endpoint) => createStatusRoute(endpoint));

const commandEndpoints = [
  "climatization-start",
  "climatization-stop",
  "lock",
  "unlock",
  "engine-start",
  "engine-stop",
  "flash",
  "honk",
  "honk-flash",
];

function createCommandRoute<T>(command: string) {
  router.post(`/vehicles/:vin/commands/${command}`, async (req, res) => {
    const { vin } = req.params;
    try {
      const response = await axios.post(
        `${config.volvoApiUrl}/vehicles/${vin}/commands/${command}`,
        req.body,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${getAccessToken(req)}`,
            "vcc-api-key": config.vccApiKey,
          },
        },
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({
        error: `Failed to use command ${command}: ${err}`,
      });
    }
  });
}

commandEndpoints.forEach((endpoint) => createCommandRoute(endpoint));

export default router;
