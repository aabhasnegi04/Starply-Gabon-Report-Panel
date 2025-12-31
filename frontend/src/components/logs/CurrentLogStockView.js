import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ForestIcon from '@mui/icons-material/Forest';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CurrentLogStockView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [year, setYear] = useState('');

  // Generate year options (current year and previous 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i <= 10; i++) {
    yearOptions.push(currentYear - i);
  }

  const handleExcelDownload = () => {
    if (!data || !data.length) return;

    const wb = XLSX.utils.book_new();

    if (data.length > 0) {
      const logStockSheet = XLSX.utils.json_to_sheet(
        data.map(item => ({
          'Month': item.LOGCUTTING_MONTH || '',
          'Month Name': item.MONTHS || '',
          'No of Logs': item.NO_OF_LOGS || 0,
          'No of Sections': item.NO_OF_SECTION || 0,
          'Cutting CBM': item.CUTTING_CBM || 0,
          'Bordereau Actual CBM': item.BORD_ACTUAL_CBM || 0,
          'Bordereau CBM': item.CBM_BORDEREAU || 0,
          'Gain/Loss': item.GAINLOSS || 0,
          'Gain/Loss %': item.GAINLOSS_PERCENT || 0
        }))
      );
      XLSX.utils.book_append_sheet(wb, logStockSheet, 'Current Log Stock');
    }

    XLSX.writeFile(wb, `Current_Log_Stock_${year}.xlsx`);
  };

  const sortDataByMonth = (data) => {
    // Month order mapping
    const monthOrder = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };

    return data.sort((a, b) => {
      const monthA = a.MONTHS || '';
      const monthB = b.MONTHS || '';
      
      // Get month order, default to 13 if month not found (puts unknown months at end)
      const orderA = monthOrder[monthA] || 13;
      const orderB = monthOrder[monthB] || 13;
      
      return orderA - orderB;
    });
  };

  const fetchData = async () => {
    if (!year) {
      setError('Please select a year');
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
          procedure: 'proc_getlogcuttingsumyear',
          parameters: {
            year: parseInt(year)
          }
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      let logStockData = apiData.data?.[0] || [];

      if (logStockData.length === 0) {
        setError('No data found for the selected year.');
        return;
      }

      // Sort data by month order
      logStockData = sortDataByMonth(logStockData);

      setData(logStockData);
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

    const totalLogs = data.reduce((sum, item) => sum + (parseFloat(item.NO_OF_LOGS) || 0), 0);
    const totalSections = data.reduce((sum, item) => sum + (parseFloat(item.NO_OF_SECTION) || 0), 0);
    const totalCuttingCBM = data.reduce((sum, item) => sum + (parseFloat(item.CUTTING_CBM) || 0), 0);
    const totalBordereauCBM = data.reduce((sum, item) => sum + (parseFloat(item.CBM_BORDEREAU) || 0), 0);
    const totalGainLoss = data.reduce((sum, item) => sum + (parseFloat(item.GAINLOSS) || 0), 0);
    
    const avgGainLossPercent = data.length > 0 
      ? data.reduce((sum, item) => sum + (parseFloat(item.GAINLOSS_PERCENT) || 0), 0) / data.length 
      : 0;

    const positiveMonths = data.filter(item => parseFloat(item.GAINLOSS || 0) > 0).length;
    const negativeMonths = data.filter(item => parseFloat(item.GAINLOSS || 0) < 0).length;

    return {
      totalLogs,
      totalSections,
      totalCuttingCBM,
      totalBordereauCBM,
      totalGainLoss,
      avgGainLossPercent,
      positiveMonths,
      negativeMonths,
      totalMonths: data.length
    };
  };

  // Prepare chart data
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return null;

    const months = data.map(item => item.MONTHS || item.LOGCUTTING_MONTH);
    const cuttingCBM = data.map(item => parseFloat(item.CUTTING_CBM) || 0);
    const bordereauCBM = data.map(item => parseFloat(item.CBM_BORDEREAU) || 0);
    const gainLoss = data.map(item => parseFloat(item.GAINLOSS) || 0);
    const logs = data.map(item => parseFloat(item.NO_OF_LOGS) || 0);

    return {
      months,
      cuttingCBM,
      bordereauCBM,
      gainLoss,
      logs
    };
  };

  // Get responsive values
  const isMobile = window.innerWidth < 768;
  const barThickness = isMobile ? 25 : undefined;
  const maxBarThickness = isMobile ? 40 : 50;
  const fontSize = isMobile ? 10 : 12;
  const tickFontSize = isMobile ? 9 : 11;
  const pointRadius = isMobile ? 4 : 6;
  const borderWidth = isMobile ? 2 : 3;

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
            <Box sx={{ 
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ForestIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Current Log Stock
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Monthly log cutting summary and stock analysis
              </Typography>
            </Box>
          </Box>

          {/* Year Filter */}
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel id="year-select-label">Select Year</InputLabel>
              <Select
                labelId="year-select-label"
                value={year}
                label="Select Year"
                onChange={(e) => setYear(e.target.value)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1b4332',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1b4332',
                    borderWidth: '2px',
                  },
                }}
              >
                {yearOptions.map((yearOption) => (
                  <MenuItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={fetchData}
              disabled={loading || !year}
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
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <CircularProgress size={48} sx={{ color: '#1b4332', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading log stock data...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please wait while we fetch the data for {year}
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
                <ForestIcon />
                Log Stock Data for {year} ({data.length} months)
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
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%',
                aspectRatio: { xs: '1', md: 'auto' }
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
                  <ForestIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalLogs)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Logs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%',
                aspectRatio: { xs: '1', md: 'auto' }
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
                  <BarChartIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalSections)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Sections
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: summaryStats.totalGainLoss >= 0 
                  ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%',
                aspectRatio: { xs: '1', md: 'auto' }
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
                  {summaryStats.totalGainLoss >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  )}
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalGainLoss)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Gain/Loss CBM
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
                width: '100%',
                aspectRatio: { xs: '1', md: 'auto' }
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
                  <PieChartIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {(summaryStats.avgGainLossPercent * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Avg Gain/Loss %
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
          {/* CBM Comparison Chart - Full Width */}
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
                Monthly CBM Analysis
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
                    key={`cbm-chart-${year}`}
                    data={{
                      labels: chartData.months,
                      datasets: [
                        {
                          label: 'Cutting CBM',
                          data: chartData.cuttingCBM,
                          backgroundColor: 'rgba(27, 67, 50, 0.8)',
                          borderColor: 'rgba(27, 67, 50, 1)',
                          borderWidth: 1,
                          barThickness: barThickness,
                          maxBarThickness: maxBarThickness,
                        },
                        {
                          label: 'Bordereau CBM',
                          data: chartData.bordereauCBM,
                          backgroundColor: 'rgba(45, 106, 79, 0.8)',
                          borderColor: 'rgba(45, 106, 79, 1)',
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
                          position: 'top',
                          labels: {
                            font: {
                              size: fontSize
                            }
                          }
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'CBM',
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
                            }
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

          {/* Gain/Loss Trend Line - Full Width */}
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
                Monthly Gain/Loss Trend
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
                  <Line
                    key={`trend-chart-${year}`}
                    data={{
                      labels: chartData.months,
                      datasets: [
                        {
                          label: 'Gain/Loss CBM',
                          data: chartData.gainLoss,
                          borderColor: 'rgba(255, 183, 77, 1)',
                          backgroundColor: 'rgba(255, 183, 77, 0.1)',
                          borderWidth: borderWidth,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: chartData.gainLoss.map(val => 
                            val >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
                          ),
                          pointBorderColor: chartData.gainLoss.map(val => 
                            val >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
                          ),
                          pointRadius: pointRadius,
                          pointHoverRadius: pointRadius + 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            font: {
                              size: fontSize
                            }
                          }
                        },
                      },
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: 'Gain/Loss CBM',
                            font: {
                              size: fontSize
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          },
                          ticks: {
                            font: {
                              size: tickFontSize
                            }
                          }
                        },
                        x: {
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          },
                          ticks: {
                            font: {
                              size: tickFontSize
                            }
                          }
                        },
                      },
                      elements: {
                        point: {
                          hoverBackgroundColor: 'rgba(255, 255, 255, 1)',
                        },
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

          {/* Monthly Log Count - Full Width */}
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
                Monthly Log Count
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
                    key={`log-count-chart-${year}`}
                    data={{
                      labels: chartData.months,
                      datasets: [
                        {
                          label: 'Number of Logs',
                          data: chartData.logs,
                          backgroundColor: 'rgba(123, 58, 237, 0.8)',
                          borderColor: 'rgba(123, 58, 237, 1)',
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
                            text: 'Count',
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
                            }
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

          {/* Gain/Loss Distribution - Full Width (No scroll needed for pie chart) */}
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
                Gain/Loss Distribution
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
                  key={`distribution-chart-${year}`}
                  data={{
                    labels: ['Positive Months', 'Negative Months'],
                    datasets: [
                      {
                        data: [summaryStats.positiveMonths, summaryStats.negativeMonths],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                        ],
                        borderColor: [
                          'rgba(16, 185, 129, 1)',
                          'rgba(239, 68, 68, 1)',
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
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Data Table */}
      {data && data.length > 0 && (
        <Card sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Month
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    No of Logs
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    No of Sections
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Cutting CBM
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Bordereau Actual CBM
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Bordereau CBM
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Gain/Loss
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Gain/Loss %
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                      '&:hover': { 
                        backgroundColor: '#e8f5e9',
                        transition: 'background-color 0.2s ease'
                      }
                    }}
                  >
                    <TableCell sx={{ 
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      {row.MONTHS || row.LOGCUTTING_MONTH}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {formatNumber(row.NO_OF_LOGS)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {formatNumber(row.NO_OF_SECTION)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {formatNumber(row.CUTTING_CBM)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {formatNumber(row.BORD_ACTUAL_CBM)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {formatNumber(row.CBM_BORDEREAU)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Chip 
                        label={formatNumber(row.GAINLOSS)}
                        color={parseFloat(row.GAINLOSS || 0) >= 0 ? 'success' : 'error'}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.8rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Chip 
                        label={formatPercentage(row.GAINLOSS_PERCENT)}
                        color={parseFloat(row.GAINLOSS_PERCENT || 0) >= 0 ? 'success' : 'error'}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.8rem'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Empty State */}
      {data && data.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <ForestIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No log stock data found for {year}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try selecting a different year or check if data exists for this period.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default CurrentLogStockView;