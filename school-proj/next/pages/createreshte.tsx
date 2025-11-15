import { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Category } from '@mui/icons-material';
import { AdminRoute } from '@/components/ProtectedRoute';
import { useRequireAdmin } from '@/hooks/useAuth';

const CreateMajorPage: React.FC = () => {
  const { user, loading } = useRequireAdmin();
  const [majorName, setMajorName] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!majorName.trim()) {
      setMessage('لطفاً نام رشته را وارد کنید');
      setSeverity('error');
      setOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/create-major', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: majorName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('رشته جدید با موفقیت ثبت شد');
        setSeverity('success');
        setOpen(true);
        setMajorName('');
      } else {
        setMessage(data.message || 'خطا در ثبت رشته جدید');
        setSeverity('error');
        setOpen(true);
      }
    } catch (error) {
      setMessage('خطا در ارتباط با سرور');
      setSeverity('error');
      setOpen(true);
      console.error('خطا در ارتباط با سرور:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <AdminRoute>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Category sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              ایجاد رشته جدید
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="نام رشته"
              name="name"
              value={majorName}
              onChange={(e) => setMajorName(e.target.value)}
              fullWidth
              required
              margin="normal"
              placeholder="مثال: شبکه و نرم‌افزار"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setMajorName('')}
              >
                پاک کردن
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ minWidth: 120 }}
              >
                {submitting ? 'در حال ثبت...' : 'ثبت رشته'}
              </Button>
            </Box>
          </form>
        </Paper>

        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </Container>
    </AdminRoute>
  );
};

export default CreateMajorPage;
