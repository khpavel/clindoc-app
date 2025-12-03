import { Box, Typography, TextField, IconButton, List, ListItem, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function AiAssistantPanel() {
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
      <List sx={{ flexGrow: 1, overflow: "auto", mb: 1 }}>
        <ListItem sx={{ fontSize: 14, opacity: 0.8 }}>
          Здесь будут появляться ответы ассистента на ваши запросы.
        </ListItem>
      </List>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField size="small" fullWidth placeholder="Спросить ассистента..." />
        <IconButton color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
