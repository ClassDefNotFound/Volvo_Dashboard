import type { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

function useVehicleData<T>(
  vin: string,
  fetchFn: (vin: string) => Promise<AxiosResponse<T>>,
) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function fetchData() {
      if (!vin) return;
      setLoading(true);
      try {
        const response = await fetchFn(vin);
        setData(response.data);
      } catch (err) {
        setError(`Failed to fetch vehicle data: ${err}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [vin, fetchFn]);

  return { data, loading, error };
}

export default useVehicleData;
