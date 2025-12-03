import { type ReactNode, useState } from "react";
import { Box } from "@mui/material";

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  initialRightWidth?: number;
}

export default function SplitPane({ left, right, initialRightWidth = 380 }: SplitPaneProps) {
  const [rightWidth] = useState(initialRightWidth);

  return (
    <Box sx={{ display: "flex", flexGrow: 1, height: "100%", overflow: "hidden" }}>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>{left}</Box>
      <Box
        sx={{
          width: rightWidth,
          pl: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        {right}
      </Box>
    </Box>
  );
}
