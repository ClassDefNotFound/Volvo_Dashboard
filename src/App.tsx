import { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { getAuthStatus } from "@api/volvo_api";
import LoginPage from "@components/login/LoginPage";
import Dashboard from "@components/dashboard/Dashboard";

import "./App.css";
import volvo_theme from "./themes/volvo_theme";
import { VinProvider } from "@contexts/VinProvider";

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
      <VinProvider>
        {isAuthenticated ? <Dashboard /> : <LoginPage />}
      </VinProvider>
    </ThemeProvider>
  );
}

export default App;
