import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";
import { listSectionTemplates, renderTemplate } from "../../api/templatesApi";
import type { Template, TemplateRenderResponse } from "../../types/template";

interface TemplatePickerDialogProps {
  open: boolean;
  onClose: () => void;
  studyId: number;
  sectionId: number | null;
  sectionCode: string | null;
  onApply: (renderedText: string, template: Template) => void;
}

export default function TemplatePickerDialog({
  open,
  onClose,
  studyId,
  sectionId,
  sectionCode,
  onApply
}: TemplatePickerDialogProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [preview, setPreview] = useState<TemplateRenderResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Load templates when dialog opens and sectionCode is available
  useEffect(() => {
    if (open && sectionCode) {
      setLoading(true);
      setError(null);
      setTemplates([]);
      setSelectedTemplate(null);
      setPreview(null);
      setPreviewError(null);

      listSectionTemplates(sectionCode, { language: "ru" })
        .then((data) => {
          setTemplates(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load templates");
          setLoading(false);
        });
    }
  }, [open, sectionCode]);

  // Render template preview when a template is selected
  useEffect(() => {
    if (selectedTemplate && open) {
      setLoadingPreview(true);
      setPreviewError(null);
      setPreview(null);

      renderTemplate(selectedTemplate.id, {
        study_id: studyId,
        section_id: sectionId ?? undefined
      })
        .then((data) => {
          setPreview(data);
          setLoadingPreview(false);
        })
        .catch((err) => {
          setPreviewError(err instanceof Error ? err.message : "Failed to render template");
          setLoadingPreview(false);
        });
    } else {
      setPreview(null);
      setPreviewError(null);
    }
  }, [selectedTemplate, studyId, sectionId, open]);

  const handleApply = () => {
    if (selectedTemplate && preview) {
      onApply(preview.rendered_text, selectedTemplate);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setPreview(null);
    setPreviewError(null);
    onClose();
  };

  const canApply = selectedTemplate !== null && preview !== null && !loadingPreview;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Pick a Section Template</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", height: "500px", gap: 2 }}>
          {/* Left side: Template list */}
          <Box sx={{ width: "300px", borderRight: 1, borderColor: "divider", pr: 2 }}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Templates
                </Typography>
                {templates.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No templates available
                  </Typography>
                ) : (
                  <List dense sx={{ overflow: "auto", maxHeight: "calc(100% - 40px)" }}>
                    {templates.map((template) => (
                      <ListItemButton
                        key={template.id}
                        selected={selectedTemplate?.id === template.id}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <ListItemText
                          primary={template.name}
                          secondary={template.scope ? `Scope: ${template.scope}` : undefined}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </>
            )}
          </Box>

          {/* Right side: Preview */}
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Preview
            </Typography>
            {!selectedTemplate && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "text.secondary"
                }}
              >
                <Typography variant="body2">Select a template to preview</Typography>
              </Box>
            )}
            {selectedTemplate && loadingPreview && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {selectedTemplate && previewError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {previewError}
              </Alert>
            )}
            {selectedTemplate && preview && (
              <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: "0.875rem"
                  }}
                >
                  {preview.rendered_text}
                </Box>
                {preview.missing_variables && preview.missing_variables.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="caption">
                      Missing variables: {preview.missing_variables.join(", ")}
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained" disabled={!canApply}>
          Insert into editor
        </Button>
      </DialogActions>
    </Dialog>
  );
}

