import { Drawer, Toolbar, Box, Typography, List, ListItemButton } from "@mui/material";

interface LeftSidebarProps {
  width: number;
}

export default function LeftSidebar({ width }: LeftSidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box"
        }
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", p: 1 }}>
        <Typography variant="subtitle2" sx={{ px: 1, mb: 1, opacity: 0.7 }}>
          Studies
        </Typography>
        <List dense>
          <ListItemButton selected>Study ABC123</ListItemButton>
          <ListItemButton>Study XYZ789</ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
