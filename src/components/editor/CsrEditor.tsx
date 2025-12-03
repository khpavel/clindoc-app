import { Box, Typography, TextField, Paper } from "@mui/material";
import EditorToolbar from "./EditorToolbar";

export default function CsrEditor() {
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
        <EditorToolbar />
      </Box>
      <TextField
        multiline
        fullWidth
        minRows={16}
        placeholder="Текст раздела CSR..."
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
