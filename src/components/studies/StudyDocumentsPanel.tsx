import { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel
} from "@mui/material";
import { listSourceDocuments, uploadSourceDocument } from "../../api/sourcesApi";
import type { SourceDocument, SourceDocumentType } from "../../types/source";

interface StudyDocumentsPanelProps {
  studyId: number | null;
}

export default function StudyDocumentsPanel({ studyId }: StudyDocumentsPanelProps) {
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SourceDocumentType>("protocol");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (studyId !== null) {
      setLoading(true);
      setError(null);
      listSourceDocuments(studyId)
        .then((docs) => {
          setDocuments(docs);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load documents");
          setLoading(false);
          setDocuments([]);
        });
    } else {
      setDocuments([]);
      setError(null);
    }
  }, [studyId]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile || studyId === null) {
      return;
    }

    setUploading(true);
    setError(null);
    try {
      await uploadSourceDocument(studyId, selectedFile, selectedType);
      // Refresh the list after successful upload
      const updatedDocs = await listSourceDocuments(studyId);
      setDocuments(updatedDocs);
      // Reset file input and selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (studyId === null) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 3
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Select a study to see documents
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Source Documents
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Upload Form */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <Button
          variant="outlined"
          onClick={handleFileSelect}
          disabled={uploading}
          size="small"
        >
          Select File
        </Button>
        {selectedFile && (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {selectedFile.name}
          </Typography>
        )}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value as SourceDocumentType)}
            disabled={uploading}
          >
            <MenuItem value="protocol">Protocol</MenuItem>
            <MenuItem value="sap">SAP</MenuItem>
            <MenuItem value="tlf">TLF</MenuItem>
            <MenuItem value="csr_prev">CSR Previous</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          size="small"
        >
          Upload
        </Button>
        {uploading && <LinearProgress sx={{ flexGrow: 1, maxWidth: 200 }} />}
      </Box>

      {/* Documents List */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {documents.length === 0 && !loading ? (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            No documents uploaded yet
          </Typography>
        ) : (
          <List dense>
            {documents.map((doc) => (
              <ListItem
                key={doc.id}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": {
                    borderBottom: "none"
                  }
                }}
              >
                <ListItemText
                  primary={doc.file_name}
                  secondary={
                    <>
                      <Typography component="span" variant="caption" sx={{ display: "block" }}>
                        Type: {doc.type}
                      </Typography>
                      <Typography component="span" variant="caption" sx={{ display: "block" }}>
                        Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}

