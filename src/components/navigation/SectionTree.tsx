import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import type { CsrSection } from "../../types/csr";

interface SectionTreeProps {
  sections: CsrSection[];
  selectedSectionId: number | null;
  selectedSectionCode?: string | null;
  onSelectSection: (sectionId: number) => void;
}

export default function SectionTree({
  sections,
  selectedSectionId,
  selectedSectionCode,
  onSelectSection
}: SectionTreeProps) {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ px: 1, mb: 1, opacity: 0.7 }}>
        CSR Sections
      </Typography>
      <List dense>
        {sections.map((section) => (
          <ListItemButton
            key={section.id}
            selected={section.id === selectedSectionId}
            onClick={() => onSelectSection(section.id)}
          >
            <ListItemText primary={section.title} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
