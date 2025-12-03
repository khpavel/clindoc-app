import { type ReactNode } from "react";
import { Box } from "@mui/material";
import AppHeader from "../components/navigation/AppHeader";
import LeftSidebar from "../components/navigation/LeftSidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const drawerWidth = 260;

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppHeader drawerWidth={drawerWidth} />
      <LeftSidebar width={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
