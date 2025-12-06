import { type FC, useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SectionTree from "../components/navigation/SectionTree";
import CsrEditor from "../components/editor/CsrEditor";
import AiAssistantPanel from "../components/ai/AiAssistantPanel";
import IssueListPanel from "../components/issues/IssueListPanel";
import StudyDocumentsPanel from "../components/studies/StudyDocumentsPanel";
import StudyMembersPanel from "../components/studies/StudyMembersPanel";
import RagInspectorPanel from "../components/rag/RagInspectorPanel";
import { getCsrDocument } from "../api/csrApi";
import { getStudy } from "../api/studiesApi";
import type { CsrDocument, CsrSection } from "../types/csr";
import type { Study } from "../types/study";

interface StudyCsrPageProps {
  selectedStudyId: number | null;
}

const StudyCsrPage: FC<StudyCsrPageProps> = ({ selectedStudyId }) => {
  const [csr, setCsr] = useState<CsrDocument | null>(null);
  const [sections, setSections] = useState<CsrSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStudyId !== null) {
      setLoading(true);
      setError(null);
      setCsr(null);
      setSections([]);
      setStudy(null);
      setSelectedSectionId(null);
      
      Promise.all([
        getStudy(selectedStudyId).catch((err) => {
          // Study not found is not a critical error - we can still load CSR
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
            console.warn(`Study ${selectedStudyId} not found, continuing without study metadata`);
          } else {
            console.error(`Failed to load study ${selectedStudyId}:`, err);
          }
          return null;
        }),
        getCsrDocument(selectedStudyId).catch((err) => {
          throw err;
        })
      ])
        .then(([studyData, document]) => {
          setStudy(studyData);
          setCsr(document);
          setSections(document.sections);
          if (document.sections && document.sections.length > 0) {
            setSelectedSectionId(document.sections[0].id);
          }
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          // Provide more context in error message
          if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
            setError(`CSR document not found for study ${selectedStudyId}. The study or CSR document may not exist.`);
          } else {
            setError(`Failed to load CSR document: ${errorMessage}`);
          }
          setCsr(null);
          setSections([]);
          setStudy(null);
          setSelectedSectionId(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCsr(null);
      setSections([]);
      setStudy(null);
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
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          gap: 0.5
        }}
      >
        {study && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {study.code}
              </Typography>
              {study.title && (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {study.title}
                </Typography>
              )}
            </Box>
            {(study.indication || study.sponsorName) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {study.indication && (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    <strong>Indication:</strong> {study.indication}
                  </Typography>
                )}
                {study.sponsorName && (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    <strong>Sponsor:</strong> {study.sponsorName}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
        {!study && selectedStudyId && (
          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
            Study ID: {selectedStudyId}
          </Typography>
        )}
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
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
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

          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              minHeight: 0,
              gap: 1,
              flexDirection: { xs: "column", md: "row" }
            }}
          >
            {/* Main CSR Editor Area */}
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                minHeight: 0
              }}
            >
              <CsrEditor
                selectedSectionId={selectedSectionId}
                selectedStudyId={selectedStudyId}
                selectedSectionCode={
                  selectedSectionId !== null
                    ? sections.find((s) => s.id === selectedSectionId)?.code ?? null
                    : null
                }
              />
            </Box>

            {/* Right Sidebar with AI Assistant and other panels */}
            <Box
              sx={{
                width: { xs: "100%", md: 380 },
                minWidth: { md: 320 },
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                gap: 1
              }}
            >
              <AiAssistantPanel studyId={selectedStudyId} sectionId={selectedSectionId} />
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <StudyDocumentsPanel studyId={selectedStudyId} />
              </Box>
              <IssueListPanel />
            </Box>
          </Box>
        </Box>

        {/* Study Members Panel - Collapsible */}
        <Accordion
          defaultExpanded={false}
          sx={{
            mt: 1,
            "&:before": {
              display: "none"
            },
            boxShadow: 1
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              "&.Mui-expanded": {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Участники исследования
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "background.paper" }}>
            <Box sx={{ height: 400, minHeight: 400 }}>
              <StudyMembersPanel studyId={selectedStudyId} />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* RAG Debug Panel - Collapsible */}
        <Accordion
          sx={{
            mt: 1,
            "&:before": {
              display: "none"
            },
            boxShadow: 1
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              "&.Mui-expanded": {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              RAG Debug
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, bgcolor: "background.paper" }}>
            <Box sx={{ height: 400, minHeight: 400 }}>
              <RagInspectorPanel studyId={selectedStudyId} />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default StudyCsrPage;
