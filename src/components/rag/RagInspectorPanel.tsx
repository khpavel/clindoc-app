import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  CircularProgress,
  Button,
  Alert
} from "@mui/material";
import { getRagChunksForStudy } from "../../api/ragApi";
import type { RagChunk } from "../../types/rag";

interface RagInspectorPanelProps {
  studyId: number | null;
}

export default function RagInspectorPanel({ studyId }: RagInspectorPanelProps) {
  const [sourceType, setSourceType] = useState<string>("");
  const [chunks, setChunks] = useState<RagChunk[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chunks when studyId, sourceType, or offset changes
  useEffect(() => {
    if (studyId === null) {
      setChunks([]);
      setTotal(0);
      setSelectedChunkId(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    getRagChunksForStudy(studyId, {
      sourceType: sourceType || undefined,
      limit,
      offset
    })
      .then((response) => {
        setChunks(response.chunks);
        setTotal(response.total_chunks);
        // Reset selected chunk if it's not in the current list
        if (selectedChunkId !== null && !response.chunks.some((c) => c.id === selectedChunkId)) {
          setSelectedChunkId(null);
        }
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "Failed to load RAG chunks";
        setError(errorMessage);
        setChunks([]);
        setTotal(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [studyId, sourceType, offset, limit]);

  // Reset offset when sourceType changes
  useEffect(() => {
    if (studyId !== null) {
      setOffset(0);
      setSelectedChunkId(null);
    }
  }, [sourceType, studyId]);

  const selectedChunk = chunks.find((c) => c.id === selectedChunkId);

  const handlePrevious = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const handleNext = () => {
    setOffset((prev) => Math.min(total - limit, prev + limit));
  };

  const canGoPrevious = offset > 0;
  const canGoNext = offset + limit < total;

  if (studyId === null) {
    return (
      <Paper
        elevation={1}
        sx={{
          flexGrow: 1,
          p: 2,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Выберите исследование для просмотра RAG-чанков
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        flexGrow: 1,
        p: 1.5,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
        RAG chunks for study {studyId}
      </Typography>

      <Box sx={{ mb: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Source Type</InputLabel>
          <Select
            value={sourceType}
            label="Source Type"
            onChange={(e) => setSourceType(e.target.value)}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="protocol">protocol</MenuItem>
            <MenuItem value="sap">sap</MenuItem>
            <MenuItem value="tlf">tlf</MenuItem>
            <MenuItem value="csr_prev">csr_prev</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexGrow: 1, gap: 1.5, overflow: "hidden" }}>
        {/* Left side: Chunks list */}
        <Box
          sx={{
            flex: "0 0 300px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <List
                dense
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1
                }}
              >
                {chunks.map((chunk) => (
                  <ListItemButton
                    key={chunk.id}
                    selected={chunk.id === selectedChunkId}
                    onClick={() => setSelectedChunkId(chunk.id)}
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      py: 1,
                      "&.Mui-selected": {
                        backgroundColor: "action.selected"
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, mb: 0.5, width: "100%" }}>
                      <Typography variant="caption" color="text.secondary">
                        {chunk.source_type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{chunk.order_index}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                          {chunk.text.length > 80 ? `${chunk.text.substring(0, 80)}...` : chunk.text}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious || loading}
                >
                  Previous
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {offset + 1}-{Math.min(offset + limit, total)} of {total}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleNext}
                  disabled={!canGoNext || loading}
                >
                  Next
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Right side: Selected chunk text */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selectedChunk ? (
            <TextField
              multiline
              fullWidth
              readOnly
              value={selectedChunk.text}
              label={`Chunk #${selectedChunk.order_index} (${selectedChunk.source_type})`}
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-root": {
                  alignItems: "flex-start",
                  height: "100%"
                },
                "& .MuiInputBase-input": {
                  height: "100% !important",
                  overflow: "auto !important"
                }
              }}
            />
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Выберите чанк для просмотра полного текста
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

