import { Stack, Button } from "@mui/material";

export default function EditorToolbar() {
  return (
    <Stack direction="row" spacing={1}>
      <Button size="small" variant="outlined">
        Generate with AI
      </Button>
      <Button size="small" variant="outlined">
        Save
      </Button>
    </Stack>
  );
}
