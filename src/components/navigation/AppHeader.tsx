import { AppBar, Toolbar, Typography } from "@mui/material";

interface AppHeaderProps {
  drawerWidth: number;
}

export default function AppHeader({ drawerWidth }: AppHeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          CSR Assistant MVP
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
