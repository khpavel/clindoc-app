import { useState, useEffect, useCallback } from "react";
import { Box, Typography, TextField, Paper, Alert } from "@mui/material";
import EditorToolbar from "./EditorToolbar";
import TemplatePickerDialog from "../templates/TemplatePickerDialog";
import { getLatestSectionVersion, saveSectionVersion } from "../../api/csrApi";
import { generateSectionText } from "../../api/aiApi";

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInsertMode, setAiInsertMode] = useState<"replace" | "append">("replace");

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

  const handleGenerateWithAi = useCallback(async () => {
    if (!selectedStudyId || !selectedSectionId) {
      return;
    }

    setAiLoading(true);
    setAiError(null);

    // Save current text for API call
    const currentText = text;

    try {
      const response = await generateSectionText({
        study_id: selectedStudyId,
        section_id: selectedSectionId,
        prompt: currentText || undefined,
      });
      if (aiInsertMode === "replace") {
        // Clear text before inserting new text in replace mode
        setText("");
        // Use setTimeout to ensure text is cleared before inserting new text
        setTimeout(() => {
          setText(response.generated_text);
        }, 0);
      } else {
        setText(prev => prev ? prev + "\n\n" + response.generated_text : response.generated_text);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate text with AI";
      setAiError(errorMessage);
    } finally {
      setAiLoading(false);
    }
  }, [selectedStudyId, selectedSectionId, text, aiInsertMode]);

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
          onGenerateWithAi={handleGenerateWithAi}
          onSave={handleSave}
          onInsertFromTemplate={canUseTemplate ? handleOpenTemplateDialog : undefined}
          saving={saving}
          aiLoading={aiLoading}
          aiInsertMode={aiInsertMode}
          onAiInsertModeChange={setAiInsertMode}
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
      {aiError && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setAiError(null)}>
          {aiError}
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
