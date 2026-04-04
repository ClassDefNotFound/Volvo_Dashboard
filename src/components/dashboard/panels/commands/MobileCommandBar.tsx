import { IconButton, Paper, useTheme } from "@mui/material";

import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import AcUnitRoundedIcon from "@mui/icons-material/AcUnitRounded";
import FlashlightOnRoundedIcon from "@mui/icons-material/FlashlightOnRounded";
import SpeakerPhoneRoundedIcon from "@mui/icons-material/SpeakerPhoneRounded";

const MobileCommandBar = () => {
  const theme = useTheme();
  return (
    <Paper
      id="mobile-command-bar"
      elevation={1}
      sx={{
        display: "flex",
        justifyContent: "space-evenly",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <IconButton>
        <LockOutlineRoundedIcon />
      </IconButton>
      <IconButton>
        <LockOpenRoundedIcon />
      </IconButton>
      <IconButton>
        <BoltRoundedIcon />
      </IconButton>
      <IconButton>
        <AcUnitRoundedIcon />
      </IconButton>
      <IconButton>
        <FlashlightOnRoundedIcon />
      </IconButton>
      <IconButton>
        <SpeakerPhoneRoundedIcon />
      </IconButton>
    </Paper>
  );
};

export default MobileCommandBar;
