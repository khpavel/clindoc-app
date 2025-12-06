import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  IconButton,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { getStudyMembers, addStudyMember, deleteStudyMember, getCurrentUserRole } from "../../api/studyMembersApi";
import type { StudyMember, StudyMemberRole } from "../../types/study";

interface StudyMembersPanelProps {
  studyId: number | null;
  currentUserRole?: StudyMemberRole;
}

const roleLabels: Record<StudyMemberRole, string> = {
  owner: "Владелец",
  editor: "Редактор",
  viewer: "Наблюдатель"
};

const roleColors: Record<StudyMemberRole, "default" | "primary" | "success" | "warning" | "error"> = {
  owner: "error",
  editor: "primary",
  viewer: "default"
};

export default function StudyMembersPanel({
  studyId,
  currentUserRole: propCurrentUserRole
}: StudyMembersPanelProps) {
  const [members, setMembers] = useState<StudyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [currentUserRole, setCurrentUserRole] = useState<StudyMemberRole | undefined>(propCurrentUserRole);

  // Form state
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<StudyMemberRole>("editor");
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [memberToDelete, setMemberToDelete] = useState<StudyMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManageMembers = currentUserRole === "owner";

  useEffect(() => {
    if (studyId !== null) {
      setLoading(true);
      setError(null);
      
      // Fetch members and current user role in parallel
      Promise.all([
        getStudyMembers(studyId),
        // Only fetch current user role if not provided as prop
        propCurrentUserRole === undefined 
          ? getCurrentUserRole(studyId).catch(() => null)
          : Promise.resolve(propCurrentUserRole)
      ])
        .then(([membersList, userRole]) => {
          setMembers(membersList);
          if (userRole !== null && userRole !== undefined) {
            setCurrentUserRole(userRole);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Не удалось загрузить участников");
          setLoading(false);
          setMembers([]);
        });
    } else {
      setMembers([]);
      setError(null);
      setCurrentUserRole(undefined);
    }
  }, [studyId, propCurrentUserRole]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setUserId("");
    setRole("editor");
  };

  const handleCloseDialog = () => {
    if (!submitting) {
      setIsDialogOpen(false);
      setUserId("");
      setRole("editor");
    }
  };

  const handleSubmit = async () => {
    if (!studyId || !userId.trim()) {
      return;
    }

    const userIdNum = parseInt(userId.trim(), 10);
    if (isNaN(userIdNum)) {
      setSnackbarMessage("Введите корректный ID пользователя");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addStudyMember(studyId, {
        userId: userIdNum,
        role
      });

      // Refresh members list
      const updatedMembers = await getStudyMembers(studyId);
      setMembers(updatedMembers);

      setIsDialogOpen(false);
      setUserId("");
      setRole("editor");
      setSnackbarMessage("Участник успешно добавлен");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      // Extract error message from response
      const errorMessage = 
        err?.response?.data?.detail ||
        err?.message ||
        "Не удалось добавить участника";
      
      // Check if user already exists (various possible error messages)
      if (
        errorMessage.toLowerCase().includes("уже") ||
        errorMessage.toLowerCase().includes("already") ||
        errorMessage.toLowerCase().includes("exists") ||
        errorMessage.toLowerCase().includes("user already in study") ||
        errorMessage.toLowerCase().includes("already a member")
      ) {
        setSnackbarMessage("Пользователь уже добавлен в исследование");
      } else {
        setSnackbarMessage(errorMessage);
      }
      
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleDeleteClick = (member: StudyMember) => {
    setMemberToDelete(member);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete || !studyId) return;

    try {
      setIsDeleting(true);
      await deleteStudyMember(studyId, memberToDelete.id);
      
      // Update members list after successful deletion
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      
      setSnackbarMessage("Участник удалён");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось удалить участника";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setMemberToDelete(null);
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
          Выберите исследование для просмотра участников
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden"
        }}
      >
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 2,
            flexShrink: 0
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Участники исследования
          </Typography>
          {canManageMembers && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ flexShrink: 0 }}
            >
              Добавить участника
            </Button>
          )}
        </Box>

        {loading && <LinearProgress sx={{ mb: 2, flexShrink: 0 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, overflow: "auto", minHeight: 0 }}>
          {members.length === 0 && !loading ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              В этом исследовании пока только владелец. Добавьте других участников через кнопку выше.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Дата добавления</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Box>
                          {member.userName && (
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {member.userName}
                            </Typography>
                          )}
                          {member.userEmail && (
                            <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
                              {member.userEmail}
                            </Typography>
                          )}
                          {!member.userName && !member.userEmail && (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              ID: {member.userId}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={roleLabels[member.role]}
                          size="small"
                          color={roleColors[member.role]}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          {new Date(member.createdAt).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {canManageMembers ? (
                          member.role === "owner" ? (
                            <Tooltip title="Нельзя удалить владельца исследования">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled
                                >
                                  <DeleteForeverIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(member)}
                            >
                              <DeleteForeverIcon fontSize="small" />
                            </IconButton>
                          )
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.5, fontStyle: "italic" }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Add Member Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить участника</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="ID пользователя"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              fullWidth
              disabled={submitting}
              helperText="Введите ID пользователя для добавления"
            />
            <FormControl fullWidth disabled={submitting}>
              <InputLabel id="role-label">Роль</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Роль"
                onChange={(e) => setRole(e.target.value as StudyMemberRole)}
              >
                <MenuItem value="owner">Владелец</MenuItem>
                <MenuItem value="editor">Редактор</MenuItem>
                <MenuItem value="viewer">Просмотр</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !userId.trim()}
          >
            {submitting ? "Добавление..." : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!memberToDelete} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Удалить участника</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить участника{" "}
            {memberToDelete?.userEmail ?? memberToDelete?.userName ?? `ID: ${memberToDelete?.userId}`}{" "}
            из исследования?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Отмена
          </Button>
          <Button
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            variant="contained"
          >
            {isDeleting ? "Удаление..." : "Удалить"}
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
    </>
  );
}

