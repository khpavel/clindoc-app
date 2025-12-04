import { type FC } from "react";
import { Box, Paper, Typography } from "@mui/material";
import SectionTree from "../components/navigation/SectionTree";
import CsrEditor from "../components/editor/CsrEditor";
import AiAssistantPanel from "../components/assistant/AiAssistantPanel";
import IssueListPanel from "../components/issues/IssueListPanel";
import SplitPane from "../components/common/SplitPane";

interface StudyCsrPageProps {
  selectedStudyId: number | null;
}

const StudyCsrPage: FC<StudyCsrPageProps> = ({ selectedStudyId }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          mb: 1,
          px: 1,
          py: 0.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          Selected study: {selectedStudyId ?? "None"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
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
    </Box>
  );
};

export default StudyCsrPage;
