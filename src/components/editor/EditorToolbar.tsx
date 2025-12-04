import { Stack, Button } from "@mui/material";

interface EditorToolbarProps {
  onGenerateWithAI: () => void;
  isGenerating?: boolean;
}

export default function EditorToolbar({
  onGenerateWithAI,
  isGenerating = false
}: EditorToolbarProps) {
  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="outlined"
        onClick={onGenerateWithAI}
        disabled={isGenerating}
      >
        Generate with AI
      </Button>
      <Button size="small" variant="outlined">
        Save
      </Button>
    </Stack>
  );
}
