import { type ReactNode } from "react";
import { Box } from "@mui/material";
import AppHeader from "../components/navigation/AppHeader";
import LeftSidebar from "../components/navigation/LeftSidebar";

interface MainLayoutProps {
  children: ReactNode;
  selectedStudyId: number | null;
  onSelectStudy: (id: number) => void;
}

const drawerWidth = 260;

export default function MainLayout({
  children,
  selectedStudyId,
  onSelectStudy
}: MainLayoutProps) {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppHeader drawerWidth={drawerWidth} />
      <LeftSidebar
        width={drawerWidth}
        selectedStudyId={selectedStudyId}
        onSelectStudy={onSelectStudy}
      />
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
