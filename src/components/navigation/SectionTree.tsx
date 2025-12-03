import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";

export default function SectionTree() {
  const sections = [
    "Synopsis",
    "Efficacy Results",
    "Safety Results",
    "Pharmacokinetics",
    "Discussion"
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ px: 1, mb: 1, opacity: 0.7 }}>
        CSR Sections
      </Typography>
      <List dense>
        {sections.map((s) => (
          <ListItemButton key={s} selected={s === "Efficacy Results"}>
            <ListItemText primary={s} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
