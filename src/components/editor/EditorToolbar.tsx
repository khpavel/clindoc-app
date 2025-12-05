import { Stack, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";

interface EditorToolbarProps {
  onSave?: () => void;
  onGenerateWithAi?: () => void;
  onInsertFromTemplate?: () => void;
  saving?: boolean;
  aiLoading?: boolean;
  aiInsertMode?: "replace" | "append";
  onAiInsertModeChange?: (mode: "replace" | "append") => void;
}

export default function EditorToolbar({
  onSave,
  onGenerateWithAi,
  onInsertFromTemplate,
  saving = false,
  aiLoading = false,
  aiInsertMode = "replace",
  onAiInsertModeChange
}: EditorToolbarProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        size="small"
        variant="outlined"
        onClick={onInsertFromTemplate}
        disabled={!onInsertFromTemplate}
      >
        Insert from template
      </Button>
      <ToggleButtonGroup
        value={aiInsertMode}
        exclusive
        onChange={(_, newMode) => {
          if (newMode !== null && onAiInsertModeChange) {
            onAiInsertModeChange(newMode);
          }
        }}
        size="small"
        disabled={aiLoading}
      >
        <ToggleButton value="replace">Replace</ToggleButton>
        <ToggleButton value="append">Append</ToggleButton>
      </ToggleButtonGroup>
      <Button
        size="small"
        variant="outlined"
        onClick={onGenerateWithAi}
        disabled={!onGenerateWithAi || aiLoading}
      >
        {aiLoading ? "Generating..." : "Generate with AI"}
      </Button>
      <Button
        size="small"
        variant="contained"
        onClick={onSave}
        disabled={saving || !onSave}
      >
        {saving ? "Saving..." : "Save"}
      </Button>
    </Stack>
  );
}
