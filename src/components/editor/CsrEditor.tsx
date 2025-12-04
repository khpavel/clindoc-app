import { useState, useCallback } from "react";
import { Box, Typography, TextField, Paper } from "@mui/material";
import EditorToolbar from "./EditorToolbar";
import { generateSectionText } from "../../api/aiApi";

export default function CsrEditor() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateWithAI = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await generateSectionText({
        section_id: 1,
        prompt: "Generate primary efficacy section"
      });
      setText(response.generated_text);
    } catch (error) {
      console.error("Failed to generate text:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          Efficacy Results — Primary Endpoint
        </Typography>
        <EditorToolbar
          onGenerateWithAI={handleGenerateWithAI}
          isGenerating={isLoading}
        />
      </Box>
      <TextField
        multiline
        fullWidth
        minRows={16}
        placeholder="Текст раздела CSR..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{
          flexGrow: 1,
          "& .MuiInputBase-root": {
            alignItems: "flex-start"
          }
        }}
      />
    </Paper>
  );
}
