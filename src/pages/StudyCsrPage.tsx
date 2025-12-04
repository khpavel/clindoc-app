import { type FC, useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from "@mui/material";
import SectionTree from "../components/navigation/SectionTree";
import CsrEditor from "../components/editor/CsrEditor";
import AiAssistantPanel from "../components/assistant/AiAssistantPanel";
import IssueListPanel from "../components/issues/IssueListPanel";
import StudyDocumentsPanel from "../components/studies/StudyDocumentsPanel";
import SplitPane from "../components/common/SplitPane";
import { getCsrDocument } from "../api/csrApi";
import type { CsrDocument, CsrSection } from "../types/csr";

interface StudyCsrPageProps {
  selectedStudyId: number | null;
}

const StudyCsrPage: FC<StudyCsrPageProps> = ({ selectedStudyId }) => {
  const [csr, setCsr] = useState<CsrDocument | null>(null);
  const [sections, setSections] = useState<CsrSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStudyId !== null) {
      setLoading(true);
      setError(null);
      setCsr(null);
      setSections([]);
      setSelectedSectionId(null);
      getCsrDocument(selectedStudyId)
        .then((document) => {
          setCsr(document);
          setSections(document.sections);
          if (document.sections && document.sections.length > 0) {
            setSelectedSectionId(document.sections[0].id);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load CSR document");
          setCsr(null);
          setSections([]);
          setSelectedSectionId(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCsr(null);
      setSections([]);
      setSelectedSectionId(null);
      setError(null);
    }
  }, [selectedStudyId]);

  if (selectedStudyId === null) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "text.secondary"
        }}
      >
        <Typography variant="h6">Select a study</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          mb: 1,
          px: 1,
          py: 0.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          Selected study: {selectedStudyId ?? "None"}
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {csr && (
        <Box sx={{ mb: 1, px: 1, py: 1, borderRadius: 2, bgcolor: "background.paper" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {csr.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
            Status: {csr.status}
          </Typography>
          {csr.sections && csr.sections.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Sections:
              </Typography>
              <List dense sx={{ py: 0 }}>
                {csr.sections.map((section) => (
                  <ListItem key={section.id} sx={{ py: 0.25, px: 1 }}>
                    <ListItemText
                      primary={section.title}
                      secondary={section.code}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
        <Paper
          elevation={1}
          sx={{
            width: 260,
            mr: 1,
            height: "100%",
            overflow: "auto",
            borderRadius: 3,
            p: 0.5
          }}
        >
          <SectionTree
            sections={sections}
            selectedSectionId={selectedSectionId}
            selectedSectionCode={
              selectedSectionId !== null
                ? sections.find((s) => s.id === selectedSectionId)?.code ?? null
                : null
            }
            onSelectSection={setSelectedSectionId}
          />
        </Paper>

        <SplitPane
          left={
            <CsrEditor
              selectedSectionId={selectedSectionId}
              selectedStudyId={selectedStudyId}
              selectedSectionCode={
                selectedSectionId !== null
                  ? sections.find((s) => s.id === selectedSectionId)?.code ?? null
                  : null
              }
            />
          }
          right={
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 1 }}>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <StudyDocumentsPanel studyId={selectedStudyId} />
              </Box>
              <AiAssistantPanel />
              <IssueListPanel />
            </Box>
          }
          initialRightWidth={380}
        />
      </Box>
    </Box>
  );
};

export default StudyCsrPage;
