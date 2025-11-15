import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Grid,
  Snackbar,
  Alert,
  SnackbarCloseReason,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { AdminRoute } from '@/components/ProtectedRoute';
import { useRequireAdmin } from '@/hooks/useAuth';

interface FormData {
  name: string;
  majorId: string;
  gradeId: string;
}

const NewClassPage: React.FC = () => {
  const { user, loading } = useRequireAdmin();
  const [majors, setMajors] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    majorId: '',
    gradeId: '',
  });

  // دریافت رشته‌ها و پایه‌ها
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [majorsRes, gradesRes] = await Promise.all([
          fetch('/api/majors'),
          fetch('/api/grades'),
        ]);
        
        if (majorsRes.ok) setMajors(await majorsRes.json());
        if (gradesRes.ok) setGrades(await gradesRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (!loading && user) {
      fetchData();
    }
  }, [loading, user]);

  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitNewClass = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/create-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('کلاس جدید با موفقیت ثبت شد');
        setSeverity('success');
        setOpen(true);
        setFormData({ name: '', majorId: '', gradeId: '' });
      } else {
        setMessage(data.message || 'خطا در ثبت کلاس جدید');
        setSeverity('error');
        setOpen(true);
      }
    } catch (error) {
      setMessage('خطا در ارتباط با سرور');
      setSeverity('error');
      setOpen(true);
      console.error('خطا در ارتباط با سرور:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitNewClass();
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <AdminRoute>
      <Container>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12}>
              <h1 style={{ textAlign: 'center' }}>ایجاد کلاس جدید</h1>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="نام کلاس"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>رشته</InputLabel>
                <Select
                  label="رشته"
                  name="majorId"
                  value={formData.majorId}
                  onChange={handleSelectChange}
                >
                  {majors.map((major) => (
                    <MenuItem key={major.id} value={major.id}>
                      {major.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>پایه</InputLabel>
                <Select
                  label="پایه"
                  name="gradeId"
                  value={formData.gradeId}
                  onChange={handleSelectChange}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ padding: '12px 24px', fontSize: '16px' }}
              >
                ثبت کلاس
              </Button>
            </Grid>
          </Grid>
        </form>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </Container>
    </AdminRoute>
  );
};

export default NewClassPage;
