import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  SelectChangeEvent,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Book } from '@mui/icons-material';
import { useRouter } from 'next/router';

interface Class {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  fullName: string;
}

interface FormData {
  name: string;
  classId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const CreateSubjectPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    classId: '',
    teacherId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // بررسی لاگین
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // دریافت کلاس‌ها
      const classesRes = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      // دریافت معلمان
      const teachersRes = await fetch('/api/teachers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.classId || !formData.teacherId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      setMessage('لطفاً تمام فیلدها را پر کنید');
      setSeverity('error');
      setOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/create-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          classId: parseInt(formData.classId),
          teacherId: parseInt(formData.teacherId),
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('درس جدید با موفقیت ثبت شد');
        setSeverity('success');
        setOpen(true);
        setFormData({
          name: '',
          classId: '',
          teacherId: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
        });
      } else {
        setMessage(data.message || 'خطا در ثبت درس جدید');
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

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Book sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              ایجاد درس جدید
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="نام درس"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  placeholder="مثال: ریاضی"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>کلاس</InputLabel>
                  <Select
                    label="کلاس"
                    name="classId"
                    value={formData.classId}
                    onChange={handleSelectChange}
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>معلم</InputLabel>
                  <Select
                    label="معلم"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleSelectChange}
                  >
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>روز هفته</InputLabel>
                  <Select
                    label="روز هفته"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="شنبه">شنبه</MenuItem>
                    <MenuItem value="یکشنبه">یکشنبه</MenuItem>
                    <MenuItem value="دوشنبه">دوشنبه</MenuItem>
                    <MenuItem value="سه‌شنبه">سه‌شنبه</MenuItem>
                    <MenuItem value="چهارشنبه">چهارشنبه</MenuItem>
                    <MenuItem value="پنج‌شنبه">پنج‌شنبه</MenuItem>
                    <MenuItem value="جمعه">جمعه</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="ساعت شروع"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="ساعت پایان"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setFormData({
                      name: '',
                      classId: '',
                      teacherId: '',
                      dayOfWeek: '',
                      startTime: '',
                      endTime: '',
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
                    {submitting ? 'در حال ثبت...' : 'ثبت درس'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </Container>
  );
};

export default CreateSubjectPage;
