// صفحه لیست معلمان (مدیر و معلم)

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
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { PersonAdd, Edit, Delete, Refresh } from '@mui/icons-material';
import { TeacherRoute } from '@/components/ProtectedRoute';
import { useRequireTeacher } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

interface Teacher {
  id: number;
  fullName: string;
  nationalCode: string;
  phoneNumber: string;
  roleName: string;
  createdAt: string;
}

export default function TeachersListPage() {
  const { user, loading, isAdmin } = useRequireTeacher();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchTeachers();
    }
  }, [loading, user]);

  const fetchTeachers = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <TeacherRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              لیست معلمان
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="بروزرسانی">
                <IconButton onClick={fetchTeachers} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => router.push('/admin/add-teacher')}
                >
                  افزودن معلم
                </Button>
              )}
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>شناسه</strong></TableCell>
                  <TableCell><strong>نام و نام خانوادگی</strong></TableCell>
                  <TableCell><strong>کد ملی</strong></TableCell>
                  <TableCell><strong>شماره تلفن</strong></TableCell>
                  <TableCell><strong>نقش</strong></TableCell>
                  {isAdmin && <TableCell align="center"><strong>عملیات</strong></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                      <Typography color="text.secondary">
                        هیچ معلمی یافت نشد
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id} hover>
                      <TableCell>{teacher.id}</TableCell>
                      <TableCell><strong>{teacher.fullName}</strong></TableCell>
                      <TableCell>{teacher.nationalCode}</TableCell>
                      <TableCell>{teacher.phoneNumber}</TableCell>
                      <TableCell>
                        <Chip label={teacher.roleName} color="primary" size="small" />
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              تعداد کل: {teachers.length} معلم
            </Typography>
          </Box>
        </Paper>
      </Container>
    </TeacherRoute>
  );
}
