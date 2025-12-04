import {
  Drawer,
  Toolbar,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";
import { listStudies } from "../../api/studiesApi";
import type { Study } from "../../types/study";

interface LeftSidebarProps {
  width: number;
  selectedStudyId: number | null;
  onSelectStudy: (studyId: number) => void;
}

export default function LeftSidebar({
  width,
  selectedStudyId,
  onSelectStudy
}: LeftSidebarProps) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStudies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listStudies();
        if (!isMounted) return;
        setStudies(data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Failed to load studies");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudies();

    return () => {
      isMounted = false;
    };
  }, []);

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
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 0.5, gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption">Loading...</Typography>
          </Box>
        )}
        {error && (
          <Typography
            variant="caption"
            color="error"
            sx={{ px: 1, pb: 0.5, display: "block" }}
          >
            {error}
          </Typography>
        )}
        {!loading && !error && (
          <List dense>
            {studies.map((study) => (
              <ListItemButton
                key={study.id}
                selected={study.id === selectedStudyId}
                onClick={() => onSelectStudy(study.id)}
              >
                <ListItemText primary={study.code} secondary={study.title} />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
