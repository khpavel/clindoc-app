import { Box, Typography, List, ListItem, Chip, Paper } from "@mui/material";

const mockIssues = [
  { id: 1, severity: "major", title: "N in ITT population differs from Table 14.2.1" },
  { id: 2, severity: "minor", title: "Endpoint name inconsistent with SAP section 5.2" }
];

export default function IssueListPanel() {
  return (
    <Paper
      elevation={1}
      sx={{
        flexGrow: 1,
        p: 1,
        borderRadius: 3,
        overflow: "auto"
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Consistency issues
      </Typography>
      <List dense>
        {mockIssues.map((issue) => (
          <ListItem
            key={issue.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              mb: 0.5,
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                size="small"
                label={issue.severity.toUpperCase()}
                color={issue.severity === "major" ? "error" : "warning"}
              />
              <Typography variant="body2">{issue.title}</Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
