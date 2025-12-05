import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert
} from "@mui/material";
import { generateSectionText } from "../../api/aiApi";

interface AiAssistantPanelProps {
  studyId: number | null;
  sectionId: number | null;
}

export default function AiAssistantPanel({
  studyId,
  sectionId
}: AiAssistantPanelProps) {
  const [input, setInput] = useState("");
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!studyId || !sectionId || !input.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateSectionText({
        study_id: studyId,
        section_id: sectionId,
        prompt: input
      });
      setLastPrompt(input);
      setLastResponse(response.generated_text);
      setInput("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate text with AI";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 1,
        p: 1.5,
        height: "55%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        AI Assistant
      </Typography>

      {!studyId || !sectionId ? (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary"
          }}
        >
          <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.7 }}>
            Выберите исследование и раздел CSR, чтобы воспользоваться ассистентом
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              mb: 1,
              p: 1,
              bgcolor: "background.default",
              borderRadius: 1,
              minHeight: 100
            }}
          >
            {lastPrompt && lastResponse && (
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                    Prompt:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                    {lastPrompt}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                    Response:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                    {lastResponse}
                  </Typography>
                </Box>
              </Stack>
            )}
            {!lastPrompt && !lastResponse && (
              <Typography variant="body2" sx={{ opacity: 0.6, textAlign: "center", mt: 2 }}>
                Здесь будут появляться ответы ассистента на ваши запросы.
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Спросить ассистента..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              sx={{ minWidth: 100 }}
            >
              {loading ? <CircularProgress size={20} /> : "Ask AI"}
            </Button>
          </Stack>
        </>
      )}
    </Paper>
  );
}

