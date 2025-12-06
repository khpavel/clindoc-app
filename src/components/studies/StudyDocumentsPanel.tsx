import { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Menu,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import { listSourceDocuments, uploadSourceDocument, deleteSourceDocument, permanentlyDeleteSourceDocument, restoreSourceDocument } from "../../api/sourcesApi";
import { getCurrentUserRole } from "../../api/studyMembersApi";
import type { SourceDocument, SourceDocumentType } from "../../types/source";
import type { StudyMemberRole } from "../../types/study";

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
  const [currentUserRole, setCurrentUserRole] = useState<StudyMemberRole | null>(null);
  const [selectedDocumentForDelete, setSelectedDocumentForDelete] = useState<SourceDocument | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDocumentForPermanentDelete, setSelectedDocumentForPermanentDelete] = useState<SourceDocument | null>(null);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [isPermanentlyDeleting, setIsPermanentlyDeleting] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDocumentId, setMenuDocumentId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [selectedDocumentForRestore, setSelectedDocumentForRestore] = useState<SourceDocument | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (studyId !== null) {
      setLoading(true);
      setError(null);
      // Fetch documents and current user role in parallel
      Promise.all([
        listSourceDocuments(studyId),
        getCurrentUserRole(studyId).catch(() => null)
      ])
        .then(([docs, role]) => {
          setDocuments(docs);
          setCurrentUserRole(role);
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
      setCurrentUserRole(null);
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
      // Upload the document (indexing happens automatically on the backend)
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

  const canDelete = currentUserRole === "owner" || currentUserRole === "editor";
  const canPermanentlyDelete = currentUserRole === "owner";
  const canRestore = currentUserRole === "owner" || currentUserRole === "editor";

  const handleDeleteClick = (document: SourceDocument) => {
    setSelectedDocumentForDelete(document);
    setIsDeleteDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, documentId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuDocumentId(documentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuDocumentId(null);
  };

  const handlePermanentDeleteClick = (document: SourceDocument) => {
    setSelectedDocumentForPermanentDelete(document);
    setIsPermanentDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false);
      setSelectedDocumentForDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocumentForDelete || !studyId) return;

    try {
      setIsDeleting(true);
      await deleteSourceDocument(selectedDocumentForDelete.id);
      
      // Refresh the list after successful deletion
      const updatedDocs = await listSourceDocuments(studyId);
      setDocuments(updatedDocs);
      
      setIsDeleteDialogOpen(false);
      setSelectedDocumentForDelete(null);
      setSnackbarMessage("Source document archived");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete source document";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleRestoreClick = (document: SourceDocument) => {
    setSelectedDocumentForRestore(document);
    setIsRestoreDialogOpen(true);
  };

  const handleCloseRestoreDialog = () => {
    if (!isRestoring) {
      setIsRestoreDialogOpen(false);
      setSelectedDocumentForRestore(null);
    }
  };

  const handleConfirmRestore = async () => {
    if (!selectedDocumentForRestore || !studyId) return;

    try {
      setIsRestoring(true);
      const updatedDocument = await restoreSourceDocument(selectedDocumentForRestore.id);
      
      // Update the document in the list
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc))
      );
      
      setIsRestoreDialogOpen(false);
      setSelectedDocumentForRestore(null);
      setSnackbarMessage("Source document restored from archive");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to restore source document";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClosePermanentDeleteDialog = () => {
    if (!isPermanentlyDeleting) {
      setIsPermanentDeleteDialogOpen(false);
      setSelectedDocumentForPermanentDelete(null);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!selectedDocumentForPermanentDelete || !studyId) return;

    try {
      setIsPermanentlyDeleting(true);
      await permanentlyDeleteSourceDocument(selectedDocumentForPermanentDelete.id);
      
      // Refresh the list after successful permanent deletion
      const updatedDocs = await listSourceDocuments(studyId);
      setDocuments(updatedDocs);
      
      setIsPermanentDeleteDialogOpen(false);
      setSelectedDocumentForPermanentDelete(null);
      setSnackbarMessage("Source document permanently deleted");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to permanently delete source document";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsPermanentlyDeleting(false);
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
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        {uploading && <LinearProgress sx={{ flexGrow: 1, maxWidth: 200 }} />}
      </Box>

      {/* Documents Table */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {documents.length === 0 && !loading ? (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            No documents uploaded yet
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Language</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Current</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>RAG Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                  {(canDelete || canPermanentlyDelete) && <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>{doc.file_name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.versionLabel || "-"}</TableCell>
                    <TableCell>{doc.language || "-"}</TableCell>
                    <TableCell>{doc.status || "-"}</TableCell>
                    <TableCell>
                      {doc.isCurrent ? (
                        <Chip
                          label="Текущая"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.isRagEnabled ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Chip
                            label="RAG Enabled"
                            color="success"
                            size="small"
                            sx={{ fontSize: "0.7rem" }}
                          />
                          {doc.indexStatus && (
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {doc.indexStatus}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </TableCell>
                    {(canDelete || canPermanentlyDelete || canRestore) && (
                      <TableCell align="right">
                        {doc.status === "archived" ? (
                          canRestore ? (
                            <IconButton
                              size="small"
                              onClick={() => handleRestoreClick(doc)}
                              disabled={isRestoring || isDeleting || isPermanentlyDeleting}
                              title="Restore from archive"
                            >
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <Typography variant="body2" sx={{ opacity: 0.5, fontStyle: "italic" }}>
                              —
                            </Typography>
                          )
                        ) : (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, doc.id)}
                            disabled={isRestoring || isDeleting || isPermanentlyDeleting}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete source document?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this source document?
          </DialogContentText>
          {selectedDocumentForDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Type:</strong> {selectedDocumentForDelete.type}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>File Name:</strong> {selectedDocumentForDelete.file_name}
              </Typography>
              {selectedDocumentForDelete.versionLabel && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Version:</strong> {selectedDocumentForDelete.versionLabel}
                </Typography>
              )}
              {selectedDocumentForDelete.language && (
                <Typography variant="body2">
                  <strong>Language:</strong> {selectedDocumentForDelete.language}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            variant="contained"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {canDelete && (
          <MenuItem
            onClick={() => {
              const doc = documents.find((d) => d.id === menuDocumentId);
              if (doc) {
                handleDeleteClick(doc);
              }
              handleMenuClose();
            }}
            disabled={isDeleting || isPermanentlyDeleting}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Archive
          </MenuItem>
        )}
        {canPermanentlyDelete && (
          <MenuItem
            onClick={() => {
              const doc = documents.find((d) => d.id === menuDocumentId);
              if (doc) {
                handlePermanentDeleteClick(doc);
              }
            }}
            disabled={isDeleting || isPermanentlyDeleting}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Permanently delete
          </MenuItem>
        )}
      </Menu>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={isPermanentDeleteDialogOpen} onClose={handleClosePermanentDeleteDialog}>
        <DialogTitle>Permanently delete source document?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <strong>This action is irreversible.</strong> The document record, its RAG chunks, and stored file will be permanently removed. Users will no longer be able to use this document anywhere in the study.
          </DialogContentText>
          {selectedDocumentForPermanentDelete && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: (theme) => theme.palette.mode === 'light' 
                ? 'rgba(211, 47, 47, 0.08)' 
                : 'rgba(244, 67, 54, 0.16)', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'light'
                ? 'rgba(211, 47, 47, 0.2)'
                : 'rgba(244, 67, 54, 0.3)'
            }}>
              <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary" }}>
                <strong>File Name:</strong> {selectedDocumentForPermanentDelete.file_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary" }}>
                <strong>Type:</strong> {selectedDocumentForPermanentDelete.type}
              </Typography>
              {selectedDocumentForPermanentDelete.versionLabel && (
                <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary" }}>
                  <strong>Version:</strong> {selectedDocumentForPermanentDelete.versionLabel}
                </Typography>
              )}
              {selectedDocumentForPermanentDelete.language && (
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  <strong>Language:</strong> {selectedDocumentForPermanentDelete.language}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermanentDeleteDialog} disabled={isPermanentlyDeleting}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleConfirmPermanentDelete}
            disabled={isPermanentlyDeleting}
            variant="contained"
            startIcon={isPermanentlyDeleting ? <CircularProgress size={16} /> : null}
          >
            {isPermanentlyDeleting ? "Deleting..." : "Permanently delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreDialogOpen} onClose={handleCloseRestoreDialog}>
        <DialogTitle>Restore source document from archive?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            The document will be returned from archive to active state and will again be available for RAG.
          </DialogContentText>
          {selectedDocumentForRestore && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>File Name:</strong> {selectedDocumentForRestore.file_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Type:</strong> {selectedDocumentForRestore.type}
              </Typography>
              {selectedDocumentForRestore.versionLabel && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Version:</strong> {selectedDocumentForRestore.versionLabel}
                </Typography>
              )}
              {selectedDocumentForRestore.language && (
                <Typography variant="body2">
                  <strong>Language:</strong> {selectedDocumentForRestore.language}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestoreDialog} disabled={isRestoring}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleConfirmRestore}
            disabled={isRestoring}
            variant="contained"
            startIcon={isRestoring ? <CircularProgress size={16} /> : <RestoreIcon />}
          >
            {isRestoring ? "Restoring..." : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

