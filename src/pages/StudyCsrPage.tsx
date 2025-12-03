import { Box, Paper } from "@mui/material";
import SectionTree from "../components/navigation/SectionTree";
import CsrEditor from "../components/editor/CsrEditor";
import AiAssistantPanel from "../components/assistant/AiAssistantPanel";
import IssueListPanel from "../components/issues/IssueListPanel";
import SplitPane from "../components/common/SplitPane";

export default function StudyCsrPage() {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Paper
        elevation={1}
        sx={{
          width: 260,
          mr: 1,
          height: "100%",
          overflow: "auto",
          borderRadius: 3,
          p: 0.5
        }}
      >
        <SectionTree />
      </Paper>

      <SplitPane
        left={<CsrEditor />}
        right={
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <AiAssistantPanel />
            <IssueListPanel />
          </Box>
        }
        initialRightWidth={380}
      />
    </Box>
  );
}
