import React, { useState, FormEvent } from 'react';
import { Box, Paper, TextField, Button, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
    } catch (err: unknown) {
      let message = 'Login failed. Please check your credentials and try again.';
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => theme.palette.grey[100],
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your credentials to access the application.
        </Typography>

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="username"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading || !username || !password}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}


