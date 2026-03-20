import { useEffect, useState } from "react";
import { getVehicles, getVehicleDetails } from "./api/volvo_api";

function App() {
  const [vins, setVins] = useState<string[]>([]);

  useEffect(() => {
    // Initial API call to get all available vehicles
    async function handleVehiclesRequest() {
      const vehicles = await getVehicles();
      console.log(
        `received response for vehicles: ${JSON.stringify(vehicles.data)}`,
      );
      setVins(vehicles.data);
    }

    handleVehiclesRequest();
  }, []);

  //Testing API calls
  async function requestDetails() {
    if (vins.length !== 0) {
      const testVin = vins[0];
      const vehicleDetails = await getVehicleDetails(testVin);
      console.log(vehicleDetails);
    }
  }

  return (
    <div>
      Hello World!
      <button onClick={requestDetails}>Request Vin for first vehicle</button>
    </div>
  );
}

export default App;
