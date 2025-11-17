// صفحه حاضری دانش‌آموز - فقط برای دانش‌آموزان (roleId = 3)

import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Alert, Grid, Card, CardContent, Stack, Divider, Button
} from '@mui/material';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { 
  Check as CheckIcon, 
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Book as BookIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useRequireAuth } from '@/hooks/useAuth';
import { getUserFromToken } from '@/lib/auth';

interface AttendanceRecord {
  jalali_date: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  status: 'present' | 'absent';
  checkin_time: string | null;
  dayOfWeek?: string;
}

interface StudentInfo {
  fullName: string;
  nationalCode: string;
  className: string;
  photo: string;
}

export default function StudentAttendancePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [startDate, setStartDate] = useState<DateObject>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );
  const [endDate, setEndDate] = useState<DateObject>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اطلاعات دانش‌آموز
  useEffect(() => {
    const loadStudentInfo = async () => {
      const userData = getUserFromToken();
      if (!userData) return;

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStudentInfo({
            fullName: data.fullName,
            nationalCode: data.nationalCode,
            className: data.className || 'نامشخص',
            photo: `https://photo-attendance-system.storage.c2.liara.space/user_register/${data.nationalCode}.jpg?ts=${Date.now()}`
          });
        }
      } catch (err) {
        console.error('Error loading student info:', err);
      }
    };

    if (user) {
      loadStudentInfo();
    }
  }, [user]);

  // دریافت حاضری‌ها
  const fetchAttendance = async () => {
    if (!user || !studentInfo) return;

    setLoading(true);
    setError(null);

    try {
      const startDateStr = startDate.format('YYYY/MM/DD');
      const endDateStr = endDate.format('YYYY/MM/DD');

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `/api/student-attendance?startDate=${startDateStr}&endDate=${endDateStr}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات حاضری');
      }

      const data = await response.json();
      setAttendanceData(data.attendance || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  // حذف بارگذاری خودکار - فقط با دکمه بررسی
  // useEffect(() => {
  //   if (studentInfo && startDate && endDate) {
  //     fetchAttendance();
  //   }
  // }, [startDate, endDate, studentInfo]);

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // بررسی اینکه کاربر دانش‌آموز باشد
  if (user && user.roleId !== 3) {
    return (
      <Box p={3}>
        <Alert severity="error">
          این صفحه فقط برای دانش‌آموزان است
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* هدر با اطلاعات دانش‌آموز */}
      {studentInfo && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Box
                  component="img"
                  src={studentInfo.photo}
                  alt={studentInfo.fullName}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = "/no-avatar.png";
                  }}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '3px solid white',
                    objectFit: 'cover'
                  }}
                />
              </Grid>
              <Grid item xs>
                <Typography variant="h5" color="white" fontWeight="bold">
                  {studentInfo.fullName}
                </Typography>
                <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
                  کد ملی: {studentInfo.nationalCode}
                </Typography>
                <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
                  کلاس: {studentInfo.className}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* انتخاب بازه تاریخ */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon color="primary" />
          انتخاب بازه زمانی
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>
              تاریخ شروع
            </Typography>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={startDate}
              onChange={(date) => date && setStartDate(date)}
              format="YYYY/MM/DD"
              style={{
                width: '100%',
                height: '56px',
                padding: '16.5px 14px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>
              تاریخ پایان
            </Typography>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={endDate}
              onChange={(date) => date && setEndDate(date)}
              format="YYYY/MM/DD"
              style={{
                width: '100%',
                height: '56px',
                padding: '16.5px 14px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={fetchAttendance}
              disabled={loading || !studentInfo}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalendarIcon />}
              sx={{
                height: '56px',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'در حال بررسی...' : 'بررسی'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* نمایش خطا */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* جدول حاضری */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookIcon color="primary" />
            لیست حاضری دروس
          </Typography>
        </Box>
        <TableContainer sx={{ 
          maxHeight: 600, 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#555',
            },
          },
        }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell 
                  align="center" 
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    width: '60px'
                  }}
                >
                  #
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}
                >
                  تاریخ
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}
                >
                  نام درس
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}
                >
                  ساعت درس
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}
                >
                  ساعت حضور
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}
                >
                  وضعیت
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      در حال بارگذاری...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : attendanceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {studentInfo 
                        ? 'رکورد حاضری در این بازه زمانی یافت نشد. لطفاً تاریخ را انتخاب کرده و دکمه "بررسی" را بزنید.'
                        : 'در حال بارگذاری اطلاعات...'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData.map((record, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: record.status === 'present' 
                        ? 'rgba(76, 175, 80, 0.05)' 
                        : 'rgba(244, 67, 54, 0.05)',
                      '&:hover': {
                        backgroundColor: record.status === 'present'
                          ? 'rgba(76, 175, 80, 0.1)'
                          : 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    <TableCell align="center">
                      <Chip 
                        label={index + 1} 
                        size="small" 
                        sx={{ 
                          fontWeight: 'bold',
                          minWidth: '40px'
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="medium" color="primary">
                        {record.jalali_date}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="medium">
                        {record.subjectName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography>
                          {record.startTime.substring(0, 5)} - {record.endTime.substring(0, 5)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {record.checkin_time ? (
                        <Typography color="text.secondary">
                          {record.checkin_time.substring(0, 5)}
                        </Typography>
                      ) : (
                        <Typography color="text.disabled">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={record.status === 'present' ? 'حاضر' : 'غایب'}
                        color={record.status === 'present' ? 'success' : 'error'}
                        icon={record.status === 'present' ? <CheckIcon /> : <CloseIcon />}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* آمار کلی */}
      {attendanceData.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Typography variant="h6" color="white" gutterBottom>
                  تعداد کل دروس
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {attendanceData.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent>
                <Typography variant="h6" color="white" gutterBottom>
                  درصد حضور
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {Math.round(
                    (attendanceData.filter(r => r.status === 'present').length / 
                    attendanceData.length) * 100
                  )}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
