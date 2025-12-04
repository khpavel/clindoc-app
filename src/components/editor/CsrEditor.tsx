import { useState, useEffect, useCallback } from "react";
import { Box, Typography, TextField, Paper, Alert } from "@mui/material";
import EditorToolbar from "./EditorToolbar";
import TemplatePickerDialog from "../templates/TemplatePickerDialog";
import { getLatestSectionVersion, saveSectionVersion } from "../../api/csrApi";

interface CsrEditorProps {
  selectedSectionId: number | null;
  selectedStudyId: number | null;
  selectedSectionCode?: string | null;
}

export default function CsrEditor({ selectedSectionId, selectedStudyId, selectedSectionCode }: CsrEditorProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Load section text when selectedSectionId changes
  useEffect(() => {
    if (selectedSectionId === null) {
      setText("");
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    getLatestSectionVersion(selectedSectionId)
      .then((version) => {
        setText(version.text);
      })
      .catch((err) => {
        // Handle 404 (no versions yet) by setting empty text
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("404")) {
          setText("");
        } else {
          setError(errorMessage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedSectionId]);

  const handleSave = useCallback(async () => {
    if (selectedSectionId === null) {
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await saveSectionVersion(selectedSectionId, { text });
      setSaveSuccess(true);
      // Clear success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save section version");
    } finally {
      setSaving(false);
    }
  }, [selectedSectionId, text]);

  const handleGenerateWithAI = useCallback(() => {
    // Stub for now; will be connected to AI API later
    console.log("Generate with AI clicked");
  }, []);

  const handleOpenTemplateDialog = useCallback(() => {
    setIsTemplateDialogOpen(true);
  }, []);

  const isDisabled = selectedStudyId === null || selectedSectionId === null;
  const canUseTemplate = selectedStudyId !== null && selectedSectionId !== null;

  return (
    <Paper
      elevation={1}
      sx={{
        flexGrow: 1,
        height: "100%",
        mr: 1,
        p: 1.5,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Box
        sx={{
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {selectedSectionId ? "CSR Section Editor" : "Select a section to edit"}
        </Typography>
        <EditorToolbar
          onGenerateWithAi={handleGenerateWithAI}
          onSave={handleSave}
          onInsertFromTemplate={canUseTemplate ? handleOpenTemplateDialog : undefined}
          saving={saving}
        />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 1 }}>
          Saved successfully
        </Alert>
      )}
      <TextField
        multiline
        fullWidth
        minRows={16}
        placeholder={isDisabled ? "Select a section to edit..." : "Текст раздела CSR..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isDisabled || loading}
        sx={{
          flexGrow: 1,
          "& .MuiInputBase-root": {
            alignItems: "flex-start"
          }
        }}
      />
      <TemplatePickerDialog
        open={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        studyId={selectedStudyId ?? 0}
        sectionId={selectedSectionId}
        sectionCode={selectedSectionCode ?? null}
        onApply={(renderedText, _template) => {
          setText(renderedText);
        }}
      />
    </Paper>
  );
}
