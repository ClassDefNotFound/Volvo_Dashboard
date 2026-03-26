import { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { getAuthStatus } from "./api/volvo_api";
import LoginPage from "./components/login/LoginPage";
import DashboardPage from "./components/dashboard/DashboardPage";

import "./App.css";
import volvo_theme from "./themes/volvo_theme";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    getAuthStatus()
      .then(() => {
        console.log("Successful login");
        setIsAuthenticated(true);
      })
      .catch(() => {
        console.log("Failed to login");
        setIsAuthenticated(false);
      });
  }, []);

  return (
    <ThemeProvider theme={volvo_theme}>
      <CssBaseline />
      {isAuthenticated ? <DashboardPage /> : <LoginPage />}
    </ThemeProvider>
  );
}

export default App;
