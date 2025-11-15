// صفحه مدیریت جامع (پایه، رشته، کلاس، درس) - فقط مدیر

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete, School, Class as ClassIcon, Book, Category } from '@mui/icons-material';
import { AdminRoute } from '@/components/ProtectedRoute';
import { useRequireAdmin } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ManageAllPage() {
  const { user, loading } = useRequireAdmin();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [grades, setGrades] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && user) {
      fetchAllData();
    }
  }, [loading, user]);

  const fetchAllData = async () => {
    try {
      const [gradesRes, majorsRes, classesRes, subjectsRes] = await Promise.all([
        fetch('/api/grades'),
        fetch('/api/majors'),
        fetch('/api/classes'),
        fetch('/api/subjects'),
      ]);

      if (gradesRes.ok) setGrades(await gradesRes.json());
      if (majorsRes.ok) setMajors(await majorsRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <AdminRoute>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<School />} label="پایه‌ها" />
              <Tab icon={<Category />} label="رشته‌ها" />
              <Tab icon={<ClassIcon />} label="کلاس‌ها" />
              <Tab icon={<Book />} label="دروس" />
            </Tabs>
          </Box>

          {/* تب پایه‌ها */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                پایه‌های تحصیلی
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/admin/view-grades')}
              >
                افزودن پایه
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>شناسه</strong></TableCell>
                    <TableCell><strong>نام پایه</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id} hover>
                      <TableCell>{grade.id}</TableCell>
                      <TableCell>
                        <Chip label={grade.name} color="primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* تب رشته‌ها */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                رشته‌های تحصیلی
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/createreshte')}
              >
                افزودن رشته
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>شناسه</strong></TableCell>
                    <TableCell><strong>نام رشته</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {majors.map((major) => (
                    <TableRow key={major.id} hover>
                      <TableCell>{major.id}</TableCell>
                      <TableCell>
                        <Chip label={major.name} color="secondary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* تب کلاس‌ها */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                کلاس‌ها
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/createclass')}
              >
                افزودن کلاس
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>شناسه</strong></TableCell>
                    <TableCell><strong>نام کلاس</strong></TableCell>
                    <TableCell><strong>رشته</strong></TableCell>
                    <TableCell><strong>پایه</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((cls: any) => (
                    <TableRow key={cls.id} hover>
                      <TableCell>{cls.id}</TableCell>
                      <TableCell><strong>{cls.name}</strong></TableCell>
                      <TableCell>
                        <Chip label={cls.major || '-'} size="small" color="secondary" />
                      </TableCell>
                      <TableCell>
                        <Chip label={cls.grade || '-'} size="small" color="primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* تب دروس */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                دروس
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/createdars')}
              >
                افزودن درس
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>شناسه</strong></TableCell>
                    <TableCell><strong>نام درس</strong></TableCell>
                    <TableCell><strong>کلاس</strong></TableCell>
                    <TableCell><strong>معلم</strong></TableCell>
                    <TableCell><strong>روز</strong></TableCell>
                    <TableCell><strong>ساعت</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.map((subject: any) => (
                    <TableRow key={subject.id} hover>
                      <TableCell>{subject.id}</TableCell>
                      <TableCell><strong>{subject.name}</strong></TableCell>
                      <TableCell>{subject.className || '-'}</TableCell>
                      <TableCell>{subject.teacherName || '-'}</TableCell>
                      <TableCell>
                        <Chip label={subject.dayOfWeek} size="small" />
                      </TableCell>
                      <TableCell>
                        {subject.startTime} - {subject.endTime}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      </Container>
    </AdminRoute>
  );
}
