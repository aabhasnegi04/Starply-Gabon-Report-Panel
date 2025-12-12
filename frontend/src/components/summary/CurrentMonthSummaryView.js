import React, { useState, useEffect } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SummarizeIcon from '@mui/icons-material/Summarize';
import RefreshIcon from '@mui/icons-material/Refresh';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

const CurrentMonthSummaryView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleExcelDownload = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    if (data.length > 0) {
      const summarySheet = XLSX.utils.json_to_sheet(
        data.map(item => ({
          'Sr No': item.SRNO || '',
          'Operation Name': item.OP_NAME || '',
          'Lot Count': item.LOT_COUNT || 0,
          'PCS': item.PCS || 0,
          'CBM': item.CBM || 0,
          'Avg Thickness': item.AVG_THICK || 0,
          'CBM Avg': item.CBM_AVG || 0,
          'Today Lot Count': item.TD_LOT_COUNT || 0,
          'Today PCS': item.TD_PCS || 0,
          'Today CBM': item.TD_CBM || 0,
          'Today Avg Thickness': item.TD_AVG_THICK || 0,
          'Today CBM Avg': item.TD_CBM_AVG || 0
        }))
      );
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Current Month Summary');
    }

    const currentDate = new Date();
    const monthYear = currentDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    XLSX.writeFile(wb, `Current_Month_Summary_${monthYear}.xlsx`);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/order/currentmonthsummary`);
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      const summaryData = apiData.data?.[0] || [];

      if (summaryData.length === 0) {
        setError('No data found for current month.');
        return;
      }

      setData(summaryData);
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentDate = new Date();
  const monthYear = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4, px: { xs: 1, md: 2 } }}>
      {/* Header Card */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(27, 67, 50, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faf9 100%)',
        border: '1px solid #e8f5e9'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" gap={2}>
            <Box display="flex" alignItems="center">
              <Box sx={{ 
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                borderRadius: 2,
                p: 1.5,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SummarizeIcon sx={{ fontSize: 28, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                  Current Month Summary
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  Production summary for {monthYear}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
              sx={{
                minWidth: { xs: '100%', md: 'auto' },
                width: { xs: '100%', md: 'auto' },
                borderRadius: 2,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderColor: '#1b4332',
                color: '#1b4332',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#0f2419',
                  backgroundColor: 'rgba(27, 67, 50, 0.05)',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Results Header with Download Button */}
      {data && (
        <Card sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          boxShadow: '0 4px 12px rgba(27, 67, 50, 0.2)',
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SummarizeIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Production Summary - {monthYear}
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                    <Chip 
                      label={`${data.length} operation${data.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        color: '#1b4332',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExcelDownload}
                sx={{
                  minWidth: { xs: '100%', md: 180 },
                  width: { xs: '100%', md: 'auto' },
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#1b4332',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    background: '#f1f8f4',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Download Excel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box textAlign="center" py={8}>
          <CircularProgress size={50} sx={{ color: '#1b4332' }} />
          <Typography variant="body1" sx={{ mt: 2, color: '#666', fontWeight: 500 }}>
            Loading current month summary...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1, border: '1px solid #f44336' }}>
          {error}
        </Alert>
      )}

      {/* Summary Table */}
      {data && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid #e8f5e9' }}>
          <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: { xs: 1600, md: 650 } }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    colSpan={7} 
                    sx={{ 
                      fontWeight: 700, 
                      textAlign: 'center', 
                      py: 2,
                      color: '#ffffff',
                      fontSize: '1rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                    }}
                  >
                    Month to Date (MTD)
                  </TableCell>
                  <TableCell 
                    colSpan={5} 
                    sx={{ 
                      fontWeight: 700, 
                      textAlign: 'center', 
                      py: 2,
                      color: '#ffffff',
                      fontSize: '1rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)',
                    }}
                  >
                    Today (TD)
                  </TableCell>
                </TableRow>
                <TableRow sx={{ background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    Sr No
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    Operation
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    Lot Count
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    PCS
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    CBM
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    Avg Thick
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '2px solid rgba(255, 255, 255, 0.4)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    CBM Avg
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    Lot Count
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    PCS
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    CBM
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    Avg Thick
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    CBM Avg
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8faf9',
                      '&:hover': {
                        backgroundColor: '#e8f5e9',
                        transform: 'scale(1.001)',
                        boxShadow: '0 2px 8px rgba(27, 67, 50, 0.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ textAlign: 'center', py: 1.5, fontWeight: 600, color: '#1b4332', fontSize: '0.85rem' }}>
                      {item.SRNO || ''}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'left', py: 1.5, color: '#333', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.OP_NAME || ''}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem' }}>
                      {item.LOT_COUNT?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem' }}>
                      {item.PCS?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem' }}>
                      {item.CBM ? parseFloat(item.CBM).toFixed(3) : '0.000'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem' }}>
                      {item.AVG_THICK ? parseFloat(item.AVG_THICK).toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem', borderRight: '2px solid #e0e0e0' }}>
                      {item.CBM_AVG ? parseFloat(item.CBM_AVG).toFixed(3) : '0.000'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.TD_LOT_COUNT?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.TD_PCS?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.TD_CBM ? parseFloat(item.TD_CBM).toFixed(3) : '0.000'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.TD_AVG_THICK ? parseFloat(item.TD_AVG_THICK).toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.TD_CBM_AVG ? parseFloat(item.TD_CBM_AVG).toFixed(3) : '0.000'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <Card sx={{ 
          p: 8, 
          textAlign: 'center', 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '2px dashed #d0e8d5'
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            borderRadius: '50%',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3
          }}>
            <SummarizeIcon sx={{ fontSize: 50, color: '#1b4332' }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1b4332', fontWeight: 700, mb: 1 }}>
            No Data Available
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
            No production data found for current month
          </Typography>
        </Card>
      )}
    </Container>
  );
};

export default CurrentMonthSummaryView;
