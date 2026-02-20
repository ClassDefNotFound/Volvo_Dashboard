import express from "express";
import cors from "cors";
import axios from "axios";
import "dotenv/config";
import type {
  VehiclesResponse,
  VehicleDetailsResponse,
  WindowStatusResponse,
} from "../shared/types/index.js";

const vcc_api_key = process.env.VCC_API_KEY;
const access_token = process.env.ACCESS_TOKEN;
// const client_id = process.env.CLIENT_ID;
const app = express();
const port = 3000;

const volvo_base_url = "https://api.volvocars.com/connected-vehicle/v2";

app.use(cors());

/* 
// Handle authorization for VOLVO API requests
app.use((req, res) => {
  // if session is no longer valid, redirect to Volvo login

  if (!req.headers.authorization) {
    const volvo_auth_url =
      "https://volvoid.eu.volvocars.com/as/authorization.oauth2";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: `${client_id}`,
      redirect_uri: "http://localhost:3000/",
    });

    res.redirect(`${volvo_auth_url}?${params.toString()}`);
  }
}); */

app.get("/vehicles", async (req, res) => {
  console.log("In backend requesting vehicles");
  const vehicles = await axios.get<VehiclesResponse>(
    `${volvo_base_url}/vehicles`,
    {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + access_token,
        "vcc-api-key": vcc_api_key,
      },
    },
  );
  res.send(vehicles.data);
});

app.get("vehicles/:vin", async (req, res) => {
  console.log("In backend requesting VIN");
  const vin = req.params.vin;
  const vehicleDetails = await axios.get<VehicleDetailsResponse>(
    `${volvo_base_url}/vehicles/${vin}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + access_token,
        "vcc-api-key": vcc_api_key,
      },
    },
  );
  res.send(vehicleDetails.data);
});

app.get("/windows", async (req, res) => {
  console.log("In backend requesting window status");
  const windowStatus = await axios.get<WindowStatusResponse>(
    `${volvo_base_url}/windows`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );
  res.send(windowStatus.data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
