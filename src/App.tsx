import { useEffect, useState } from "react";
import { getAuthStatus } from "./api/volvo_api";
import LoginPage from "./components/login/LoginPage";
import DashboardPage from "./components/dashboard/DashboardPage";

import "the-new-css-reset/css/reset.css";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    getAuthStatus()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return <>{isAuthenticated ? <LoginPage /> : <DashboardPage />}</>;
}

export default App;
