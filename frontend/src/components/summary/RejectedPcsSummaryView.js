import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Grid, IconButton, Tabs, Tab
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const RejectedPcsSummaryView = ({ onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExcelDownload = () => {
    if (!data || !data.length) return;

    const wb = XLSX.utils.book_new();

    // Detailed Rejection Data Sheet
    if (data[0] && data[0].length > 0) {
      const detailedData = data[0].map(item => ({
        'Sr No': item.SRNO || '',
        'Process': item.PROCESS || '',
        'Quality': item.QUALITY || '',
        'Thickness': item.THICKNESS || 0,
        'Size Set': item.SIZESET || '',
        'Length': item.LENGTH || 0,
        'Width': item.WIDTH || 0,
        'PCS': item.PCS || 0,
        'CBM': item.CBM || 0
      }));
      
      const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, detailedSheet, 'Detailed Rejection Data');
    }

    // Process Summary Sheet
    if (data[1] && data[1].length > 0) {
      const summaryData = data[1].map(item => ({
        'Sr No': item.SRNO || '',
        'Process': item.PROCESS || '',
        'PCS': item.PCS || 0,
        'CBM': item.CBM || 0,
        'PCS %': ((item.PCS_P || 0) * 100).toFixed(2) + '%',
        'CBM %': ((item.CBM_P || 0) * 100).toFixed(2) + '%'
      }));
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Process Summary');
    }

    const dateStr = fromDate && toDate 
      ? `${fromDate.format('YYYY-MM-DD')}_to_${toDate.format('YYYY-MM-DD')}`
      : new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Rejected_PCS_Summary_${dateStr}.xlsx`);
  };

  const fetchData = async () => {
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates');
      return;
    }

    if (toDate.isBefore(fromDate)) {
      setError('To date must be after from date');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/order/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedure: 'proc_hotpressReject',
          parameters: {
            from_date: fromDate.format('YYYY-MM-DD'),
            to_date: toDate.format('YYYY-MM-DD')
          }
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      if (!apiData.data || apiData.data.length === 0) {
        setError('No rejection data found for the selected date range.');
        return;
      }

      setData(apiData.data);
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined) return '0.00%';
    return (parseFloat(num) * 100).toFixed(2) + '%';
  };

  // Calculate summary statistics
  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return null;

    const summaryData = data[1] || [];
    const detailedData = data[0] || [];

    // Filter out total rows
    const processData = summaryData.filter(item => 
      item.SRNO && item.PROCESS && !item.PROCESS.includes('TOTAL')
    );

    const totalPCS = summaryData.find(item => 
      item.PROCESS && item.PROCESS.includes('TOTAL')
    )?.PCS || 0;

    const totalCBM = summaryData.find(item => 
      item.PROCESS && item.PROCESS.includes('TOTAL')
    )?.CBM || 0;

    // Find highest rejection process
    const highestRejectionProcess = processData.reduce((max, item) => 
      (parseFloat(item.PCS) || 0) > (parseFloat(max.PCS) || 0) ? item : max
    , processData[0] || {});

    // Count unique qualities and processes
    const uniqueQualities = [...new Set(detailedData.map(item => item.QUALITY).filter(Boolean))].length;
    const uniqueProcesses = processData.length;

    return {
      totalPCS,
      totalCBM,
      uniqueQualities,
      uniqueProcesses,
      highestRejectionProcess: highestRejectionProcess?.PROCESS || 'N/A',
      highestRejectionPCS: highestRejectionProcess?.PCS || 0
    };
  };

  // Prepare chart data
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return null;

    const summaryData = data[1] || [];
    const detailedData = data[0] || [];

    // Filter out total rows for charts
    const processData = summaryData.filter(item => 
      item.SRNO && item.PROCESS && !item.PROCESS.includes('TOTAL')
    );

    // Process-wise rejection data
    const processLabels = processData.map(item => 
      item.PROCESS ? item.PROCESS.replace(' REJECTION', '').replace(' POSITION', '') : 'Unknown'
    );
    const processPCS = processData.map(item => parseFloat(item.PCS) || 0);
    const processCBM = processData.map(item => parseFloat(item.CBM) || 0);

    // Quality-wise aggregation
    const qualityData = {};
    detailedData.forEach(item => {
      if (item.QUALITY && item.PCS) {
        const quality = item.QUALITY;
        qualityData[quality] = (qualityData[quality] || 0) + (parseFloat(item.PCS) || 0);
      }
    });

    // Thickness-wise aggregation
    const thicknessData = {};
    detailedData.forEach(item => {
      if (item.THICKNESS && item.PCS) {
        const thickness = `${item.THICKNESS}mm`;
        thicknessData[thickness] = (thicknessData[thickness] || 0) + (parseFloat(item.PCS) || 0);
      }
    });

    // Rejection severity categories (based on PCS count)
    const totalPCS = processPCS.reduce((sum, val) => sum + val, 0);
    const highRejection = processData.filter(item => (parseFloat(item.PCS) || 0) > totalPCS * 0.2).length;
    const mediumRejection = processData.filter(item => {
      const pcs = parseFloat(item.PCS) || 0;
      return pcs > totalPCS * 0.1 && pcs <= totalPCS * 0.2;
    }).length;
    const lowRejection = processData.filter(item => (parseFloat(item.PCS) || 0) <= totalPCS * 0.1).length;

    return {
      processPCS: {
        labels: processLabels,
        data: processPCS
      },
      processCBM: {
        labels: processLabels,
        data: processCBM
      },
      quality: {
        labels: Object.keys(qualityData),
        data: Object.values(qualityData)
      },
      thickness: {
        labels: Object.keys(thicknessData),
        data: Object.values(thicknessData)
      },
      severity: {
        labels: ['High Rejection', 'Medium Rejection', 'Low Rejection'],
        data: [highRejection, mediumRejection, lowRejection]
      }
    };
  };

  // Get responsive values
  const isMobile = window.innerWidth < 768;
  const barThickness = isMobile ? 25 : undefined;
  const maxBarThickness = isMobile ? 40 : 50;
  const fontSize = isMobile ? 10 : 12;
  const tickFontSize = isMobile ? 9 : 11;

  const summaryStats = data ? calculateSummaryStats(data) : null;
  const chartData = data ? prepareChartData(data) : null;

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
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ReportProblemIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Rejected PCS Summary
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Production rejection analysis across all processes
              </Typography>
            </Box>
          </Box>

          {/* Date Range Filter */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                maxDate={dayjs()}
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
                  }
                }}
              />
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                maxDate={dayjs()}
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
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  color: '#ffffff',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)',
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

      {/* Loading State */}
      {loading && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <CircularProgress size={48} sx={{ color: '#dc2626', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading rejection data...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please wait while we analyze the rejection data for {fromDate?.format('DD/MM/YYYY')} to {toDate?.format('DD/MM/YYYY')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontSize: '0.95rem'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Results Header with Download Button */}
      {data && (
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)',
          boxShadow: '0 4px 12px rgba(255, 183, 77, 0.3)'
        }}>
          <CardContent sx={{ py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography variant="h6" sx={{ 
                color: '#ffffff', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <ReportProblemIcon />
                Rejection Summary from {fromDate?.format('DD/MM/YYYY')} to {toDate?.format('DD/MM/YYYY')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExcelDownload}
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#ffa726',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Download Excel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Cards */}
      {summaryStats && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <ReportProblemIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalPCS)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Rejected PCS
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <AssessmentIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalCBM)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Rejected CBM
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <PrecisionManufacturingIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.uniqueProcesses}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Rejection Processes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <WarningIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.uniqueQualities}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Affected Qualities
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Charts Section */}
      {chartData && (
        <Box sx={{ mb: 4 }}>
          {/* Process-wise Rejection PCS Chart */}
          <Card sx={{ 
            borderRadius: 2, 
            height: { xs: '300px', md: '400px' }, 
            mb: 3,
            mx: 'auto',
            maxWidth: '100%'
          }}>
            <CardContent sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: '#1b4332',
                textAlign: 'center',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Process-wise Rejection (PCS)
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 40px)',
                overflowX: { xs: 'auto', md: 'visible' },
                overflowY: 'hidden',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}>
                <Box sx={{ 
                  minWidth: { xs: '900px', md: '100%' },
                  height: '100%'
                }}>
                  <Bar
                    key={`process-pcs-chart`}
                    data={{
                      labels: chartData.processPCS.labels,
                      datasets: [
                        {
                          label: 'Rejected PCS',
                          data: chartData.processPCS.data,
                          backgroundColor: 'rgba(220, 38, 38, 0.8)',
                          borderColor: 'rgba(220, 38, 38, 1)',
                          borderWidth: 1,
                          barThickness: barThickness,
                          maxBarThickness: maxBarThickness,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Rejected PCS',
                            font: {
                              size: fontSize
                            }
                          },
                          ticks: {
                            font: {
                              size: tickFontSize
                            }
                          }
                        },
                        x: {
                          ticks: {
                            font: {
                              size: tickFontSize
                            },
                            maxRotation: 45
                          }
                        }
                      },
                      layout: {
                        padding: {
                          left: isMobile ? 5 : 10,
                          right: isMobile ? 5 : 10,
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Quality-wise Rejection Distribution */}
          <Card sx={{ 
            borderRadius: 2, 
            height: { xs: '300px', md: '400px' }, 
            mb: 3,
            mx: 'auto',
            maxWidth: '100%'
          }}>
            <CardContent sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: '#1b4332',
                textAlign: 'center',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Quality-wise Rejection Distribution
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 40px)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                maxWidth: { xs: '250px', md: '350px' },
                mx: 'auto'
              }}>
                <Pie
                  key={`quality-chart`}
                  data={{
                    labels: chartData.quality.labels,
                    datasets: [
                      {
                        data: chartData.quality.data,
                        backgroundColor: [
                          'rgba(220, 38, 38, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(248, 113, 113, 0.8)',
                          'rgba(252, 165, 165, 0.8)',
                          'rgba(254, 202, 202, 0.8)',
                          'rgba(245, 159, 11, 0.8)',
                        ],
                        borderColor: [
                          'rgba(220, 38, 38, 1)',
                          'rgba(239, 68, 68, 1)',
                          'rgba(248, 113, 113, 1)',
                          'rgba(252, 165, 165, 1)',
                          'rgba(254, 202, 202, 1)',
                          'rgba(245, 159, 11, 1)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: fontSize
                          },
                          padding: isMobile ? 10 : 20
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} PCS (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Thickness-wise Rejection Distribution */}
          <Card sx={{ 
            borderRadius: 2, 
            height: { xs: '300px', md: '400px' }, 
            mb: 3,
            mx: 'auto',
            maxWidth: '100%'
          }}>
            <CardContent sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: '#1b4332',
                textAlign: 'center',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Thickness-wise Rejection Distribution
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 40px)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                maxWidth: { xs: '250px', md: '350px' },
                mx: 'auto'
              }}>
                <Doughnut
                  key={`thickness-chart`}
                  data={{
                    labels: chartData.thickness.labels,
                    datasets: [
                      {
                        data: chartData.thickness.data,
                        backgroundColor: [
                          'rgba(245, 159, 11, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                          'rgba(252, 211, 77, 0.8)',
                          'rgba(253, 230, 138, 0.8)',
                          'rgba(254, 243, 199, 0.8)',
                          'rgba(220, 38, 38, 0.8)',
                        ],
                        borderColor: [
                          'rgba(245, 159, 11, 1)',
                          'rgba(251, 191, 36, 1)',
                          'rgba(252, 211, 77, 1)',
                          'rgba(253, 230, 138, 1)',
                          'rgba(254, 243, 199, 1)',
                          'rgba(220, 38, 38, 1)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: fontSize
                          },
                          padding: isMobile ? 10 : 20
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} PCS (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Data Tables with Tabs */}
      {data && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Process Summary" />
              <Tab label="Detailed Rejection Data" />
            </Tabs>
          </Box>

          {/* Process Summary Table */}
          <TabPanel value={tabValue} index={0}>
            {data[1] && data[1].length > 0 && (
              <TableContainer sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Sr No
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Process
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        PCS
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        CBM
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        PCS %
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        CBM %
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data[1].map((row, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                          '&:hover': { 
                            backgroundColor: '#fee2e2',
                            transition: 'background-color 0.2s ease'
                          },
                          backgroundColor: row.PROCESS && row.PROCESS.includes('TOTAL') ? '#fef2f2' : 'inherit',
                          fontWeight: row.PROCESS && row.PROCESS.includes('TOTAL') ? 600 : 400
                        }}
                      >
                        <TableCell sx={{ 
                          fontWeight: row.PROCESS && row.PROCESS.includes('TOTAL') ? 600 : 500,
                          fontSize: '0.9rem',
                          borderBottom: '1px solid #e0e0e0'
                        }}>
                          {row.SRNO || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: row.PROCESS && row.PROCESS.includes('TOTAL') ? 600 : 400,
                          fontSize: '0.9rem', 
                          borderBottom: '1px solid #e0e0e0' 
                        }}>
                          {row.PROCESS || ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatNumber(row.PCS)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatNumber(row.CBM)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatPercentage(row.PCS_P)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatPercentage(row.CBM_P)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Detailed Rejection Data Table */}
          <TabPanel value={tabValue} index={1}>
            {data[0] && data[0].length > 0 && (
              <TableContainer sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Sr No
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Process
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Quality
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Thickness
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Size Set
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Length
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Width
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        PCS
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#dc2626', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        CBM
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data[0].map((row, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                          '&:hover': { 
                            backgroundColor: '#fee2e2',
                            transition: 'background-color 0.2s ease'
                          },
                          backgroundColor: row.PROCESS && row.PROCESS.includes('TOTAL') ? '#fef2f2' : 'inherit'
                        }}
                      >
                        <TableCell sx={{ 
                          fontWeight: row.PROCESS && row.PROCESS.includes('TOTAL') ? 600 : 500,
                          fontSize: '0.9rem',
                          borderBottom: '1px solid #e0e0e0'
                        }}>
                          {row.SRNO || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: row.PROCESS && row.PROCESS.includes('TOTAL') ? 600 : 400,
                          fontSize: '0.9rem', 
                          borderBottom: '1px solid #e0e0e0' 
                        }}>
                          {row.PROCESS || ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {row.QUALITY || ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {row.THICKNESS ? `${row.THICKNESS}mm` : ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {row.SIZESET || ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatNumber(row.LENGTH)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatNumber(row.WIDTH)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatNumber(row.PCS)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatNumber(row.CBM)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Card>
      )}

      {/* Empty State */}
      {data && data.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <ReportProblemIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No rejection data found for the selected date range
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try selecting a different date range or check if production data exists for this period.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default RejectedPcsSummaryView;