import { Router } from "express";
import { config } from "config.js";
import axios from "axios";
import type { Request } from "express-serve-static-core";
import type {
  Vehicles,
  VehicleDetails,
  WindowStatusResponse,
} from "../../shared/types/index.js";

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

router.get("/windows", async (req, res) => {
  try {
    const windowStatus = await axios.get<WindowStatusResponse>(
      `${config.volvoApiUrl}/windows`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getAccessToken(req)}`,
          "vcc-api-key": config.vccApiKey,
        },
      },
    );
    res.json(windowStatus.data);
  } catch (err) {
    console.error("Failed to fetch window status", err);
    res.status(500).json({ error: "Failed to fetch window status" });
  }
});

export default router;
