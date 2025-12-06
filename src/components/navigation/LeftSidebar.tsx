import {
  Drawer,
  Toolbar,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Chip
} from "@mui/material";
import { useEffect, useState } from "react";
import { listStudies } from "../../api/studiesApi";
import type { Study } from "../../types/study";

const getStatusColor = (status?: Study["status"]): "default" | "primary" | "success" | "warning" | "error" => {
  switch (status) {
    case "ongoing":
      return "primary";
    case "closed":
      return "success";
    case "archived":
      return "default";
    case "draft":
      return "warning";
    default:
      return "default";
  }
};

const getStatusLabel = (status?: Study["status"]): string => {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

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
                sx={{ flexDirection: "column", alignItems: "flex-start", py: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", mb: study.indication ? 0.5 : 0 }}>
                  <ListItemText
                    primary={study.code}
                    secondary={study.title}
                    primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: "caption", sx: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                  {study.status && (
                    <Chip
                      label={getStatusLabel(study.status)}
                      size="small"
                      color={getStatusColor(study.status)}
                      sx={{ height: 20, fontSize: "0.65rem", flexShrink: 0 }}
                    />
                  )}
                </Box>
                {study.indication && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.7, 
                      px: 1, 
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {study.indication}
                  </Typography>
                )}
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
