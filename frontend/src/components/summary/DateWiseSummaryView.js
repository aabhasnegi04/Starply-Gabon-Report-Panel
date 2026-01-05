import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

const DateWiseSummaryView = ({ onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

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
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Date Wise Summary');
    }

    const dateRange = `${fromDate.format('YYYY-MM-DD')}_to_${toDate.format('YYYY-MM-DD')}`;
    XLSX.writeFile(wb, `Date_Wise_Summary_${dateRange}.xlsx`);
  };

  const fetchData = async () => {
    if (!fromDate || !toDate) {
      setError('Please select both From Date and To Date');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/order/datewisesummary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_date: fromDate.format('YYYY-MM-DD'),
          to_date: toDate.format('YYYY-MM-DD')
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      const summaryData = apiData.data?.[0] || [];

      if (summaryData.length === 0) {
        setError('No data found for the selected date range.');
        return;
      }

      setData(summaryData);
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

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
          <Box display="flex" alignItems="center" mb={3}>
            {onBackClick && (
              <IconButton 
                onClick={onBackClick}
                sx={{ 
                  mr: 2, 
                  color: '#1b4332',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DateRangeIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Date Wise Summary
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Production summary for custom date range
              </Typography>
            </Box>
          </Box>

          {/* Date Filters */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        '&:hover fieldset': {
                          borderColor: '#1b4332',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1b4332',
                          borderWidth: '2px',
                        },
                      },
                    }
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(27, 67, 50, 0.15)',
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: '#1b4332',
                          '&:hover': {
                            backgroundColor: '#0f2419',
                          },
                        },
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#1b4332',
                      },
                    }
                  }
                }}
              />
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                minDate={fromDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        '&:hover fieldset': {
                          borderColor: '#1b4332',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1b4332',
                          borderWidth: '2px',
                        },
                      },
                    }
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(27, 67, 50, 0.15)',
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: '#1b4332',
                          '&:hover': {
                            backgroundColor: '#0f2419',
                          },
                        },
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#1b4332',
                      },
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={fetchData}
                disabled={loading || !fromDate || !toDate}
                sx={{
                  minWidth: { xs: '100%', md: 160 },
                  width: { xs: '100%', md: 'auto' },
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                  color: '#ffffff',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0f2419 0%, #1b4332 100%)',
                    boxShadow: '0 6px 16px rgba(27, 67, 50, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Search
              </Button>
            </Box>
          </LocalizationProvider>
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
                  <DateRangeIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Production Summary
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mt={0.5} flexWrap="wrap">
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {fromDate?.format('MMM DD, YYYY')} to {toDate?.format('MMM DD, YYYY')}
                    </Typography>
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
            Loading date wise summary...
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
                    Date Range Summary
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
                    Last Day (TD)
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
            <DateRangeIcon sx={{ fontSize: 50, color: '#1b4332' }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1b4332', fontWeight: 700, mb: 1 }}>
            Select Date Range
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
            Choose from and to dates to view production summary
          </Typography>
        </Card>
      )}
    </Container>
  );
};

export default DateWiseSummaryView;
