// صفحه افزودن معلم (فقط مدیر)

import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { AdminRoute } from '@/components/ProtectedRoute';
import { useRequireAdmin } from '@/hooks/useAuth';

interface TeacherFormData {
  fullName: string;
  nationalCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export default function AddTeacherPage() {
  const { user, loading } = useRequireAdmin();
  const [formData, setFormData] = useState<TeacherFormData>({
    fullName: '',
    nationalCode: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی
    if (formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'رمز عبور و تکرار آن یکسان نیستند',
        severity: 'error',
      });
      return;
    }

    if (formData.nationalCode.length !== 10) {
      setSnackbar({
        open: true,
        message: 'کد ملی باید 10 رقم باشد',
        severity: 'error',
      });
      return;
    }

    if (formData.phoneNumber.length !== 11) {
      setSnackbar({
        open: true,
        message: 'شماره تلفن باید 11 رقم باشد',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/add-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          nationalCode: formData.nationalCode,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'معلم با موفقیت اضافه شد',
          severity: 'success',
        });
        // ریست فرم
        setFormData({
          fullName: '',
          nationalCode: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'خطا در افزودن معلم',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'خطا در ارتباط با سرور',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <AdminRoute>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonAdd sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              افزودن معلم جدید
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نام و نام خانوادگی"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="کد ملی"
                  name="nationalCode"
                  value={formData.nationalCode}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  inputProps={{ maxLength: 10, pattern: '[0-9]*' }}
                  helperText="10 رقم"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="شماره تلفن"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  inputProps={{ maxLength: 11, pattern: '[0-9]*' }}
                  helperText="11 رقم (مثال: 09123456789)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="رمز عبور"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="حداقل 6 کاراکتر"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="تکرار رمز عبور"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setFormData({
                      fullName: '',
                      nationalCode: '',
                      phoneNumber: '',
                      password: '',
                      confirmPassword: '',
                    })}
                  >
                    پاک کردن
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{ minWidth: 120 }}
                  >
                    {submitting ? 'در حال ثبت...' : 'افزودن معلم'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
