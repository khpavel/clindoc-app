import { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "../../auth/AuthContext";
import { logout as logoutApi } from "../../api/authApi";

interface AppHeaderProps {
  drawerWidth: number;
}

export default function AppHeader({ drawerWidth }: AppHeaderProps) {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    // Call backend logout endpoint (silently ignore errors)
    await logoutApi();
    // Call frontend logout
    logout();
  };

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
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          CSR Assistant MVP
        </Typography>
        <Box>
          <IconButton
            size="large"
            edge="end"
            aria-label="account menu"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleLogout}>Выйти</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
