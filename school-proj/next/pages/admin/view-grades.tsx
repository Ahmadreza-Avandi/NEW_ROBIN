// صفحه مشاهده و مدیریت پایه‌ها (فقط مدیر)

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, School } from '@mui/icons-material';
import { AdminRoute } from '@/components/ProtectedRoute';
import { useRequireAdmin } from '@/hooks/useAuth';

interface Grade {
  id: number;
  name: string;
  createdAt?: string;
}

export default function ViewGradesPage() {
  const { user, loading } = useRequireAdmin();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (!loading && user) {
      fetchGrades();
    }
  }, [loading, user]);

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleAddGrade = async () => {
    if (!newGradeName.trim()) {
      setSnackbar({
        open: true,
        message: 'نام پایه نمی‌تواند خالی باشد',
        severity: 'error',
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/create-grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGradeName }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'پایه با موفقیت اضافه شد',
          severity: 'success',
        });
        setOpenDialog(false);
        setNewGradeName('');
        fetchGrades();
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'خطا در افزودن پایه',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'خطا در ارتباط با سرور',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <AdminRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <School sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                مدیریت پایه‌های تحصیلی
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              افزودن پایه جدید
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>شناسه</strong></TableCell>
                  <TableCell><strong>نام پایه</strong></TableCell>
                  <TableCell align="center"><strong>تعداد کلاس‌ها</strong></TableCell>
                  <TableCell align="center"><strong>عملیات</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        هیچ پایه‌ای یافت نشد
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  grades.map((grade) => (
                    <TableRow key={grade.id} hover>
                      <TableCell>{grade.id}</TableCell>
                      <TableCell>
                        <Chip label={grade.name} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">-</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog افزودن پایه */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>افزودن پایه جدید</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="نام پایه"
              fullWidth
              value={newGradeName}
              onChange={(e) => setNewGradeName(e.target.value)}
              placeholder="مثال: دهم، یازدهم، دوازدهم"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>انصراف</Button>
            <Button onClick={handleAddGrade} variant="contained">
              افزودن
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AdminRoute>
  );
}
