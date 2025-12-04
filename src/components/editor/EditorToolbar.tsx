import { Stack, Button } from "@mui/material";

interface EditorToolbarProps {
  onSave?: () => void;
  onGenerateWithAi?: () => void;
  onInsertFromTemplate?: () => void;
  saving?: boolean;
}

export default function EditorToolbar({
  onSave,
  onGenerateWithAi,
  onInsertFromTemplate,
  saving = false
}: EditorToolbarProps) {
  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="outlined"
        onClick={onInsertFromTemplate}
        disabled={!onInsertFromTemplate}
      >
        Insert from template
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={onGenerateWithAi}
        disabled={!onGenerateWithAi}
      >
        Generate with AI
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
