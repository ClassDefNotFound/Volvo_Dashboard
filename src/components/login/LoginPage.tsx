import { Box, Button, Container, Typography } from "@mui/material";
import { login } from "@api/volvo_api";

const LoginPage = () => {
  return (
    <>
      <Box
        sx={{
          minHeight: "100dvh",
          minWidth: "100dvw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            align="center"
            variant="h1"
            color="primary"
            fontSize="2.5rem"
          >
            Welcome to your Volvo Dashboard
          </Typography>
          <Button
            variant="outlined"
            onClick={login}
            size="medium"
            sx={{ maxWidth: "10rem", margin: "2rem" }}
          >
            Sign in to Volvo
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default LoginPage;
