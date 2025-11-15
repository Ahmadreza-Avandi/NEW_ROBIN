import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Refresh, Security } from '@mui/icons-material';
import { AdminRoute } from '@/components/ProtectedRoute';
import { useRequireAdmin } from '@/hooks/useAuth';

interface Role {
  id: number;
  name: string;
  permissions: {
    viewPlaces: boolean;
    editPlaces: boolean;
    deletePlaces: boolean;
    viewPersons: boolean;
    editPersons: boolean;
    deletePersons: boolean;
    viewRoles: boolean;
    editRoles: boolean;
    deleteRoles: boolean;
  };
  createdAt: string;
}

export default function ViewRolePage() {
  const { user, loading } = useRequireAdmin();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchRoles();
    }
  }, [loading, user]);

  const fetchRoles = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        setError('خطا در دریافت نقش‌ها');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <AdminRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Security color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                مشاهده نقش‌ها و دسترسی‌ها
              </Typography>
            </Box>
            <Tooltip title="بروزرسانی">
              <IconButton onClick={fetchRoles} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>شناسه</strong></TableCell>
                  <TableCell><strong>نام نقش</strong></TableCell>
                  <TableCell><strong>مشاهده مکان‌ها</strong></TableCell>
                  <TableCell><strong>ویرایش مکان‌ها</strong></TableCell>
                  <TableCell><strong>حذف مکان‌ها</strong></TableCell>
                  <TableCell><strong>مشاهده افراد</strong></TableCell>
                  <TableCell><strong>ویرایش افراد</strong></TableCell>
                  <TableCell><strong>حذف افراد</strong></TableCell>
                  <TableCell><strong>مشاهده نقش‌ها</strong></TableCell>
                  <TableCell><strong>ویرایش نقش‌ها</strong></TableCell>
                  <TableCell><strong>حذف نقش‌ها</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <Typography color="text.secondary">
                        هیچ نقشی یافت نشد
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id} hover>
                      <TableCell>{role.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={role.name} 
                          color={role.id === 1 ? 'error' : role.id === 2 ? 'primary' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.viewPlaces ? 'دارد' : 'ندارد'} 
                          color={role.permissions.viewPlaces ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.editPlaces ? 'دارد' : 'ندارد'} 
                          color={role.permissions.editPlaces ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.deletePlaces ? 'دارد' : 'ندارد'} 
                          color={role.permissions.deletePlaces ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.viewPersons ? 'دارد' : 'ندارد'} 
                          color={role.permissions.viewPersons ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.editPersons ? 'دارد' : 'ندارد'} 
                          color={role.permissions.editPersons ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.deletePersons ? 'دارد' : 'ندارد'} 
                          color={role.permissions.deletePersons ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.viewRoles ? 'دارد' : 'ندارد'} 
                          color={role.permissions.viewRoles ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.editRoles ? 'دارد' : 'ندارد'} 
                          color={role.permissions.editRoles ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={role.permissions.deleteRoles ? 'دارد' : 'ندارد'} 
                          color={role.permissions.deleteRoles ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              تعداد کل: {roles.length} نقش
            </Typography>
          </Box>
        </Paper>
      </Container>
    </AdminRoute>
  );
}